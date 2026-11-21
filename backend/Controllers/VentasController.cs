using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using backend.DTOs;
using backend.Models;
using System.Text.Json.Nodes;


namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VentasController : ControllerBase
{
    private readonly AppDbContext _context;

    public VentasController(AppDbContext context)
    {
        _context = context;
    }

    // Precio de un producto tal como lo muestra el catálogo: el de Caracteristicas ("precio") menos el
    // descuento de la oferta, si está activa y hoy está dentro de sus fechas.
    private static int PrecioProducto(producto p)
    {
        decimal precio = 0;
        if (!string.IsNullOrWhiteSpace(p.caracteristicas))
        {
            try
            {
                using var json = JsonDocument.Parse(p.caracteristicas);
                if (json.RootElement.TryGetProperty("precio", out var elemento) && elemento.TryGetDecimal(out var valor))
                    precio = valor;
            }
            catch (JsonException) { }
        }

        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var oferta = p.id_ofertaNavigation;
        var vigente = oferta != null
            && oferta.estado == true
            && (p.fechainicio == null || p.fechainicio <= hoy)
            && (p.fechafin == null || hoy <= p.fechafin);

        if (vigente)
            precio *= 1 - (decimal)oferta!.preciooferta; // PrecioOferta guarda el descuento (0.15 = 15 %)

        return (int)Math.Round(precio, MidpointRounding.AwayFromZero);
    }

    // Precio de un servicio: lo pone cada vendedor en la tabla Valorar.
    private static int PrecioServicio(servicio s, List<valorar> precios)
    {
        var vendedor = s.ofrecer2s.FirstOrDefault()?.id_usuario;
        var propio = precios.FirstOrDefault(v => v.id_servicio == s.id && v.id_usuario == vendedor);
        if (propio != null) return propio.precio;

        return precios.FirstOrDefault(v => v.id_servicio == s.id)?.precio ?? 0;
    }

    // POST: api/ventas (Checkout)
    [HttpPost]
    public async Task<IActionResult> CrearVenta([FromBody] VentaCreateDto dto)
    {
        var rutCliente = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rutCliente))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        // Compra con una cotización aceptada: se paga lo cotizado y no se toca el carrito
        if (dto.id_cotizacion.HasValue)
            return await CrearVentaDesdeCotizacion(dto, rutCliente);

        // 1. Buscar el carrito del usuario (con la oferta y el vendedor de cada producto/servicio)
        var itemsProductos = await _context.crear3s
            .Include(c => c.id_productoNavigation).ThenInclude(p => p.id_ofertaNavigation)
            .Include(c => c.id_productoNavigation).ThenInclude(p => p.ofrecer1s)
            .Where(c => c.id_usuario == rutCliente)
            .ToListAsync();

        var itemsServicios = await _context.crear4s
            .Include(c => c.id_servicioNavigation).ThenInclude(s => s.ofrecer2s)
            .Where(c => c.id_usuario == rutCliente)
            .ToListAsync();

        if (!itemsProductos.Any() && !itemsServicios.Any())
            return BadRequest(new { success = false, message = "El carrito está vacío." });

        // Restricción de edad: si algún producto o servicio es solo para mayores de 18, se valida con la
        // fecha de nacimiento del cliente
        var tieneRestriccion = itemsProductos.Any(i => i.id_productoNavigation.restriccionedad == true)
                               || itemsServicios.Any(i => i.id_servicioNavigation.restriccionedad == true);
        if (tieneRestriccion)
        {
            var cliente = await _context.usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.rut == rutCliente);
            DateOnly? nacimiento = cliente?.fechanacimiento;
            var hoy = DateOnly.FromDateTime(DateTime.Today);
            var edad = 0;
            if (nacimiento is DateOnly nac)
            {
                edad = hoy.Year - nac.Year;
                if (hoy < nac.AddYears(edad)) edad--;
            }
            if (edad < 18)
                return BadRequest(new { success = false, message = "Tu carrito incluye productos o servicios solo para mayores de 18 años." });
        }

        // Nadie puede comprarse a sí mismo: la base de datos rechaza ventas donde el cliente y el vendedor
        // son la misma persona (restricción chk_venta_vendedor_cliente). Se revisa antes de empezar
        // para avisar con un mensaje claro en vez de un error de la base de datos.
        var vendedoresProductos = itemsProductos.Select(i => i.id_productoNavigation.ofrecer1s.FirstOrDefault()?.id_usuario);
        var vendedoresServicios = itemsServicios.Select(i => i.id_servicioNavigation.ofrecer2s.FirstOrDefault()?.id_usuario);
        var vendedoresCarrito = vendedoresProductos.Concat(vendedoresServicios).ToList();

        if (vendedoresCarrito.Any(v => v == rutCliente))
            return BadRequest(new { success = false, message = "Tu carrito incluye productos o servicios que tú mismo vendes. Quítalos del carrito para poder pagar." });
        if (vendedoresCarrito.Any(v => string.IsNullOrEmpty(v)))
            return BadRequest(new { success = false, message = "Hay productos o servicios en tu carrito sin vendedor asignado. Quítalos para poder pagar." });

        // Precios de los servicios: los pone cada vendedor en la tabla Valorar (igual que en el catálogo)
        var idsServicios = itemsServicios.Select(i => i.id_servicio).ToList();
        var preciosServicio = await _context.valorars
            .AsNoTracking()
            .Where(v => idsServicios.Contains(v.id_servicio))
            .ToListAsync();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 2. Calcular Totales con el mismo precio que muestra el catálogo (con la oferta vigente aplicada)
            int netoTotal = 0;

            foreach (var item in itemsProductos)
                netoTotal += PrecioProducto(item.id_productoNavigation) * item.cantidad;

            foreach (var item in itemsServicios)
                netoTotal += PrecioServicio(item.id_servicioNavigation, preciosServicio) * item.cantidad;

            // El IVA en Chile es 19% (0.19). El precio asumimos que es NETO.
            decimal ivaDecimal = 0.19m;
            // Si el precio del frontend ya incluye IVA, esta formula cambia. Asumiremos que es Neto.

            // 3. Crear el Pago
            var nuevoPago = new pago
            {
                mediopago = dto.mediopago,
                ult4digitostarjeta = dto.ult4digitostarjeta,
                codigotransferencia = dto.codigotransferencia
            };
            _context.pagos.Add(nuevoPago);
            await _context.SaveChangesAsync(); // Obtenemos el ID del pago

            // 4. Crear la Venta
            var nuevaVenta = new ventum
            {
                neto = netoTotal,
                iva = ivaDecimal,
                fecha = DateTime.Today,
                requieredespacho = dto.requieredespacho,
                estado = "Pagado",
                id_vendedor = itemsProductos.FirstOrDefault()?.id_productoNavigation.ofrecer1s.FirstOrDefault()?.id_usuario 
                              ?? itemsServicios.FirstOrDefault()?.id_servicioNavigation.ofrecer2s.FirstOrDefault()?.id_usuario 
                              ?? rutCliente, // Fallback por si acaso
                id_cliente = rutCliente,
                nota = dto.nota
            };
            _context.venta.Add(nuevaVenta);
            await _context.SaveChangesAsync(); // Obtenemos el ID de la venta

            // 5. Mover Productos a Generar3
            foreach (var item in itemsProductos)
            {
                var precio = PrecioProducto(item.id_productoNavigation);

                var detalle = new generar3
                {
                    id_venta = nuevaVenta.id,
                    id_producto = item.id_producto,
                    cantidad = item.cantidad,
                    totalfinal = precio * item.cantidad,
                    id_pago = nuevoPago.id
                };
                _context.generar3s.Add(detalle);
            }

            // 6. Mover Servicios a Generar4
            foreach (var item in itemsServicios)
            {
                var precio = PrecioServicio(item.id_servicioNavigation, preciosServicio);

                var detalle = new generar4
                {
                    id_venta = nuevaVenta.id,
                    id_servicio = item.id_servicio,
                    cantidad = item.cantidad,
                    totalfinal = precio * item.cantidad,
                    id_pago = nuevoPago.id
                };
                _context.generar4s.Add(detalle);
            }

            // 7. Crear Despacho si se requiere
            if (dto.requieredespacho && dto.id_direccion.HasValue)
            {
                var nuevoDespacho = new despacho
                {
                    estado = "En Preparación",
                    id_direccion = dto.id_direccion.Value,
                    datoslogisticos = "{}" // Puedes agregar peso/dimensiones aquí
                };
                _context.despachos.Add(nuevoDespacho);
                await _context.SaveChangesAsync();

                var generar2 = new generar2
                {
                    id_usuario = rutCliente,
                    id_despacho = nuevoDespacho.id,
                    id_venta = nuevaVenta.id
                };
                _context.generar2s.Add(generar2);
            }

            // 8. Limpiar el Carrito
            _context.crear3s.RemoveRange(itemsProductos);
            _context.crear4s.RemoveRange(itemsServicios);

            // Guardar todos los cambios de la transacción
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { 
                success = true, 
                message = "Venta realizada con éxito.", 
                data = new { id_venta = nuevaVenta.id, total_pagado = netoTotal + (netoTotal * 0.19m) }, 
                errors = (object?)null 
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error al procesar la venta.", errors = new[] { ex.InnerException?.Message ?? ex.Message } });
        }
    }

    

    // Compra a partir de una cotización respondida o aceptada y vigente: se paga lo que quedó cotizado (ítems,
    // cantidades y precios de Solicitar1 y Solicitar2) y no se usa ni se vacía el carrito. Comprar con una cotización
    // "Respondida" la acepta en el mismo paso. Queda "Comprada" para que no se pueda usar dos veces.
    private async Task<IActionResult> CrearVentaDesdeCotizacion(VentaCreateDto dto, string rutCliente)
    {
        var cot = await _context.cotizacions
            .Include(c => c.solicitar1s).ThenInclude(s => s.id_productoNavigation).ThenInclude(p => p.ofrecer1s)
            .Include(c => c.solicitar2s).ThenInclude(s => s.id_servicioNavigation)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.id == dto.id_cotizacion!.Value);

        var productos = cot?.solicitar1s.Where(s => s.id_usuario == rutCliente).ToList() ?? new List<solicitar1>();
        var servicios = cot?.solicitar2s.Where(s => s.id_usuario == rutCliente).ToList() ?? new List<solicitar2>();

        // Solo el cliente que la pidió puede comprarla (a los demás se les responde como si no existiera)
        if (cot == null || (productos.Count == 0 && servicios.Count == 0))
            return NotFound(new { success = false, message = "Cotización no encontrada." });

        if (cot.estado == "Comprada")
            return BadRequest(new { success = false, message = "Esta cotización ya fue utilizada en una compra." });
        if (cot.estado != "Respondida" && cot.estado != "Aprobada" && cot.estado != "Aceptada")
            return BadRequest(new { success = false, message = "Solo puedes comprar con una cotización respondida o aceptada." });

        // La cotización vale 15 días desde que se respondió o se aceptó
        var hoyFecha = DateOnly.FromDateTime(DateTime.Today);
        if (hoyFecha > (cot.fechaultimaactualizacion ?? cot.fechacreacion).AddDays(15))
            return BadRequest(new { success = false, message = "La cotización venció. Solicita una nueva." });

        if (productos.Any(p => p.precio <= 0) || servicios.Any(s => s.precio <= 0))
            return BadRequest(new { success = false, message = "La cotización tiene ítems sin precio. Solicita una nueva." });

        // Stock: el de un producto es la suma de Almacenar en todos los inventarios, igual que lo descuentan los
        // triggers al pagar. Se revisa antes para avisar con un mensaje claro (los servicios no tienen stock).
        var idsProductos = productos.Select(p => p.id_producto).ToList();
        var stockPorProducto = await _context.almacenars
            .AsNoTracking()
            .Where(a => idsProductos.Contains(a.id_producto))
            .GroupBy(a => a.id_producto)
            .Select(g => new { id = g.Key, total = g.Sum(a => a.stockactual) })
            .ToListAsync();

        var sinStock = productos
            .Select(p => new
            {
                nombre = p.id_productoNavigation.nombre,
                pedido = p.cantidad,
                disponible = stockPorProducto.FirstOrDefault(s => s.id == p.id_producto)?.total ?? 0
            })
            .Where(x => x.disponible < x.pedido)
            .ToList();

        if (sinStock.Count > 0)
            return BadRequest(new
            {
                success = false,
                message = "No hay stock suficiente: "
                    + string.Join("; ", sinStock.Select(x => $"«{x.nombre}» (cotizaste {x.pedido}, quedan {x.disponible})"))
                    + "."
            });

        // Restricción de edad (igual que con el carrito)
        var tieneRestriccion = productos.Any(p => p.id_productoNavigation.restriccionedad == true)
                               || servicios.Any(s => s.id_servicioNavigation.restriccionedad == true);
        if (tieneRestriccion)
        {
            var cliente = await _context.usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.rut == rutCliente);
            var edad = 0;
            if (cliente?.fechanacimiento is DateOnly nac)
            {
                edad = hoyFecha.Year - nac.Year;
                if (hoyFecha < nac.AddYears(edad)) edad--;
            }
            if (edad < 18)
                return BadRequest(new { success = false, message = "Esta cotización incluye productos o servicios solo para mayores de 18 años." });
        }

        // El vendedor es el oferente de la cotización (servicios) o quien ofrece el producto
        string? vendedor = servicios.Select(s => s.id_oferente).FirstOrDefault();
        if (vendedor == null)
            vendedor = productos.Select(p => p.id_productoNavigation.ofrecer1s.FirstOrDefault()?.id_usuario).FirstOrDefault(v => v != null);
        if (string.IsNullOrEmpty(vendedor))
            return BadRequest(new { success = false, message = "La cotización no tiene un vendedor asignado." });
        if (vendedor == rutCliente)
            return BadRequest(new { success = false, message = "No puedes comprar tus propios productos o servicios." });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            int netoTotal = productos.Sum(p => p.precio * p.cantidad) + servicios.Sum(s => s.precio * s.cantidad);

            var nuevoPago = new pago
            {
                mediopago = dto.mediopago,
                ult4digitostarjeta = dto.ult4digitostarjeta,
                codigotransferencia = dto.codigotransferencia
            };
            _context.pagos.Add(nuevoPago);
            await _context.SaveChangesAsync();

            var nuevaVenta = new ventum
            {
                neto = netoTotal,
                iva = 0.19m,
                fecha = DateTime.Today,
                requieredespacho = dto.requieredespacho,
                estado = "Pagado",
                id_vendedor = vendedor,
                id_cliente = rutCliente,
                nota = dto.nota
            };
            _context.venta.Add(nuevaVenta);
            await _context.SaveChangesAsync();

            foreach (var item in productos)
            {
                _context.generar3s.Add(new generar3
                {
                    id_venta = nuevaVenta.id,
                    id_producto = item.id_producto,
                    cantidad = item.cantidad,
                    totalfinal = item.precio * item.cantidad,
                    id_pago = nuevoPago.id
                });
            }

            foreach (var item in servicios)
            {
                _context.generar4s.Add(new generar4
                {
                    id_venta = nuevaVenta.id,
                    id_servicio = item.id_servicio,
                    cantidad = item.cantidad,
                    totalfinal = item.precio * item.cantidad,
                    id_pago = nuevoPago.id
                });
            }

            if (dto.requieredespacho && dto.id_direccion.HasValue)
            {
                var nuevoDespacho = new despacho
                {
                    estado = "En Preparación",
                    id_direccion = dto.id_direccion.Value,
                    datoslogisticos = "{}"
                };
                _context.despachos.Add(nuevoDespacho);
                await _context.SaveChangesAsync();

                _context.generar2s.Add(new generar2
                {
                    id_usuario = rutCliente,
                    id_despacho = nuevoDespacho.id,
                    id_venta = nuevaVenta.id
                });
            }

            // La cotización ya se usó
            cot.estado = "Comprada";
            cot.fechaultimaactualizacion = hoyFecha;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                message = "Venta realizada con éxito.",
                data = new { id_venta = nuevaVenta.id, total_pagado = netoTotal + (netoTotal * 0.19m) },
                errors = (object?)null
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error al procesar la venta.", errors = new[] { ex.InnerException?.Message ?? ex.Message } });
        }
    }

    // GET: api/ventas/mis-compras (Cliente)
    [HttpGet("mis-compras")]
    public async Task<IActionResult> GetMisCompras()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(rut))
            return Unauthorized();

        var ventas = await _context.venta
            .Where(v => v.id_cliente == rut)
            .OrderByDescending(v => v.fecha)
            .Select(v => new
            {
                id_venta = v.id,
                fecha = v.fecha,
                neto = v.neto,
                iva = v.iva,
                estado = v.estado,

                productos = v.generar3s.Select(g => new
                {
                    id = g.id_producto,
                    nombre = g.id_productoNavigation.nombre,
                    cantidad = g.cantidad,
                    total = g.totalfinal,
                    imagen = g.id_productoNavigation.rutaimagen
                }).ToList(),

                servicios = v.generar4s.Select(g => new
                {
                    id = g.id_servicio,
                    nombre = g.id_servicioNavigation.nombre,
                    cantidad = g.cantidad,
                    total = g.totalfinal,
                    imagen = g.id_servicioNavigation.rutaimagen
                }).ToList()
            })
            .ToListAsync();

        var compras = ventas.Select(v => new
        {
            id_venta = v.id_venta,
            fecha = v.fecha,
            neto = v.neto,
            iva = v.iva,

            total = Math.Round(
                (decimal)v.neto * (1m + v.iva),
                MidpointRounding.AwayFromZero
            ),

            estado = v.estado,
            productos = v.productos,
            servicios = v.servicios
        }).ToList();

        return Ok(new
        {
            success = true,
            message = "Historial de compras.",
            data = compras,
            errors = (object?)null
        });
    }

    // GET: api/ventas/mis-ventas (Vendedor)
    [HttpGet("mis-ventas")]
    public async Task<IActionResult> GetMisVentas()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized();

        var ventas = await _context.venta
            .Where(v => v.id_vendedor == rut)
            .Include(v => v.id_clienteNavigation)
            .Include(v => v.generar3s).ThenInclude(g => g.id_productoNavigation)
            .Include(v => v.generar4s).ThenInclude(g => g.id_servicioNavigation)
            .OrderByDescending(v => v.fecha)
            .Select(v => new
            {
                id_venta = v.id,
                fecha = v.fecha,
                total_venta = (decimal)v.neto * (1m + v.iva),
                estado = v.estado,
                cliente = v.id_clienteNavigation.nombre,
                productos = v.generar3s.Select(g => g.id_productoNavigation.nombre).ToList(),
                servicios = v.generar4s.Select(g => g.id_servicioNavigation.nombre).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Historial de ventas.", data = ventas, errors = (object?)null });

        
    }

    // GET: api/ventas/{id} (Detalle para la Boleta)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetVentaDetalle(int id)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized();

        var venta = await _context.venta
            .Include(v => v.id_clienteNavigation)
            .Include(v => v.id_vendedorNavigation)
            .Include(v => v.generar3s).ThenInclude(g => g.id_productoNavigation)
            .Include(v => v.generar4s).ThenInclude(g => g.id_servicioNavigation)
            .Include(v => v.generar3s).ThenInclude(g => g.id_pagoNavigation)
            .Include(v => v.generar4s).ThenInclude(g => g.id_pagoNavigation)
            .FirstOrDefaultAsync(v => v.id == id);

        if (venta == null) return NotFound(new { success = false, message = "Venta no encontrada." });

        // Validar que el usuario sea el cliente o el vendedor
        if (venta.id_cliente != rut && venta.id_vendedor != rut)
            return Forbid();

        // Obtener el pago (viene del primer detalle)
        var pago = venta.generar3s.FirstOrDefault()?.id_pagoNavigation
                ?? venta.generar4s.FirstOrDefault()?.id_pagoNavigation;
        var metodoPago = pago?.mediopago;

        var resultado = new
        {
            id_venta = venta.id,
            fecha = venta.fecha,
            estado = venta.estado,
            neto = venta.neto,
            iva = venta.iva,
            total = venta.neto + (venta.neto * venta.iva),
            requiere_despacho = venta.requieredespacho,
            metodo_pago = metodoPago,
            // La boleta debe mostrar los últimos 4 dígitos de la tarjeta o el código de transferencia
            pago = pago == null ? null : new
            {
                medio = pago.mediopago,
                ult4digitos = pago.ult4digitostarjeta,
                codigo_transferencia = pago.codigotransferencia
            },
            cliente = new { rut = venta.id_cliente, nombre = venta.id_clienteNavigation.nombre },
            vendedor = new { rut = venta.id_vendedor, nombre = venta.id_vendedorNavigation.nombre },
            productos = venta.generar3s.Select(g => new {
                nombre = g.id_productoNavigation.nombre,
                cantidad = g.cantidad,
                precio_unitario = g.cantidad > 0 ? g.totalfinal / g.cantidad : 0,
                subtotal = g.totalfinal
            }).ToList(),
            servicios = venta.generar4s.Select(g => new {
                nombre = g.id_servicioNavigation.nombre,
                cantidad = g.cantidad,
                precio_unitario = g.cantidad > 0 ? g.totalfinal / g.cantidad : 0,
                subtotal = g.totalfinal
            }).ToList()
        };

        return Ok(new { success = true, message = "Detalle de venta obtenido.", data = resultado, errors = (object?)null });
    }

     // =====================================================================
    //  Gestión de pedidos del vendedor (pantalla "Pedidos")
    // =====================================================================
    //
    // El estado que ve el vendedor se arma con dos tablas:
    //   Venta.Estado    -> 'Pagado' | 'Entregado' | 'Cancelado'   (texto libre en la BD)
    //   Despacho.Estado -> 'En Preparación' | 'Despachado' | 'En reparto' | 'Entregado' (tiene CHECK)
    //
    //   pendiente    Venta 'Pagado'    + Despacho 'En Preparación'
    //   preparacion  Venta 'Pagado'    + Despacho 'En Preparación' con "preparando": true en DatosLogisticos
    //   enviado      Venta 'Pagado'    + Despacho 'Despachado' o 'En reparto'
    //   entregado    Venta 'Entregado' + Despacho 'Entregado'
    //   cancelado    Venta 'Cancelado' (o 'Anulado', que aparece en los datos de prueba)
    //
    // Una venta sin despacho (servicios, retiro) solo puede estar pendiente, entregada o cancelada.
    //
    // OJO: los triggers de la BD descuentan stock cuando Venta.Estado pasa a 'Pagado', 'Entregado'
    // o 'Completada'. Por eso Venta.Estado nunca sale de ese grupo salvo al cancelar
    // (si no, volver a 'Entregado' descontaría el stock por segunda vez).

    private static readonly string[] EstadosVentaConcretada = { "Pagado", "Entregado", "Completada" };
    private static readonly string[] EstadosPedido = { "pendiente", "preparacion", "enviado", "entregado", "cancelado" };

    // DatosLogisticos es JSON. El trigger del costo de envío guarda ahí ancho_cm, alto_cm, fondo_cm y
    // costo_envio; este código solo agrega/quita "preparando" y "seguimiento" sin tocar lo demás.
    private static JsonObject LeerDatosLogisticos(string? texto)
    {
        try
        {
            return JsonNode.Parse(string.IsNullOrWhiteSpace(texto) ? "{}" : texto) as JsonObject ?? new JsonObject();
        }
        catch (JsonException)
        {
            return new JsonObject();
        }
    }

    private static bool Preparando(JsonObject datos) =>
        datos["preparando"] is JsonValue v && v.TryGetValue<bool>(out var b) && b;

    private static string Seguimiento(JsonObject datos) =>
        datos["seguimiento"] is JsonValue v && v.TryGetValue<string>(out var s) ? s : "";

    private static string EstadoPedido(string estadoVenta, string? estadoDespacho, JsonObject datos)
    {
        switch (estadoVenta.Trim().ToLowerInvariant())
        {
            case "cancelado":
            case "anulado": return "cancelado"; // 'Anulado' es el estado que usan los datos de prueba
            case "entregado":
            case "completada": return "entregado";
        }

        return estadoDespacho switch
        {
            null => "pendiente",
            "Entregado" => "entregado",
            "Despachado" or "En reparto" => "enviado",
            _ => Preparando(datos) ? "preparacion" : "pendiente"
        };
    }

    // GET: api/ventas/mis-pedidos (Vendedor: las ventas que ha hecho, con cliente, detalle y despacho)
    [HttpGet("mis-pedidos")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> GetMisPedidos()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var ventas = await _context.venta
            .Where(v => v.id_vendedor == rut)
            .OrderByDescending(v => v.fecha)
            .ThenByDescending(v => v.id)
            .Select(v => new
            {
                id = v.id,
                fecha = v.fecha,
                estado = v.estado,
                neto = v.neto,
                iva = v.iva,
                requieredespacho = v.requieredespacho,
                nota = v.nota,
                cliente = v.id_clienteNavigation.nombre,
                productos = v.generar3s.Select(g => new
                {
                    nombre = g.id_productoNavigation.nombre,
                    cantidad = g.cantidad,
                    subtotal = g.totalfinal
                }).ToList(),
                servicios = v.generar4s.Select(g => new
                {
                    nombre = g.id_servicioNavigation.nombre,
                    cantidad = g.cantidad,
                    subtotal = g.totalfinal
                }).ToList(),
                despacho = v.generar2s.Select(g => new
                {
                    estado = g.id_despachoNavigation.estado,
                    datos = g.id_despachoNavigation.datoslogisticos,
                    calle = g.id_despachoNavigation.id_direccionNavigation.calle,
                    numero = g.id_despachoNavigation.id_direccionNavigation.numero,
                    comuna = g.id_despachoNavigation.id_direccionNavigation.id_comunaNavigation.nombre
                }).FirstOrDefault()
            })
            .ToListAsync();

        // El JSON de DatosLogisticos se interpreta en memoria (no se puede traducir a SQL)
        var pedidos = ventas.Select(v =>
        {
            var logistica = LeerDatosLogisticos(v.despacho?.datos);

            return new
            {
                id = v.id,
                fecha = v.fecha,
                estado = EstadoPedido(v.estado, v.despacho?.estado, logistica),
                requiere_despacho = v.despacho != null,
                cliente = v.cliente,
                direccion = v.despacho == null ? null : $"{v.despacho.calle} {v.despacho.numero}, {v.despacho.comuna}",
                seguimiento = Seguimiento(logistica),
                nota = v.nota,
                neto = v.neto,
                total = Math.Round(v.neto + v.neto * v.iva, MidpointRounding.AwayFromZero),
                items = v.productos
                    .Select(p => new { tipo = "producto", p.nombre, p.cantidad, p.subtotal })
                    .Concat(v.servicios.Select(s => new { tipo = "servicio", s.nombre, s.cantidad, s.subtotal }))
                    .ToList()
            };
        }).ToList();

        return Ok(new { success = true, message = "Pedidos obtenidos.", data = pedidos, errors = (object?)null });
    }

    // PUT: api/ventas/{id}/estado (Vendedor: cambia el estado del pedido)
    [HttpPut("{id}/estado")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> ActualizarEstadoPedido(int id, [FromBody] PedidoEstadoDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var nuevo = dto.estado.Trim().ToLowerInvariant();
        if (!EstadosPedido.Contains(nuevo))
            return BadRequest(new { success = false, message = "Estado de pedido inválido.", errors = new[] { "estado: inválido." } });

        var venta = await _context.venta
            .Include(v => v.generar3s)
            .Include(v => v.generar2s).ThenInclude(g => g.id_despachoNavigation)
            .FirstOrDefaultAsync(v => v.id == id);

        if (venta == null)
            return NotFound(new { success = false, message = "Pedido no encontrado." });
        if (venta.id_vendedor != rut)
            return Forbid();

        var despacho = venta.generar2s.Select(g => g.id_despachoNavigation).FirstOrDefault();
        var logistica = LeerDatosLogisticos(despacho?.datoslogisticos);
        var actual = EstadoPedido(venta.estado, despacho?.estado, logistica);

        if (actual == "entregado" || actual == "cancelado")
            return BadRequest(new { success = false, message = $"El pedido ya está {actual} y no se puede modificar." });

        if (nuevo == "cancelado" && actual != "pendiente" && actual != "preparacion")
            return BadRequest(new { success = false, message = "Solo se pueden cancelar pedidos pendientes o en preparación." });

        if (despacho == null && (nuevo == "preparacion" || nuevo == "enviado"))
            return BadRequest(new { success = false, message = "Este pedido no requiere despacho: solo puede quedar pendiente, entregado o cancelado." });

        var seguimiento = dto.seguimiento?.Trim() ?? "";
        if (nuevo == "enviado" && seguimiento == "")
            return BadRequest(new { success = false, message = "Indica el código de seguimiento para marcar el pedido como enviado." });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            if (nuevo == "cancelado")
            {
                // El stock se descontó al pagar: se devuelve al inventario del vendedor
                if (EstadosVentaConcretada.Contains(venta.estado))
                    await DevolverStock(venta, rut);

                venta.estado = "Cancelado";
            }
            else
            {
                // Pasar a 'Entregado' es seguro: si ya estaba 'Pagado' los triggers de stock no vuelven a actuar.
                // En los otros estados Venta.Estado no se toca, para no disparar descuentos de stock.
                if (nuevo == "entregado")
                    venta.estado = "Entregado";

                if (despacho != null)
                {
                    despacho.estado = nuevo switch
                    {
                        "entregado" => "Entregado",
                        "enviado" => "Despachado",
                        _ => "En Preparación"
                    };

                    if (nuevo == "preparacion") logistica["preparando"] = true;
                    else logistica.Remove("preparando");

                    if ((nuevo == "enviado" || nuevo == "entregado") && seguimiento != "")
                        logistica["seguimiento"] = seguimiento;
                    else if (nuevo == "pendiente" || nuevo == "preparacion")
                        logistica.Remove("seguimiento");

                    despacho.datoslogisticos = logistica.ToJsonString();
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Estado del pedido actualizado.", data = new { id = venta.id, estado = nuevo }, errors = (object?)null });
        }
        catch (DbUpdateException ex)
        {
            await transaction.RollbackAsync();
            // Los RAISE EXCEPTION de los triggers (p. ej. "Stock insuficiente...") vienen en la excepción interna
            return Conflict(new { success = false, message = ex.InnerException?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error interno al actualizar el pedido.", errors = new[] { ex.InnerException?.Message ?? ex.Message } });
        }
    }

    // Suma de vuelta al inventario del vendedor las unidades de los productos de una venta cancelada
    private async Task DevolverStock(ventum venta, string rutVendedor)
    {
        foreach (var linea in venta.generar3s)
        {
            var fila = await _context.almacenars
                .Where(a => a.id_producto == linea.id_producto && a.id_inventarioNavigation.id_usuario == rutVendedor)
                .FirstOrDefaultAsync();

            if (fila != null)
            {
                fila.stockactual += linea.cantidad;
                continue;
            }

            // El producto ya no estaba en ningún inventario del vendedor: se agrega al primero que tenga
            var inventario = await _context.inventarios.FirstOrDefaultAsync(i => i.id_usuario == rutVendedor);
            if (inventario != null)
            {
                _context.almacenars.Add(new almacenar
                {
                    id_inventario = inventario.id,
                    id_producto = linea.id_producto,
                    stockactual = linea.cantidad
                });
            }
        }
    }
}