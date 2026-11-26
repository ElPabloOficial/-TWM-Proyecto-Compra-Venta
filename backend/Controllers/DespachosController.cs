using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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

    // GET: api/despachos/venta/{idVenta}
    [HttpGet("venta/{idVenta}")]
    public async Task<IActionResult> GetDespachoPorVenta(int idVenta)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut)) return Unauthorized();

            // 1. Verificar que la venta pertenezca al usuario (cliente o vendedor)
            var venta = await _context.venta.FindAsync(idVenta);
            if (venta == null) return NotFound(new { success = false, message = "Venta no encontrada." });
        
            if (venta.id_cliente != rut && venta.id_vendedor != rut)
                return Forbid();

            // 2. Buscar el despacho asociado a la venta
            var generar2 = await _context.generar2s
                .Include(g => g.id_despachoNavigation)
                    .ThenInclude(d => d.id_direccionNavigation)
                    .ThenInclude(dir => dir.id_comunaNavigation)
                .Include(g => g.id_despachoNavigation)
                    .ThenInclude(d => d.despachar2s)
                    .ThenInclude(ds => ds.id_empresadNavigation)
                .FirstOrDefaultAsync(g => g.id_venta == idVenta);

            if (generar2 == null || generar2.id_despachoNavigation == null)
                return NotFound(new { success = false, message = "Esta venta no tiene despacho asociado o aún no se ha generado." });

            var despacho = generar2.id_despachoNavigation;
            var empresa = despacho.despachar2s.FirstOrDefault()?.id_empresadNavigation;
            var tracking = despacho.despachar2s.FirstOrDefault()?.numeroseguimiento;

            var resultado = new
            {
                id_despacho = despacho.id,
                estado = despacho.estado, // "En Preparación", "Despachado", "En reparto", "Entregado"
                empresa_despacho = empresa?.nombre,
                numero_seguimiento = tracking,
                direccion_entrega = new
                {
                    calle = despacho.id_direccionNavigation.calle,
                    numero = despacho.id_direccionNavigation.numero,
                    comuna = despacho.id_direccionNavigation.id_comunaNavigation.nombre
                },
                datos_logisticos = despacho.datoslogisticos // JSON con fechas estimadas
            };

            return Ok(new { success = true, message = "Despacho obtenido.", data = resultado, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}