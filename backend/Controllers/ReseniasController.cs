using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReseniasController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReseniasController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/resenias (Requiere Auth)
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CrearResenia([FromBody] ReseniaCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        if (dto.calificacion < 1 || dto.calificacion > 5)
            return BadRequest(new { success = false, message = "La calificación debe estar entre 1 y 5." });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Crear la Calificación base
            var nuevaCalificacion = new calificacion
            {
                calificacion1 = dto.calificacion,
                comentario = dto.comentario,
                fecha = DateTime.Today
            };
            _context.calificacions.Add(nuevaCalificacion);
            await _context.SaveChangesAsync();

            // 2. Vincular al producto o servicio
            if (dto.tipo.ToLower() == "producto")
            {
                var productoExiste = await _context.productos.AnyAsync(p => p.id == dto.id_item);
                if (!productoExiste) return NotFound(new { success = false, message = "Producto no encontrado." });

                var escribir1 = new escribir1
                {
                    id_calificacion = nuevaCalificacion.id,
                    id_producto = dto.id_item,
                    id_usuario = rut
                };
                _context.escribir1s.Add(escribir1);
            }
            else if (dto.tipo.ToLower() == "servicio")
            {
                var servicioExiste = await _context.servicios.AnyAsync(s => s.id == dto.id_item);
                if (!servicioExiste) return NotFound(new { success = false, message = "Servicio no encontrado." });

                var escribir2 = new escribir2
                {
                    id_calificacion = nuevaCalificacion.id,
                    id_servicio = dto.id_item,
                    id_usuario = rut
                };
                _context.escribir2s.Add(escribir2);
            }
            else
            {
                return BadRequest(new { success = false, message = "Tipo inválido. Use 'producto' o 'servicio'." });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Reseña creada exitosamente.", data = new { id = nuevaCalificacion.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error al crear la reseña.", errors = new[] { ex.Message } });
        }
    }

    // GET: api/resenias/producto/1 (Público)
    [HttpGet("producto/{idProducto}")]
    public async Task<IActionResult> GetReseniasProducto(int idProducto)
    {
        var resenias = await _context.escribir1s
            .Where(e => e.id_producto == idProducto)
            .Include(e => e.id_calificacionNavigation)
            .Include(e => e.id_usuarioNavigation)
            .Select(e => new
            {
                id = e.id_calificacion,
                usuario = e.id_usuarioNavigation.nombre,
                calificacion = e.id_calificacionNavigation.calificacion1,
                comentario = e.id_calificacionNavigation.comentario,
                fecha = e.id_calificacionNavigation.fecha
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Reseñas obtenidas.", data = resenias, errors = (object?)null });
    }
}