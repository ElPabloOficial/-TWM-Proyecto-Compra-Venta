using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;
using System.IO;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevolucionesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public DevolucionesController(
        AppDbContext context,
        IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
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
    public async Task<IActionResult> CrearDevolucion(
        [FromForm] DevolucionCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });
    
        if (dto.cantidad <= 0)
            return BadRequest(new { success = false, message = "La cantidad debe ser mayor a 0." });
    
        // Validar venta
        var venta = await _context.venta.FindAsync(dto.id_venta);
    
        if (venta == null)
            return NotFound(new { success = false, message = "Venta no encontrada." });
    
        if (venta.id_cliente != rut)
            return Forbid();
    
        // Validar producto
        var detalleVenta = await _context.generar3s
            .FirstOrDefaultAsync(g =>
                g.id_venta == dto.id_venta &&
                g.id_producto == dto.id_producto);
    
        if (detalleVenta == null)
            return BadRequest(new { success = false, message = "El producto no pertenece a esta venta." });
    
        if (dto.cantidad > detalleVenta.cantidad)
            return BadRequest(new { success = false, message = $"Solo compraste {detalleVenta.cantidad} unidades." });
    
        string? rutaImagen = null;
        string? rutaFisica = null;
    
        try
        {
            // Guardar imagen si el usuario adjuntó una
            if (dto.imagen != null && dto.imagen.Length > 0)
            {
                // Máximo 5 MB
                if (dto.imagen.Length > 5 * 1024 * 1024)
                    return BadRequest(new { success = false, message = "La imagen no puede superar los 5 MB." });
    
                var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var extension = Path.GetExtension(dto.imagen.FileName).ToLowerInvariant();
    
                if (!extensionesPermitidas.Contains(extension))
                    return BadRequest(new { success = false, message = "Formato de imagen no permitido." });
    
                var tiposPermitidos = new[] { "image/jpeg", "image/png", "image/webp" };
    
                if (!tiposPermitidos.Contains(dto.imagen.ContentType.ToLowerInvariant()))
                    return BadRequest(new { success = false, message = "El archivo debe ser una imagen válida." });
    
                var carpeta = Path.Combine(
                    _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"),
                    "uploads",
                    "devoluciones"
                );
    
                Directory.CreateDirectory(carpeta);
    
                var nombreArchivo = $"{Guid.NewGuid()}{extension}";
    
                rutaFisica = Path.Combine(carpeta, nombreArchivo);
                rutaImagen = $"/uploads/devoluciones/{nombreArchivo}";
    
                using (var stream = new FileStream(rutaFisica, FileMode.Create))
                {
                    await dto.imagen.CopyToAsync(stream);
                }
            }
    
            using var transaction = await _context.Database.BeginTransactionAsync();
    
            // Crear devolución
            var nuevaDevolucion = new devolucion
            {
                motivo = dto.motivo,
                fechasolicitud = DateOnly.FromDateTime(DateTime.Now),
                estado = "En Proceso",
                tipodevolucion = dto.tipodevolucion,
                montoreintegrado = 0,
                rutaimagen = rutaImagen
            };
    
            _context.devolucions.Add(nuevaDevolucion);
            await _context.SaveChangesAsync();
    
            // Asociar devolución a venta, producto y usuario
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
    
            return Ok(new
            {
                success = true,
                message = "Devolución solicitada.",
                data = new { id = nuevaDevolucion.id },
                errors = (object?)null
            });
        }
        catch (Exception ex)
        {
            // Si falla el registro, eliminar la imagen guardada
            if (rutaFisica != null && System.IO.File.Exists(rutaFisica))
                System.IO.File.Delete(rutaFisica);
    
            return StatusCode(500, new
            {
                success = false,
                message = "Error al crear la devolución.",
                errors = new[] { ex.Message }
            });
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