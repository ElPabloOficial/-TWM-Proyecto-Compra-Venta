using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using System.Text.Json.Nodes;
using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DespachosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EnvioService _envio;

    public DespachosController(AppDbContext context, EnvioService envio)
    {
        _context = context;
        _envio = envio;
    }

    // GET: api/despachos/empresas (Vendedor/Admin: nombres de empresas de despacho disponibles)
    [HttpGet("empresas")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> GetEmpresasDisponibles(CancellationToken ct)
    {
        try
        {
            var empresas = await _context.empresadespachos
                .AsNoTracking()
                .OrderBy(e => e.nombre)
                .Select(e => new { e.id, e.nombre })
                .ToListAsync(ct);

            return Ok(new { success = true, message = "Empresas de despacho obtenidas.", data = empresas, errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/despachos/opciones            (con los productos de tu carrito)
    // GET: api/despachos/opciones?cotizacion=5   (con los productos de una cotización)
    // Empresas de despacho que pueden llevar el pedido, con su precio y plazo (de la más barata a la más cara).
    [HttpGet("opciones")]
    public async Task<IActionResult> GetOpciones([FromQuery] int? cotizacion, CancellationToken ct)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return Unauthorized();

            var productos = cotizacion.HasValue
                ? await _envio.ProductosDeCotizacionAsync(cotizacion.Value, rut, ct)
                : await _envio.ProductosDelCarritoAsync(rut, ct);

            // Solo se envían productos: un pedido de puros servicios no tiene despacho
            if (productos.Count == 0)
                return Ok(new { success = true, message = "El pedido no tiene productos que enviar.", data = new { requiere_despacho = false, paquete = (object?)null, opciones = Array.Empty<object>() }, errors = (object?)null });

            var paquete = EnvioService.ArmarPaquete(productos);
            var opciones = await _envio.OpcionesAsync(paquete, ct);

            return Ok(new
            {
                success = true,
                message = opciones.Count > 0 ? "Opciones de envío obtenidas." : "Ninguna empresa puede transportar este pedido.",
                data = new
                {
                    requiere_despacho = true,
                    paquete = new { peso_kg = paquete.PesoKg, ancho_cm = paquete.AnchoCm, alto_cm = paquete.AltoCm, fondo_cm = paquete.FondoCm },
                    opciones = opciones.Select(o => new { id = o.Id, nombre = o.Nombre, costo = o.Costo, dias_entrega = o.DiasEntrega })
                },
                errors = (object?)null
            });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // =====================================================================
    //  Seguimiento de despachos
    // =====================================================================
    //
    // Despacho.Estado (tiene CHECK): 'En Preparación' -> 'Despachado' -> 'En reparto' -> 'Entregado'.
    // La empresa de transporte sale de Despachar2 (se elige al comprar). Lo que la BD no tiene como columna
    // se guarda en el JSON Despacho.DatosLogisticos, junto a lo que ya escribe el trigger del costo de envío
    // (ancho_cm, alto_cm, fondo_cm, peso_kg, id_empresad, costo_envio):
    //   "seguimiento"     código de seguimiento (texto; el mismo que usa la pantalla Pedidos)
    //   "fecha_estimada"  aaaa-mm-dd
    //   "eventos"         historial [{ estado, fecha, detalle }], del más antiguo al más reciente

    private static readonly string[] Etapas = { "En Preparación", "Despachado", "En reparto", "Entregado" };
    private const int DiasEntregaPorDefecto = 3;

    private sealed record Evento(string Estado, string Fecha, string Detalle);

    // Venta con todo lo que hace falta para armar la vista de un despacho
    private IQueryable<ventum> VentasConDespacho() => _context.venta
        .Include(v => v.id_clienteNavigation)
        .Include(v => v.generar3s).ThenInclude(g => g.id_productoNavigation)
        .Include(v => v.generar2s).ThenInclude(g => g.id_despachoNavigation)
            .ThenInclude(d => d.id_direccionNavigation).ThenInclude(dir => dir.id_comunaNavigation)
        .Include(v => v.generar2s).ThenInclude(g => g.id_despachoNavigation)
            .ThenInclude(d => d.despachar2s).ThenInclude(ds => ds.id_empresadNavigation)
        .AsSplitQuery();

    private static JsonObject LeerDatos(string? texto)
    {
        try
        {
            return JsonNode.Parse(string.IsNullOrWhiteSpace(texto) ? "{}" : texto) as JsonObject ?? new JsonObject();
        }
        catch (System.Text.Json.JsonException)
        {
            return new JsonObject();
        }
    }

    private static string? Texto(JsonObject datos, string clave)
    {
        var valor = datos[clave]?.ToString();
        return string.IsNullOrWhiteSpace(valor) ? null : valor;
    }

    private static decimal? Numero(JsonObject datos, string clave) =>
        decimal.TryParse(Texto(datos, clave), NumberStyles.Number, CultureInfo.InvariantCulture, out var n) ? n : null;

    private static int DiasEntrega(string? estandares)
    {
        var dias = Numero(LeerDatos(estandares), "dias_entrega");
        return dias is > 0 ? (int)dias.Value : DiasEntregaPorDefecto;
    }

    private static string TextoEvento(string estado, string? empresa) => estado switch
    {
        "En Preparación" => "El vendedor está preparando tu pedido.",
        "Despachado" => $"Tu pedido salió del vendedor{(empresa != null ? $" con {empresa}" : "")}.",
        "En reparto" => "Tu pedido está en reparto, pronto llegará a tu dirección.",
        _ => "Tu pedido fue entregado."
    };

    // Historial guardado (del más antiguo al más reciente). Los despachos anteriores a esta función no lo
    // tienen: se arma un solo evento con el estado actual y la fecha de la venta.
    private static List<Evento> LeerEventos(JsonObject datos, ventum venta, string estadoActual, string? empresa)
    {
        var lista = new List<Evento>();

        if (datos["eventos"] is JsonArray guardados)
        {
            foreach (var nodo in guardados)
            {
                if (nodo is not JsonObject e) continue;
                var estado = Texto(e, "estado");
                var fecha = Texto(e, "fecha");
                if (estado == null || fecha == null) continue;
                lista.Add(new Evento(estado, fecha, Texto(e, "detalle") ?? TextoEvento(estado, empresa)));
            }
        }

        if (lista.Count == 0)
            lista.Add(new Evento(estadoActual, (venta.fecha ?? DateTime.Now).ToString("o"), TextoEvento(estadoActual, empresa)));

        return lista;
    }

    // La forma que usa el frontend (shipmentService.js) para un despacho
    private static object? ArmarDespacho(ventum venta)
    {
        var despacho = venta.generar2s.Select(g => g.id_despachoNavigation).FirstOrDefault(d => d != null);
        if (despacho == null) return null;

        var datos = LeerDatos(despacho.datoslogisticos);
        var envio = despacho.despachar2s.FirstOrDefault();
        var empresa = envio?.id_empresadNavigation;
        var direccion = despacho.id_direccionNavigation;

        var seguimiento = Texto(datos, "seguimiento") ?? envio?.numeroseguimiento?.ToString();

        var ancho = Numero(datos, "ancho_cm");
        var alto = Numero(datos, "alto_cm");
        var fondo = Numero(datos, "fondo_cm");

        var fechaEstimada = Texto(datos, "fecha_estimada")
            ?? (venta.fecha ?? DateTime.Today).Date.AddDays(DiasEntrega(empresa?.estandaresvolumetricos)).ToString("yyyy-MM-dd");

        var eventos = LeerEventos(datos, venta, despacho.estado, empresa?.nombre);
        eventos.Reverse(); // el más reciente primero

        return new
        {
            id_venta = venta.id,
            id_despacho = despacho.id,
            estado = despacho.estado,
            cliente = venta.id_clienteNavigation?.nombre,
            direccion_entrega = new
            {
                calle = direccion.calle,
                numero = direccion.numero,
                comuna = direccion.id_comunaNavigation?.nombre
            },
            empresa_despacho = empresa?.nombre,
            numero_seguimiento = seguimiento,
            costo_envio = Numero(datos, "costo_envio"),
            fecha_estimada = fechaEstimada,
            paquete = ancho.HasValue && alto.HasValue && fondo.HasValue
                ? new { ancho_cm = ancho.Value, alto_cm = alto.Value, fondo_cm = fondo.Value }
                : null,
            productos = venta.generar3s.Select(g => new { nombre = g.id_productoNavigation.nombre, cantidad = g.cantidad }).ToList(),
            eventos = eventos.Select(e => new { estado = e.Estado, fecha = e.Fecha, detalle = e.Detalle }).ToList(),
            datos_logisticos = despacho.datoslogisticos
        };
    }

    private static bool Cancelada(ventum venta) =>
        venta.estado.Trim().ToLowerInvariant() is "cancelado" or "anulado";

    // Los RAISE EXCEPTION de la base llegan como "P0001: mensaje"; al usuario solo le sirve el mensaje
    private static string MensajeDeBase(Exception ex)
    {
        var texto = ex.InnerException?.Message ?? ex.Message;
        return System.Text.RegularExpressions.Regex.Replace(texto, @"^[0-9A-Z]{5}:\s*", "");
    }

    private static string Normalizar(string? texto) => (texto ?? "").Replace(" ", "").Trim().ToLowerInvariant();

    // GET: api/despachos/mis-despachos (Vendedor: los despachos de sus ventas)
    [HttpGet("mis-despachos")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> GetMisDespachos(CancellationToken ct)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return Unauthorized();

            var ventas = await VentasConDespacho().AsNoTracking()
                .Where(v => v.id_vendedor == rut && v.generar2s.Any())
                .OrderByDescending(v => v.fecha)
                .ThenByDescending(v => v.id)
                .ToListAsync(ct);

            // Una venta cancelada ya no se envía
            var despachos = ventas
                .Where(v => !Cancelada(v))
                .Select(ArmarDespacho)
                .Where(d => d != null)
                .ToList();

            return Ok(new { success = true, message = "Despachos obtenidos.", data = despachos, errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/despachos/venta/{idVenta} (cliente o vendedor de la venta)
    [HttpGet("venta/{idVenta}")]
    public async Task<IActionResult> GetDespachoPorVenta(int idVenta, CancellationToken ct)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return Unauthorized();

            var venta = await VentasConDespacho().AsNoTracking().FirstOrDefaultAsync(v => v.id == idVenta, ct);
            if (venta == null) return NotFound(new { success = false, message = "Venta no encontrada." });

            if (venta.id_cliente != rut && venta.id_vendedor != rut)
                return Forbid();

            var resultado = ArmarDespacho(venta);
            if (resultado == null)
                return NotFound(new { success = false, message = "Esta venta no tiene despacho asociado o aún no se ha generado." });

            return Ok(new { success = true, message = "Despacho obtenido.", data = resultado, errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // PUT: api/despachos/venta/{idVenta}/avanzar (Vendedor: pasa el despacho a la etapa siguiente)
    // Para pasar a "Despachado" hay que indicar el número de seguimiento y las medidas del paquete.
    [HttpPut("venta/{idVenta}/avanzar")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> AvanzarDespacho(int idVenta, [FromBody] AvanzarDespachoDto dto, CancellationToken ct)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return Unauthorized();

            var venta = await VentasConDespacho().FirstOrDefaultAsync(v => v.id == idVenta, ct);
            if (venta == null) return NotFound(new { success = false, message = "Venta no encontrada." });
            if (venta.id_vendedor != rut) return Forbid();

            if (Cancelada(venta))
                return BadRequest(new { success = false, message = "El pedido está cancelado: no se puede enviar." });

            var despacho = venta.generar2s.Select(g => g.id_despachoNavigation).FirstOrDefault(d => d != null);
            if (despacho == null)
                return BadRequest(new { success = false, message = "Este pedido no tiene despacho." });

            var indice = Array.IndexOf(Etapas, despacho.estado);
            if (indice < 0)
                return BadRequest(new { success = false, message = "El despacho tiene un estado desconocido." });
            if (indice == Etapas.Length - 1)
                return BadRequest(new { success = false, message = "Este pedido ya fue entregado." });

            var siguiente = Etapas[indice + 1];
            var datos = LeerDatos(despacho.datoslogisticos);
            var envio = despacho.despachar2s.FirstOrDefault();
            var empresa = envio?.id_empresadNavigation;

            if (siguiente == "Despachado")
            {
                var seguimiento = dto.seguimiento?.Trim() ?? "";
                if (seguimiento == "")
                    return BadRequest(new { success = false, message = "Indica el número de seguimiento." });
                if (dto.ancho is not > 0 || dto.alto is not > 0 || dto.fondo is not > 0)
                    return BadRequest(new { success = false, message = "Indica el ancho, alto y fondo del paquete en centímetros." });

                // Si la compra no trajo empresa de despacho, se usa la que indica el vendedor
                if (empresa == null)
                {
                    var buscada = Normalizar(dto.transportista);
                    var elegida = buscada == ""
                        ? null
                        : (await _context.empresadespachos.ToListAsync(ct)).FirstOrDefault(e => Normalizar(e.nombre) == buscada);

                    if (elegida == null)
                        return BadRequest(new { success = false, message = "Elige una empresa de transporte válida." });

                    despacho.despachar2s.Add(new despachar2 { id_empresad = elegida.id, id_despacho = despacho.id, id_empresadNavigation = elegida });
                    datos["id_empresad"] = elegida.id;
                    empresa = elegida;
                }

                datos["seguimiento"] = seguimiento;
                // Con las medidas reales, el trigger de la base recalcula "costo_envio" al guardar
                datos["ancho_cm"] = dto.ancho!.Value;
                datos["alto_cm"] = dto.alto!.Value;
                datos["fondo_cm"] = dto.fondo!.Value;
                datos["fecha_estimada"] = DateTime.Today.AddDays(DiasEntrega(empresa.estandaresvolumetricos)).ToString("yyyy-MM-dd");
                datos.Remove("preparando");
            }

            // Historial: se conserva lo anterior y se agrega la etapa nueva
            var eventos = LeerEventos(datos, venta, despacho.estado, empresa?.nombre);
            eventos.Add(new Evento(siguiente, DateTime.Now.ToString("o"), TextoEvento(siguiente, empresa?.nombre)));
            datos["eventos"] = new JsonArray(eventos
                .Select(e => (JsonNode?)new JsonObject { ["estado"] = e.Estado, ["fecha"] = e.Fecha, ["detalle"] = e.Detalle })
                .ToArray());

            despacho.estado = siguiente;
            despacho.datoslogisticos = datos.ToJsonString();

            // Igual que la pantalla Pedidos: al entregar, la venta también queda entregada
            if (siguiente == "Entregado") venta.estado = "Entregado";

            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateException ex)
            {
                return Conflict(new { success = false, message = MensajeDeBase(ex) });
            }

            // El trigger pudo recalcular el costo: se vuelve a leer el despacho tal como quedó
            var actualizada = await VentasConDespacho().AsNoTracking().FirstAsync(v => v.id == idVenta, ct);

            return Ok(new { success = true, message = "Despacho actualizado.", data = ArmarDespacho(actualizada), errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}
