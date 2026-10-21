using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DespachosController : ControllerBase
{
    private readonly AppDbContext _context;

    public DespachosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/despachos/venta/{idVenta}
    [HttpGet("venta/{idVenta}")]
    public async Task<IActionResult> GetDespachoPorVenta(int idVenta)
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
}