using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

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

    // POST: api/ventas (Checkout)
    [HttpPost]
    public async Task<IActionResult> CrearVenta([FromBody] VentaCreateDto dto)
    {
        var rutCliente = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rutCliente))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        // 1. Buscar el carrito del usuario
        var itemsProductos = await _context.crear3s
            .Include(c => c.id_productoNavigation)
            .Where(c => c.id_usuario == rutCliente)
            .ToListAsync();

        var itemsServicios = await _context.crear4s
            .Include(c => c.id_servicioNavigation)
            .Where(c => c.id_usuario == rutCliente)
            .ToListAsync();

        if (!itemsProductos.Any() && !itemsServicios.Any())
            return BadRequest(new { success = false, message = "El carrito está vacío." });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 2. Calcular Totales (Extrayendo el precio del JSON)
            int netoTotal = 0;

            foreach (var item in itemsProductos)
            {
                var caracteristicasStr = item.id_productoNavigation.caracteristicas;
                if (!string.IsNullOrWhiteSpace(caracteristicasStr))
                {
                    using var json = JsonDocument.Parse(caracteristicasStr);
                    if (json.RootElement.TryGetProperty("precio", out var precioElement))
                    {
                        netoTotal += (precioElement.GetInt32() * item.cantidad);
                    }
                }
            }

            foreach (var item in itemsServicios)
            {
                var caracteristicasStr = item.id_servicioNavigation.caracteristicas;
                if (!string.IsNullOrWhiteSpace(caracteristicasStr))
                {
                    using var json = JsonDocument.Parse(caracteristicasStr);
                    if (json.RootElement.TryGetProperty("precio", out var precioElement))
                    {
                        netoTotal += (precioElement.GetInt32() * item.cantidad);
                    }
                }
            }

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
                var caracteristicasStr = item.id_productoNavigation.caracteristicas;
                int precio = 0;

                if (!string.IsNullOrWhiteSpace(caracteristicasStr))
                {
                    try
                    {
                        using var json = JsonDocument.Parse(caracteristicasStr);
                        if (json.RootElement.TryGetProperty("precio", out var p))
                        {
                            precio = p.GetInt32();
                        }
                    }
                    catch (JsonException) { }
                }

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
                // Validar que caracteristicas no sea nulo ni vacío
                var caracteristicasStr = item.id_servicioNavigation.caracteristicas;
                int precio = 0;

                if (!string.IsNullOrWhiteSpace(caracteristicasStr))
                {
                    try
                    {
                        using var json = JsonDocument.Parse(caracteristicasStr);
                        if (json.RootElement.TryGetProperty("precio", out var p))
                        {
                            precio = p.GetInt32();
                        }
                    }
                    catch (JsonException)
                    {
                        // Si el JSON está mal formado, dejamos precio en 0
                    }
                }

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
            return StatusCode(500, new { success = false, message = "Error al procesar la venta.", errors = new[] { ex.Message } });
        }
    }

        // GET: api/ventas/mis-compras (Cliente)
    [HttpGet("mis-compras")]
    public async Task<IActionResult> GetMisCompras()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized();

        var compras = await _context.venta
            .Where(v => v.id_cliente == rut)
            .Include(v => v.generar3s).ThenInclude(g => g.id_productoNavigation)
            .Include(v => v.generar4s).ThenInclude(g => g.id_servicioNavigation)
            .OrderByDescending(v => v.fecha)
            .Select(v => new
            {
                id_venta = v.id,
                fecha = v.fecha,
                total = v.neto + (v.neto * v.iva),
                estado = v.estado,
                productos = v.generar3s.Select(g => new { 
                    nombre = g.id_productoNavigation.nombre, 
                    cantidad = g.cantidad, 
                    total = g.totalfinal 
                }).ToList(),
                servicios = v.generar4s.Select(g => new { 
                    nombre = g.id_servicioNavigation.nombre, 
                    cantidad = g.cantidad, 
                    total = g.totalfinal 
                }).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Historial de compras.", data = compras, errors = (object?)null });
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
                total = v.neto + (v.neto * v.iva),
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
            .FirstOrDefaultAsync(v => v.id == id);

        if (venta == null) return NotFound(new { success = false, message = "Venta no encontrada." });

        // Validar que el usuario sea el cliente o el vendedor
        if (venta.id_cliente != rut && venta.id_vendedor != rut)
            return Forbid();

        // Obtener el método de pago (viene del primer detalle)
        var metodoPago = venta.generar3s.FirstOrDefault()?.id_pagoNavigation?.mediopago 
                      ?? venta.generar4s.FirstOrDefault()?.id_pagoNavigation?.mediopago;

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
            return StatusCode(500, new { success = false, message = "Error interno al actualizar el pedido.", errors = new[] { ex.Message } });
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
