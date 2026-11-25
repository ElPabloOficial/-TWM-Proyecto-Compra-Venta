using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CotizacionesController : ControllerBase
{
    private const int DiasVigencia = 15;
    private const int MaxCantidad = 10000;

    private readonly AppDbContext _context;

    public CotizacionesController(AppDbContext context)
    {
        _context = context;
    }

    // Una cotización es de un solo vendedor: al solicitarla, los ítems se separan en una cotización por vendedor.
    //  - Productos: el vendedor es quien los ofrece (Ofrecer1). Servicios: el oferente de Solicitar2 (con precio en Valorar).
    //  - Estados que se guardan en Cotizacion.Estado: "Solicitada" -> "Respondida" -> "Aceptada".
    //    "Expirada" se calcula (vigencia de 15 días); los estados antiguos de la base ("En revisión", "En Proceso",
    //    "Aprobada", "Rechazada") se leen como su equivalente.
    //  - Vigencia: 15 días desde la última actualización (o desde la creación si nunca se actualizó).
    //    La base ajusta sola los precios cada semana pasados 15 días y borra la cotización a los 45 (trigger 19).

    private sealed record VendedorProducto(int IdProducto, string Rut, string Nombre);

    private static DateOnly Hoy() => DateOnly.FromDateTime(DateTime.Now);

    private static string Fecha(DateOnly fecha) => fecha.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static DateOnly Vence(cotizacion c) => (c.fechaultimaactualizacion ?? c.fechacreacion).AddDays(DiasVigencia);

    private static string EstadoNormalizado(string estado) => estado switch
    {
        "Solicitada" or "En Proceso" or "En revisión" => "Solicitada",
        "Respondida" or "Aprobada" => "Respondida",
        "Aceptada" => "Aceptada",
        "Comprada" => "Comprada", // el cliente ya compró con ella (queda aceptada y usada)
        "Expirada" => "Expirada",
        "Rechazada" => "Rechazada",
        _ => "Solicitada"
    };

    // Estado que ve el usuario: una solicitada o respondida que pasó su vigencia se muestra "Expirada"
    private static string EstadoVisible(cotizacion c, DateOnly hoy)
    {
        var estado = EstadoNormalizado(c.estado);
        if ((estado == "Solicitada" || estado == "Respondida") && hoy > Vence(c)) return "Expirada";
        return estado;
    }

    private IQueryable<cotizacion> ConDetalle(bool sinSeguimiento)
    {
        var consulta = sinSeguimiento ? _context.cotizacions.AsNoTracking() : _context.cotizacions;
        return consulta
            .Include(c => c.solicitar1s).ThenInclude(s => s.id_productoNavigation)
            .Include(c => c.solicitar1s).ThenInclude(s => s.id_usuarioNavigation)
            .Include(c => c.solicitar2s).ThenInclude(s => s.id_servicioNavigation)
            .Include(c => c.solicitar2s).ThenInclude(s => s.id_usuarioNavigation)
            .Include(c => c.solicitar2s).ThenInclude(s => s.id_oferenteNavigation)
            .AsSplitQuery();
    }

    private async Task<List<VendedorProducto>> VendedoresDeProductos(List<int> idsProductos)
    {
        var lista = await _context.ofrecer1s
            .AsNoTracking()
            .Where(o => idsProductos.Contains(o.id_producto))
            .Select(o => new { o.id_producto, rut = o.id_usuario, nombre = o.id_usuarioNavigation.nombre })
            .ToListAsync();
        return lista.Select(o => new VendedorProducto(o.id_producto, o.rut, o.nombre)).ToList();
    }

    private static bool EsCliente(cotizacion c, string rut) =>
        c.solicitar1s.Any(s => s.id_usuario == rut) || c.solicitar2s.Any(s => s.id_usuario == rut);

    private static bool EsVendedor(cotizacion c, string rut, List<VendedorProducto> vendedores) =>
        c.solicitar2s.Any(s => s.id_oferente == rut)
        || c.solicitar1s.Any(s => vendedores.Any(v => v.IdProducto == s.id_producto && v.Rut == rut));

    // Arma la cotización como la ve el front. Con soloVendedor, el vendedor ve únicamente sus ítems.
    // Con `stock` (producto -> unidades disponibles) cada producto trae su stock; los servicios no tienen.
    private static object Armar(cotizacion c, List<VendedorProducto> vendedores, string? soloVendedor, DateOnly hoy, Dictionary<int, int>? stock = null)
    {
        var productos = c.solicitar1s
            .Where(s => soloVendedor == null || vendedores.Any(v => v.IdProducto == s.id_producto && v.Rut == soloVendedor))
            .Select(s => new { tipo = "producto", id = s.id_producto, nombre = s.id_productoNavigation.nombre, precio = s.precio, cantidad = s.cantidad, stock = stock == null ? (int?)null : (int?)stock.GetValueOrDefault(s.id_producto) });
        var servicios = c.solicitar2s
            .Where(s => soloVendedor == null || s.id_oferente == soloVendedor)
            .Select(s => new { tipo = "servicio", id = s.id_servicio, nombre = s.id_servicioNavigation.nombre, precio = s.precio, cantidad = s.cantidad, stock = (int?)null });
        var items = productos.Concat(servicios).OrderBy(i => i.nombre).ToList();

        var cliente = c.solicitar1s.Select(s => s.id_usuarioNavigation)
            .Concat(c.solicitar2s.Select(s => s.id_usuarioNavigation))
            .FirstOrDefault();

        string? vendedorRut = null;
        string? vendedorNombre = null;
        var primerServicio = c.solicitar2s.FirstOrDefault();
        if (primerServicio != null)
        {
            vendedorRut = primerServicio.id_oferente;
            vendedorNombre = primerServicio.id_oferenteNavigation.nombre;
        }
        else
        {
            var vendedor = c.solicitar1s
                .Select(s => vendedores.FirstOrDefault(v => v.IdProducto == s.id_producto))
                .FirstOrDefault(v => v != null);
            vendedorRut = vendedor?.Rut;
            vendedorNombre = vendedor?.Nombre;
        }

        return new
        {
            id = c.id,
            estado = EstadoVisible(c, hoy),
            fechaEmision = Fecha(c.fechacreacion),
            fechaExpiracion = Fecha(Vence(c)),
            cliente = cliente == null ? null : new { nombre = cliente.nombre, rut = cliente.rut },
            vendedor = vendedorRut == null ? null : new { nombre = vendedorNombre, rut = vendedorRut },
            items
        };
    }

    private IActionResult SinSesion() =>
        Unauthorized(new { success = false, message = "Usuario no autenticado." });

    // GET: api/cotizaciones/mias (las que yo pedí como cliente; api/cotizaciones hace lo mismo)
    [HttpGet]
    [HttpGet("mias")]
    public async Task<IActionResult> GetMisCotizaciones()
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return SinSesion();

            var cotizaciones = await ConDetalle(true)
                .Where(c => c.solicitar1s.Any(s => s.id_usuario == rut) || c.solicitar2s.Any(s => s.id_usuario == rut))
                .OrderByDescending(c => c.fechacreacion).ThenByDescending(c => c.id)
                .ToListAsync();

            var vendedores = await VendedoresDeProductos(cotizaciones.SelectMany(c => c.solicitar1s).Select(s => s.id_producto).Distinct().ToList());
            var hoy = Hoy();
            var data = cotizaciones.Select(c => Armar(c, vendedores, null, hoy)).ToList();

            return Ok(new { success = true, message = "Cotizaciones obtenidas.", data, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/cotizaciones/recibidas (las que me pidieron a mí como vendedor; solo se ven mis ítems)
    [HttpGet("recibidas")]
    public async Task<IActionResult> GetCotizacionesRecibidas()
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return SinSesion();

            var cotizaciones = await ConDetalle(true)
                .Where(c => c.solicitar1s.Any(s => _context.ofrecer1s.Any(o => o.id_producto == s.id_producto && o.id_usuario == rut))
                         || c.solicitar2s.Any(s => s.id_oferente == rut))
                .OrderByDescending(c => c.fechacreacion).ThenByDescending(c => c.id)
                .ToListAsync();

            var vendedores = await VendedoresDeProductos(cotizaciones.SelectMany(c => c.solicitar1s).Select(s => s.id_producto).Distinct().ToList());
            var hoy = Hoy();
            var data = cotizaciones.Select(c => Armar(c, vendedores, rut, hoy)).ToList();

            return Ok(new { success = true, message = "Cotizaciones recibidas obtenidas.", data, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/cotizaciones/5 (detalle; lo ve el cliente que la pidió o el vendedor al que se la pidieron)
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCotizacion(int id)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return SinSesion();

            var c = await ConDetalle(true).FirstOrDefaultAsync(x => x.id == id);
            if (c == null)
                return NotFound(new { success = false, message = "Cotización no encontrada." });

            var vendedores = await VendedoresDeProductos(c.solicitar1s.Select(s => s.id_producto).ToList());

            string? soloVendedor = null;
            if (!EsCliente(c, rut))
            {
                if (!EsVendedor(c, rut, vendedores)) return Forbid();
                soloVendedor = rut;
            }

            // El cliente ve cuánto stock queda de cada producto cotizado (para saber si puede comprar)
            Dictionary<int, int>? stock = null;
            if (soloVendedor == null)
            {
                var idsProductos = c.solicitar1s.Select(s => s.id_producto).ToList();
                var totales = await _context.almacenars
                    .AsNoTracking()
                    .Where(a => idsProductos.Contains(a.id_producto))
                    .GroupBy(a => a.id_producto)
                    .Select(g => new { id = g.Key, total = g.Sum(a => a.stockactual) })
                    .ToListAsync();
                stock = totales.ToDictionary(x => x.id, x => x.total);
            }

            return Ok(new { success = true, message = "Cotización obtenida.", data = Armar(c, vendedores, soloVendedor, Hoy(), stock), errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // POST: api/cotizaciones (Solicitar cotización)
    // Crea una cotización por cada vendedor involucrado y devuelve sus ids.
    [HttpPost]
    public async Task<IActionResult> CrearCotizacion([FromBody] CotizacionCreateDto dto)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return SinSesion();

            if (dto.items == null || dto.items.Count == 0)
                return BadRequest(new { success = false, message = "La cotización debe tener al menos un ítem." });

            // Validar los ítems y juntar los repetidos
            var pedidos = new Dictionary<(string tipo, int id), (int precio, int cantidad)>();
            foreach (var item in dto.items)
            {
                var tipo = (item.tipo ?? "").ToLower();
                if (tipo != "producto" && tipo != "servicio")
                    return BadRequest(new { success = false, message = "Tipo de ítem inválido." });
                if (item.cantidad < 1 || item.cantidad > MaxCantidad)
                    return BadRequest(new { success = false, message = "La cantidad de cada ítem debe ser de 1 o más." });
                if (item.precio < 0)
                    return BadRequest(new { success = false, message = "El precio no puede ser negativo." });

                var clave = (tipo, item.id_item);
                pedidos[clave] = pedidos.TryGetValue(clave, out var previo)
                    ? (previo.precio, previo.cantidad + item.cantidad)
                    : (item.precio, item.cantidad);
            }

            var idsProductos = pedidos.Keys.Where(k => k.tipo == "producto").Select(k => k.id).ToList();
            var idsServicios = pedidos.Keys.Where(k => k.tipo == "servicio").Select(k => k.id).ToList();

            var productos = await _context.productos.AsNoTracking()
                .Where(p => idsProductos.Contains(p.id)).Select(p => new { p.id, p.nombre }).ToListAsync();
            var servicios = await _context.servicios.AsNoTracking()
                .Where(s => idsServicios.Contains(s.id)).Select(s => new { s.id, s.nombre }).ToListAsync();
            var vendedoresProductos = await VendedoresDeProductos(idsProductos);

            // Un servicio solo se puede cotizar con un oferente que tenga precio en Valorar (clave foránea de Solicitar2)
            var oferentes = await _context.ofrecer2s.AsNoTracking()
                .Where(o => idsServicios.Contains(o.id_servicio)
                    && _context.valorars.Any(v => v.id_servicio == o.id_servicio && v.id_usuario == o.id_usuario))
                .Select(o => new { o.id_servicio, rut = o.id_usuario })
                .ToListAsync();

            // Separar por vendedor
            var porVendedor = new Dictionary<string, List<(string tipo, int id, int precio, int cantidad)>>();
            foreach (var par in pedidos)
            {
                var (tipo, id) = par.Key;
                string? vendedor;

                if (tipo == "producto")
                {
                    var producto = productos.FirstOrDefault(p => p.id == id);
                    if (producto == null)
                        return NotFound(new { success = false, message = $"El producto {id} no existe." });
                    vendedor = vendedoresProductos.FirstOrDefault(v => v.IdProducto == id)?.Rut;
                    if (vendedor == null)
                        return BadRequest(new { success = false, message = $"«{producto.nombre}» no tiene un vendedor asignado y no se puede cotizar." });
                }
                else
                {
                    var servicio = servicios.FirstOrDefault(s => s.id == id);
                    if (servicio == null)
                        return NotFound(new { success = false, message = $"El servicio {id} no existe." });
                    vendedor = oferentes.FirstOrDefault(o => o.id_servicio == id)?.rut;
                    if (vendedor == null)
                        return BadRequest(new { success = false, message = $"«{servicio.nombre}» no tiene un vendedor con precio asignado y no se puede cotizar." });
                }

                if (!porVendedor.TryGetValue(vendedor, out var grupo))
                    porVendedor[vendedor] = grupo = new List<(string, int, int, int)>();
                grupo.Add((tipo, id, par.Value.precio, par.Value.cantidad));
            }

            try
            {
                var hoy = Hoy();
                var creadas = new List<cotizacion>();

                foreach (var grupo in porVendedor)
                {
                    var nueva = new cotizacion { fechacreacion = hoy, estado = "Solicitada" };
                    _context.cotizacions.Add(nueva);

                    foreach (var item in grupo.Value)
                    {
                        if (item.tipo == "producto")
                            _context.solicitar1s.Add(new solicitar1
                            {
                                id_cotizacionNavigation = nueva,
                                id_usuario = rut,
                                id_producto = item.id,
                                precio = item.precio,
                                cantidad = item.cantidad
                            });
                        else
                            _context.solicitar2s.Add(new solicitar2
                            {
                                id_cotizacionNavigation = nueva,
                                id_usuario = rut,
                                id_servicio = item.id,
                                id_oferente = grupo.Key,
                                precio = item.precio,
                                cantidad = item.cantidad
                            });
                    }
                    creadas.Add(nueva);
                }

                // Un solo guardado: se crean todas las cotizaciones o ninguna
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Cotización creada.", data = new { ids = creadas.Select(c => c.id).ToList() }, errors = (object?)null });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al crear la cotización.", errors = new[] { ex.Message } });
            }
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // PUT: api/cotizaciones/5/responder (el vendedor pone el precio de cada uno de sus ítems)
    [HttpPut("{id:int}/responder")]
    public async Task<IActionResult> ResponderCotizacion(int id, [FromBody] CotizacionResponderDto dto)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return SinSesion();

            var c = await ConDetalle(false).FirstOrDefaultAsync(x => x.id == id);
            if (c == null)
                return NotFound(new { success = false, message = "Cotización no encontrada." });

            var vendedores = await VendedoresDeProductos(c.solicitar1s.Select(s => s.id_producto).ToList());
            if (!EsVendedor(c, rut, vendedores)) return Forbid();

            var hoy = Hoy();
            if (EstadoVisible(c, hoy) != "Solicitada")
                return BadRequest(new { success = false, message = "Esta cotización ya no se puede responder." });

            var precios = dto.precios ?? new List<PrecioItemCotizacionDto>();

            foreach (var item in c.solicitar1s.Where(s => vendedores.Any(v => v.IdProducto == s.id_producto && v.Rut == rut)))
            {
                var respuesta = precios.FirstOrDefault(p => (p.tipo ?? "").ToLower() == "producto" && p.id_item == item.id_producto);
                if (respuesta == null || respuesta.precio <= 0)
                    return BadRequest(new { success = false, message = "Indica el precio unitario de todos los productos y servicios." });
                item.precio = respuesta.precio;
            }

            foreach (var item in c.solicitar2s.Where(s => s.id_oferente == rut))
            {
                var respuesta = precios.FirstOrDefault(p => (p.tipo ?? "").ToLower() == "servicio" && p.id_item == item.id_servicio);
                if (respuesta == null || respuesta.precio <= 0)
                    return BadRequest(new { success = false, message = "Indica el precio unitario de todos los productos y servicios." });
                item.precio = respuesta.precio;
            }

            c.estado = "Respondida";
            c.fechaultimaactualizacion = hoy; // desde aquí corren los 15 días de vigencia
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cotización respondida.", data = (object?)null, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // PUT: api/cotizaciones/5/aceptar (el cliente acepta una cotización respondida y vigente)
    [HttpPut("{id:int}/aceptar")]
    public async Task<IActionResult> AceptarCotizacion(int id)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return SinSesion();

            var c = await ConDetalle(false).FirstOrDefaultAsync(x => x.id == id);
            if (c == null)
                return NotFound(new { success = false, message = "Cotización no encontrada." });

            if (!EsCliente(c, rut)) return Forbid();

            var hoy = Hoy();
            if (EstadoVisible(c, hoy) != "Respondida")
                return BadRequest(new { success = false, message = "Solo puedes aceptar cotizaciones respondidas y vigentes." });

            c.estado = "Aceptada";
            c.fechaultimaactualizacion = hoy;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cotización aceptada.", data = (object?)null, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // PUT: api/cotizaciones/5/estado (cambio manual de estado; solo quien participa en la cotización)
    [HttpPut("{id:int}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] CotizacionEstadoDto dto)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return SinSesion();

            var c = await ConDetalle(false).FirstOrDefaultAsync(x => x.id == id);
            if (c == null)
                return NotFound(new { success = false, message = "Cotización no encontrada." });

            var vendedores = await VendedoresDeProductos(c.solicitar1s.Select(s => s.id_producto).ToList());
            if (!EsCliente(c, rut) && !EsVendedor(c, rut, vendedores)) return Forbid();

            if (string.IsNullOrWhiteSpace(dto.estado) || dto.estado.Length > 20)
                return BadRequest(new { success = false, message = "Estado inválido." });

            c.estado = dto.estado.Trim();
            c.fechaultimaactualizacion = Hoy();
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Estado actualizado.", data = (object?)null, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}