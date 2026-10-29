using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevolucionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DevolucionesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/devoluciones (Ver mis devoluciones como cliente o vendedor)
    [HttpGet]
    public async Task<IActionResult> GetMisDevoluciones()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var devoluciones = await _context.generar1s
            .Where(g => g.id_usuario == rut || g.id_ventaNavigation.id_vendedor == rut)
            .Include(g => g.id_devolucionNavigation)
            .Include(g => g.id_productoNavigation)
            .Include(g => g.id_ventaNavigation)
            .Select(g => new
            {
                id = g.id_devolucion,
                venta = g.id_venta,
                producto = g.id_productoNavigation.nombre,
                cantidad = g.cantidad,
                motivo = g.id_devolucionNavigation.motivo,
                estado = g.id_devolucionNavigation.estado,
                tipodevolucion = g.id_devolucionNavigation.tipodevolucion,
                monto_reintegrado = g.id_devolucionNavigation.montoreintegrado,
                fecha_solicitud = g.id_devolucionNavigation.fechasolicitud,
                fecha_resolucion = g.id_devolucionNavigation.fecharesolucion
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Devoluciones obtenidas.", data = devoluciones, errors = (object?)null });
    }

    // POST: api/devoluciones (Solicitar devolución)
    [HttpPost]
    public async Task<IActionResult> CrearDevolucion([FromBody] DevolucionCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        if (dto.cantidad <= 0)
            return BadRequest(new { success = false, message = "La cantidad debe ser mayor a 0." });

        // Validar que la venta exista, sea del cliente y tenga este producto
        var venta = await _context.venta.FindAsync(dto.id_venta);
        if (venta == null)
            return NotFound(new { success = false, message = "Venta no encontrada." });

        if (venta.id_cliente != rut)
            return Forbid();

        // Validar que el producto esté en la venta y que no se haya devuelto ya
        var detalleVenta = await _context.generar3s
            .FirstOrDefaultAsync(g => g.id_venta == dto.id_venta && g.id_producto == dto.id_producto);

        if (detalleVenta == null)
            return BadRequest(new { success = false, message = "El producto no pertenece a esta venta." });

        if (dto.cantidad > detalleVenta.cantidad)
            return BadRequest(new { success = false, message = $"Solo compraste {detalleVenta.cantidad} unidades." });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Crear la devolución
            var nuevaDevolucion = new devolucion
            {
                motivo = dto.motivo,
                fechasolicitud = DateOnly.FromDateTime(DateTime.Now),
                estado = "En Proceso",
                tipodevolucion = dto.tipodevolucion,
                montoreintegrado = 0
            };
            _context.devolucions.Add(nuevaDevolucion);
            await _context.SaveChangesAsync();

            // 2. Vincular a la venta/producto/usuario
            var generar1 = new generar1
            {
                id_usuario = rut,
                id_devolucion = nuevaDevolucion.id,
                id_venta = dto.id_venta,
                id_producto = dto.id_producto,
                cantidad = dto.cantidad
            };
            _context.generar1s.Add(generar1);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Devolución solicitada.", data = new { id = nuevaDevolucion.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error al crear la devolución.", errors = new[] { ex.Message } });
        }
    }

    // PUT: api/devoluciones/{id}/estado (Actualizar estado - solo admin)
    [HttpPut("{id}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] DevolucionEstadoDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var devolucionDb = await _context.devolucions.FindAsync(id);
        if (devolucionDb == null)
            return NotFound(new { success = false, message = "Devolución no encontrada." });

        // Validar que el usuario sea el vendedor de la venta asociada
        var generar1 = await _context.generar1s
            .Include(g => g.id_ventaNavigation)
            .FirstOrDefaultAsync(g => g.id_devolucion == id);

        if (generar1 == null || generar1.id_ventaNavigation.id_vendedor != rut)
            return Forbid();

        devolucionDb.estado = dto.estado;
        devolucionDb.montoreintegrado = dto.montoreintegrado ?? 0;

        if (dto.estado == "Aprobada" || dto.estado == "Rechazada")
            devolucionDb.fecharesolucion = DateOnly.FromDateTime(DateTime.Now);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Estado actualizado.", data = (object?)null, errors = (object?)null });
    }
}