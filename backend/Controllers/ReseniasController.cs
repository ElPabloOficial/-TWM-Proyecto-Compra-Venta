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

    [HttpPost]
[Authorize]
public async Task<IActionResult> CrearResenia([FromBody] ReseniaCreateDto dto)
{
    var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(rut))
        return Unauthorized(new
        {
            success = false,
            message = "Usuario no autenticado."
        });

    if (dto.calificacion < 1 || dto.calificacion > 5)
        return BadRequest(new
        {
            success = false,
            message = "La calificación debe estar entre 1 y 5."
        });

    if (string.IsNullOrWhiteSpace(dto.tipo))
        return BadRequest(new
        {
            success = false,
            message = "Debe indicar el tipo de reseña."
        });

    var tipo = dto.tipo.ToLower();

    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        // ==========================================
        // RESEÑA DE PRODUCTO
        // ==========================================
        if (tipo == "producto")
        {
            // 1. Verificar que el producto exista
            var productoExiste = await _context.productos
                .AnyAsync(p => p.id == dto.id_item);

            if (!productoExiste)
            {
                await transaction.RollbackAsync();

                return NotFound(new
                {
                    success = false,
                    message = "Producto no encontrado."
                });
            }

            // 2. Verificar que el usuario haya comprado el producto
            var comproProducto = await _context.generar3s
                .AnyAsync(g =>
                    g.id_producto == dto.id_item &&
                    g.id_ventaNavigation.id_cliente == rut
                );

            if (!comproProducto)
            {
                await transaction.RollbackAsync();

                return Forbid();
            }

            // 3. Crear la calificación
            var nuevaCalificacion = new calificacion
            {
                calificacion1 = dto.calificacion,
                comentario = dto.comentario,
                fecha = DateTime.Today
            };

            _context.calificacions.Add(nuevaCalificacion);

            await _context.SaveChangesAsync();

            // 4. Vincular calificación con producto y usuario
            var escribir1 = new escribir1
            {
                id_calificacion = nuevaCalificacion.id,
                id_producto = dto.id_item,
                id_usuario = rut
            };

            _context.escribir1s.Add(escribir1);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                message = "Reseña creada exitosamente.",
                data = new
                {
                    id = nuevaCalificacion.id
                },
                errors = (object?)null
            });
        }

        // ==========================================
        // RESEÑA DE SERVICIO
        // ==========================================
        if (tipo == "servicio")
        {
            // 1. Verificar que el servicio exista
            var servicioExiste = await _context.servicios
                .AnyAsync(s => s.id == dto.id_item);

            if (!servicioExiste)
            {
                await transaction.RollbackAsync();

                return NotFound(new
                {
                    success = false,
                    message = "Servicio no encontrado."
                });
            }

            // 2. Verificar que el usuario haya comprado el servicio
            var comproServicio = await _context.generar4s
                .AnyAsync(g =>
                    g.id_servicio == dto.id_item &&
                    g.id_ventaNavigation.id_cliente == rut
                );

            if (!comproServicio)
            {
                await transaction.RollbackAsync();

                return Forbid();
            }

            // 3. Crear la calificación
            var nuevaCalificacion = new calificacion
            {
                calificacion1 = dto.calificacion,
                comentario = dto.comentario,
                fecha = DateTime.Today
            };

            _context.calificacions.Add(nuevaCalificacion);

            await _context.SaveChangesAsync();

            // 4. Vincular calificación con servicio y usuario
            var escribir2 = new escribir2
            {
                id_calificacion = nuevaCalificacion.id,
                id_servicio = dto.id_item,
                id_usuario = rut
            };

            _context.escribir2s.Add(escribir2);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                message = "Reseña creada exitosamente.",
                data = new
                {
                    id = nuevaCalificacion.id
                },
                errors = (object?)null
            });
        }

        await transaction.RollbackAsync();

        return BadRequest(new
        {
            success = false,
            message = "Tipo inválido. Use 'producto' o 'servicio'."
        });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();

        return StatusCode(500, new
        {
            success = false,
            message = "Error al crear la reseña.",
            errors = new[] { ex.Message }
        });
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