using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificacionesController : ControllerBase
{
    private const int MaxPorOrigen = 30;
    private const int MaxTotal = 60;

    private readonly AppDbContext _context;

    public NotificacionesController(AppDbContext context)
    {
        _context = context;
    }

    // La base de datos no tiene una tabla de notificaciones: se arman al consultar, a partir de lo que ya existe
    // (preguntas, mensajes de venta, pedidos, devoluciones, cotizaciones y ofertas de la lista de deseos).
    // Cada notificación lleva un id estable; si algo cambia de estado (por ejemplo un pedido pasa a "Entregado"),
    // el id cambia y vuelve a aparecer como nueva. Qué notificaciones ya leyó el usuario lo guarda el front.
    //
    // tipo: "mensaje" (mensajes y preguntas), "oferta" o "sistema" (pedidos, ventas, devoluciones, cotizaciones).
    // soloFecha: true cuando el dato de origen no trae hora (el front muestra "Hoy", "Ayer" o la fecha).
    private sealed record Notificacion(
        string Id, string Tipo, string Titulo, string Descripcion, DateTime Fecha, bool SoloFecha, string Ruta);

    private static string Resumir(string? texto, int max = 90)
    {
        var t = (texto ?? "").Trim();
        return t.Length <= max ? t : t[..max].TrimEnd() + "…";
    }

    private static DateTime Dia(DateOnly fecha) => fecha.ToDateTime(TimeOnly.MinValue);

    // GET: api/notificaciones (Mis notificaciones, de la más nueva a la más antigua)
    [HttpGet]
    public async Task<IActionResult> GetMisNotificaciones()
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut))
                return Unauthorized(new { success = false, message = "Usuario no autenticado." });

            var lista = new List<Notificacion>();

            // 1. Respondieron una pregunta que hice (producto o servicio)
            var respondidasProd = await _context.hacer1s
                .Where(h => h.id_usuario == rut && h.id_preguntaNavigation.respuesta != null)
                .OrderByDescending(h => h.id_preguntaNavigation.fecharespuesta ?? h.id_preguntaNavigation.fechacreacion)
                .Take(MaxPorOrigen)
                .Select(h => new
                {
                    h.id_pregunta,
                    idItem = h.id_producto,
                    nombre = h.id_productoNavigation.nombre,
                    pregunta = h.id_preguntaNavigation.pregunta1,
                    fecha = h.id_preguntaNavigation.fecharespuesta ?? h.id_preguntaNavigation.fechacreacion
                })
                .ToListAsync();

            var respondidasServ = await _context.hacer2s
                .Where(h => h.id_usuario == rut && h.id_preguntaNavigation.respuesta != null)
                .OrderByDescending(h => h.id_preguntaNavigation.fecharespuesta ?? h.id_preguntaNavigation.fechacreacion)
                .Take(MaxPorOrigen)
                .Select(h => new
                {
                    h.id_pregunta,
                    idItem = h.id_servicio,
                    nombre = h.id_servicioNavigation.nombre,
                    pregunta = h.id_preguntaNavigation.pregunta1,
                    fecha = h.id_preguntaNavigation.fecharespuesta ?? h.id_preguntaNavigation.fechacreacion
                })
                .ToListAsync();

            lista.AddRange(respondidasProd.Select(r => new Notificacion(
                $"respuesta-{r.id_pregunta}", "mensaje", "Nueva respuesta pública disponible",
                $"Respondieron tu pregunta sobre «{r.nombre}»: \"{Resumir(r.pregunta)}\"",
                r.fecha, false, $"/producto/{r.idItem}")));
            lista.AddRange(respondidasServ.Select(r => new Notificacion(
                $"respuesta-{r.id_pregunta}", "mensaje", "Nueva respuesta pública disponible",
                $"Respondieron tu pregunta sobre «{r.nombre}»: \"{Resumir(r.pregunta)}\"",
                r.fecha, false, $"/servicio/{r.idItem}")));

            // 2. Preguntas sin responder en lo que yo vendo
            var pendientesProd = await _context.hacer1s
                .Where(h => h.id_usuario != rut
                    && h.id_preguntaNavigation.respuesta == null
                    && _context.ofrecer1s.Any(o => o.id_producto == h.id_producto && o.id_usuario == rut))
                .OrderByDescending(h => h.id_preguntaNavigation.fechacreacion)
                .Take(MaxPorOrigen)
                .Select(h => new
                {
                    h.id_pregunta,
                    idItem = h.id_producto,
                    nombre = h.id_productoNavigation.nombre,
                    pregunta = h.id_preguntaNavigation.pregunta1,
                    fecha = h.id_preguntaNavigation.fechacreacion
                })
                .ToListAsync();

            var pendientesServ = await _context.hacer2s
                .Where(h => h.id_usuario != rut
                    && h.id_preguntaNavigation.respuesta == null
                    && _context.ofrecer2s.Any(o => o.id_servicio == h.id_servicio && o.id_usuario == rut))
                .OrderByDescending(h => h.id_preguntaNavigation.fechacreacion)
                .Take(MaxPorOrigen)
                .Select(h => new
                {
                    h.id_pregunta,
                    idItem = h.id_servicio,
                    nombre = h.id_servicioNavigation.nombre,
                    pregunta = h.id_preguntaNavigation.pregunta1,
                    fecha = h.id_preguntaNavigation.fechacreacion
                })
                .ToListAsync();

            lista.AddRange(pendientesProd.Select(r => new Notificacion(
                $"pregunta-{r.id_pregunta}", "mensaje", "Tienes una pregunta sin responder",
                $"Preguntaron en «{r.nombre}»: \"{Resumir(r.pregunta)}\"",
                r.fecha, false, $"/producto/{r.idItem}")));
            lista.AddRange(pendientesServ.Select(r => new Notificacion(
                $"pregunta-{r.id_pregunta}", "mensaje", "Tienes una pregunta sin responder",
                $"Preguntaron en «{r.nombre}»: \"{Resumir(r.pregunta)}\"",
                r.fecha, false, $"/servicio/{r.idItem}")));

            // 3. Mensajes que me escribieron en el chat de una venta mía
            var mensajes = await _context.enviars
                .Where(e => e.id_usuario != rut
                    && (e.id_ventaNavigation.id_cliente == rut || e.id_ventaNavigation.id_vendedor == rut))
                .OrderByDescending(e => e.id_mensajeNavigation.fechaenvio)
                .ThenByDescending(e => e.id_mensaje)
                .Take(MaxPorOrigen)
                .Select(e => new
                {
                    e.id_mensaje,
                    e.id_venta,
                    contenido = e.id_mensajeNavigation.contenido,
                    fecha = e.id_mensajeNavigation.fechaenvio,
                    remitente = e.id_usuarioNavigation.nombre,
                    soyCliente = e.id_ventaNavigation.id_cliente == rut
                })
                .ToListAsync();

            lista.AddRange(mensajes.Select(m => new Notificacion(
                $"mensaje-{m.id_mensaje}", "mensaje", "Tienes un mensaje nuevo en tu chat",
                $"{m.remitente} te envió un mensaje (venta #{m.id_venta}): \"{Resumir(m.contenido)}\"",
                Dia(m.fecha), true, m.soyCliente ? "/mensajes/cliente" : "/mensajes/vendedor")));

            // 4. Estado de mis pedidos (como cliente). El despacho no guarda la fecha de cada cambio de estado,
            //    así que se usa la fecha de la compra como referencia.
            var pedidos = await _context.generar2s
                .Where(g => g.id_venta != null
                    && g.id_ventaNavigation!.id_cliente == rut
                    && g.id_ventaNavigation.fecha != null)
                .OrderByDescending(g => g.id_ventaNavigation!.fecha)
                .Take(MaxPorOrigen)
                .Select(g => new
                {
                    idVenta = g.id_venta!.Value,
                    g.id_despacho,
                    estado = g.id_despachoNavigation.estado,
                    fecha = g.id_ventaNavigation!.fecha!.Value
                })
                .ToListAsync();

            lista.AddRange(pedidos.Select(p => new Notificacion(
                $"pedido-{p.idVenta}-{p.id_despacho}-{p.estado}", "sistema",
                p.estado switch
                {
                    "En Preparación" => "Estamos preparando tu pedido",
                    "Despachado" => "Tu pedido fue despachado",
                    "En reparto" => "Tu pedido va en camino",
                    "Entregado" => "¡Tu compra ha sido entregada con éxito!",
                    _ => $"Tu pedido está {p.estado.ToLower()}"
                },
                $"Pedido #{p.idVenta} (compra del {p.fecha:dd-MM-yyyy}): {p.estado}.",
                p.fecha, false, $"/seguimiento/{p.idVenta}")));

            // 5. Ventas nuevas (como vendedor)
            var ventas = await _context.venta
                .Where(v => v.id_vendedor == rut && v.fecha != null)
                .OrderByDescending(v => v.fecha)
                .Take(MaxPorOrigen)
                .Select(v => new { v.id, fecha = v.fecha!.Value, cliente = v.id_clienteNavigation.nombre })
                .ToListAsync();

            lista.AddRange(ventas.Select(v => new Notificacion(
                $"venta-{v.id}", "sistema", "Tienes una nueva venta",
                $"{v.cliente} compró en tu tienda (venta #{v.id}).",
                v.fecha, false, "/pedidos")));

            // 6. Devoluciones que pedí
            var devoluciones = await _context.generar1s
                .Where(g => g.id_usuario == rut)
                .OrderByDescending(g => g.id_devolucionNavigation.fecharesolucion ?? g.id_devolucionNavigation.fechasolicitud)
                .Take(MaxPorOrigen)
                .Select(g => new
                {
                    g.id_devolucion,
                    g.id_venta,
                    producto = g.id_productoNavigation.nombre,
                    estado = g.id_devolucionNavigation.estado,
                    resolucion = g.id_devolucionNavigation.fecharesolucion,
                    solicitud = g.id_devolucionNavigation.fechasolicitud
                })
                .ToListAsync();

            lista.AddRange(devoluciones.Select(d => new Notificacion(
                $"devolucion-{d.id_devolucion}-{d.estado}", "sistema",
                d.estado switch
                {
                    "Aprobada" => "Tu devolución fue aprobada",
                    "Rechazada" => "Tu devolución fue rechazada",
                    _ => $"Tu devolución está {d.estado.ToLower()}"
                },
                $"Devolución de «{d.producto}» (venta #{d.id_venta}).",
                Dia(d.resolucion ?? d.solicitud), true, "/seguimiento-devoluciones")));

            // 7. Cotizaciones que pedí (productos y servicios). Si además yo vendo lo cotizado, llevan a
            //    "Cotizaciones recibidas" (/cotizaciones); si no, a "Mis cotizaciones" (/mis-cotizaciones).
            var cotProd = await _context.solicitar1s
                .Where(s => s.id_usuario == rut)
                .OrderByDescending(s => s.id_cotizacionNavigation.fechaultimaactualizacion ?? s.id_cotizacionNavigation.fechacreacion)
                .Take(MaxPorOrigen)
                .Select(s => new
                {
                    s.id_cotizacion,
                    estado = s.id_cotizacionNavigation.estado,
                    fecha = s.id_cotizacionNavigation.fechaultimaactualizacion ?? s.id_cotizacionNavigation.fechacreacion,
                    nombre = s.id_productoNavigation.nombre,
                    vendo = _context.ofrecer1s.Any(o => o.id_producto == s.id_producto && o.id_usuario == rut)
                })
                .ToListAsync();

            var cotServ = await _context.solicitar2s
                .Where(s => s.id_usuario == rut)
                .OrderByDescending(s => s.id_cotizacionNavigation.fechaultimaactualizacion ?? s.id_cotizacionNavigation.fechacreacion)
                .Take(MaxPorOrigen)
                .Select(s => new
                {
                    s.id_cotizacion,
                    estado = s.id_cotizacionNavigation.estado,
                    fecha = s.id_cotizacionNavigation.fechaultimaactualizacion ?? s.id_cotizacionNavigation.fechacreacion,
                    nombre = s.id_servicioNavigation.nombre,
                    vendo = s.id_oferente == rut
                })
                .ToListAsync();

            lista.AddRange(cotProd.Concat(cotServ)
                .GroupBy(c => c.id_cotizacion)
                .Select(g => new { primero = g.First(), vendo = g.Any(x => x.vendo) })
                .Select(g => new Notificacion(
                    $"cotizacion-{g.primero.id_cotizacion}-{g.primero.estado}", "sistema",
                    $"Tu cotización #{g.primero.id_cotizacion} está {g.primero.estado.ToLower()}",
                    $"Cotización de «{g.primero.nombre}».",
                    Dia(g.primero.fecha), true, g.vendo ? "/cotizaciones" : "/mis-cotizaciones")));

            // 7b. Cotizaciones que me pidieron a mí como vendedor: nuevas solicitudes por responder y las que el
            //     cliente aceptó. Llevan a "Cotizaciones recibidas" (/cotizaciones).
            var hoyCotizaciones = DateOnly.FromDateTime(DateTime.Today);

            var recibidas = await _context.cotizacions
                .AsNoTracking()
                .Include(c => c.solicitar1s).ThenInclude(s => s.id_productoNavigation)
                .Include(c => c.solicitar1s).ThenInclude(s => s.id_usuarioNavigation)
                .Include(c => c.solicitar2s).ThenInclude(s => s.id_servicioNavigation)
                .Include(c => c.solicitar2s).ThenInclude(s => s.id_usuarioNavigation)
                .AsSplitQuery()
                .Where(c => c.solicitar1s.Any(s => s.id_usuario != rut
                                && _context.ofrecer1s.Any(o => o.id_producto == s.id_producto && o.id_usuario == rut))
                         || c.solicitar2s.Any(s => s.id_usuario != rut && s.id_oferente == rut))
                .OrderByDescending(c => c.fechaultimaactualizacion ?? c.fechacreacion)
                .Take(MaxPorOrigen)
                .ToListAsync();

            var idsProductosRecibidos = recibidas.SelectMany(c => c.solicitar1s).Select(s => s.id_producto).Distinct().ToList();
            var misProductos = (await _context.ofrecer1s
                    .Where(o => o.id_usuario == rut && idsProductosRecibidos.Contains(o.id_producto))
                    .Select(o => o.id_producto)
                    .ToListAsync())
                .ToHashSet();

            foreach (var c in recibidas)
            {
                var solicitada = c.estado is "Solicitada" or "En Proceso" or "En revisión" or "Pendiente";
                var aceptada = c.estado == "Aceptada";
                if (!solicitada && !aceptada) continue;

                // Si yo mismo la pedí, ya aparece en el punto 7 (con el enlace que corresponde)
                if (c.solicitar1s.Any(s => s.id_usuario == rut) || c.solicitar2s.Any(s => s.id_usuario == rut)) continue;

                // Una solicitud sin responder que ya pasó su vigencia (15 días) deja de avisarse
                var ultima = c.fechaultimaactualizacion ?? c.fechacreacion;
                if (solicitada && hoyCotizaciones > ultima.AddDays(15)) continue;

                var cliente = c.solicitar1s.Select(s => s.id_usuarioNavigation.nombre)
                    .Concat(c.solicitar2s.Select(s => s.id_usuarioNavigation.nombre))
                    .FirstOrDefault() ?? "Un cliente";
                var items = string.Join(", ",
                    c.solicitar1s.Where(s => s.id_usuario != rut && misProductos.Contains(s.id_producto))
                        .Select(s => s.id_productoNavigation.nombre)
                        .Concat(c.solicitar2s.Where(s => s.id_usuario != rut && s.id_oferente == rut)
                            .Select(s => s.id_servicioNavigation.nombre)));

                lista.Add(new Notificacion(
                    $"cotizacion-recibida-{c.id}-{(solicitada ? "solicitada" : "aceptada")}", "sistema",
                    solicitada ? "Te solicitaron una cotización" : "El cliente aceptó tu cotización",
                    solicitada
                        ? $"{cliente} pidió cotizar: {Resumir(items)} (cotización #{c.id})."
                        : $"{cliente} aceptó la cotización #{c.id}: {Resumir(items)}.",
                    Dia(solicitada ? c.fechacreacion : ultima), true, "/cotizaciones"));
            }

            // 8. Productos o servicios de mi lista de deseos que están en oferta
            var hoy = DateOnly.FromDateTime(DateTime.Today);

            var ofertasProd = await _context.crear1s
                .Where(c => c.id_usuario == rut
                    && c.id_productoNavigation.id_ofertaNavigation != null
                    && c.id_productoNavigation.id_ofertaNavigation.estado == true)
                .Select(c => new
                {
                    id = c.id_producto,
                    nombre = c.id_productoNavigation.nombre,
                    descuento = c.id_productoNavigation.id_ofertaNavigation!.preciooferta,
                    inicio = c.id_productoNavigation.fechainicio,
                    fin = c.id_productoNavigation.fechafin
                })
                .ToListAsync();

            var ofertasServ = await _context.crear2s
                .Where(c => c.id_usuario == rut
                    && c.id_servicioNavigation.id_ofertaNavigation != null
                    && c.id_servicioNavigation.id_ofertaNavigation.estado == true)
                .Select(c => new
                {
                    id = c.id_servicio,
                    nombre = c.id_servicioNavigation.nombre,
                    descuento = c.id_servicioNavigation.id_ofertaNavigation!.preciooferta,
                    inicio = c.id_servicioNavigation.fechainicio,
                    fin = c.id_servicioNavigation.fechafin
                })
                .ToListAsync();

            // Oferta.PrecioOferta guarda el descuento (0.15 = 15 %); solo cuentan las ofertas vigentes hoy
            bool Vigente(DateOnly? inicio, DateOnly? fin) => (inicio == null || inicio <= hoy) && (fin == null || hoy <= fin);

            Notificacion Oferta(string clave, string ruta, string nombre, decimal descuento, DateOnly? inicio, DateOnly? fin)
            {
                var pct = (int)Math.Round(descuento * 100, MidpointRounding.AwayFromZero);
                var hasta = fin != null ? $" hasta el {fin:dd-MM-yyyy}" : "";
                return new Notificacion(
                    $"oferta-{clave}-{pct}", "oferta", "¡Algo de tu lista de deseos está en oferta!",
                    $"«{nombre}» tiene {pct}% de descuento{hasta}.",
                    Dia(inicio ?? hoy), true, ruta);
            }

            lista.AddRange(ofertasProd
                .Where(o => Vigente(o.inicio, o.fin))
                .DistinctBy(o => o.id)
                .Take(MaxPorOrigen)
                .Select(o => Oferta($"p{o.id}", $"/producto/{o.id}", o.nombre, o.descuento, o.inicio, o.fin)));
            lista.AddRange(ofertasServ
                .Where(o => Vigente(o.inicio, o.fin))
                .DistinctBy(o => o.id)
                .Take(MaxPorOrigen)
                .Select(o => Oferta($"s{o.id}", $"/servicio/{o.id}", o.nombre, o.descuento, o.inicio, o.fin)));

            var data = lista
                .DistinctBy(n => n.Id)
                .OrderByDescending(n => n.Fecha)
                .Take(MaxTotal)
                .Select(n => new
                {
                    id = n.Id,
                    tipo = n.Tipo,
                    titulo = n.Titulo,
                    descripcion = n.Descripcion,
                    fecha = n.Fecha,
                    soloFecha = n.SoloFecha,
                    ruta = n.Ruta
                })
                .ToList();

            return Ok(new { success = true, message = "Notificaciones obtenidas.", data, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}