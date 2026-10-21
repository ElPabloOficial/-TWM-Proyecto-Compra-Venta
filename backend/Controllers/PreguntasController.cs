using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PreguntasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PreguntasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/preguntas/producto/1 (Público)
    [HttpGet("producto/{idProducto}")]
    public async Task<IActionResult> GetPreguntasProducto(int idProducto)
    {
        var preguntas = await _context.hacer1s
            .Where(h => h.id_producto == idProducto)
            .Include(h => h.id_preguntaNavigation)
            .Include(h => h.id_usuarioNavigation)
            .Select(h => new
            {
                id = h.id_pregunta,
                usuario = h.id_usuarioNavigation.nombre,
                pregunta = h.id_preguntaNavigation.pregunta1,
                fecha = h.id_preguntaNavigation.fechacreacion,
                respuesta = h.id_preguntaNavigation.respuesta,
                fecha_respuesta = h.id_preguntaNavigation.fecharespuesta
            })
            .OrderByDescending(p => p.fecha)
            .ToListAsync();

        return Ok(new { success = true, message = "Preguntas obtenidas.", data = preguntas, errors = (object?)null });
    }

    // GET: api/preguntas/servicio/1 (Público)
    [HttpGet("servicio/{idServicio}")]
    public async Task<IActionResult> GetPreguntasServicio(int idServicio)
    {
        var preguntas = await _context.hacer2s
            .Where(h => h.id_servicio == idServicio)
            .Include(h => h.id_preguntaNavigation)
            .Include(h => h.id_usuarioNavigation)
            .Select(h => new
            {
                id = h.id_pregunta,
                usuario = h.id_usuarioNavigation.nombre,
                pregunta = h.id_preguntaNavigation.pregunta1,
                fecha = h.id_preguntaNavigation.fechacreacion,
                respuesta = h.id_preguntaNavigation.respuesta,
                fecha_respuesta = h.id_preguntaNavigation.fecharespuesta
            })
            .OrderByDescending(p => p.fecha)
            .ToListAsync();

        return Ok(new { success = true, message = "Preguntas obtenidas.", data = preguntas, errors = (object?)null });
    }

    // POST: api/preguntas (Requiere Auth)
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CrearPregunta([FromBody] PreguntaCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        if (string.IsNullOrWhiteSpace(dto.pregunta))
            return BadRequest(new { success = false, message = "La pregunta no puede estar vacía." });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Crear la pregunta base
            var nuevaPregunta = new pregunta
            {
                pregunta1 = dto.pregunta,
                fechacreacion = DateTime.Today
            };
            _context.preguntas.Add(nuevaPregunta);
            await _context.SaveChangesAsync();

            // 2. Vincular al producto o servicio
            if (dto.tipo.ToLower() == "producto")
            {
                var productoExiste = await _context.productos.AnyAsync(p => p.id == dto.id_item);
                if (!productoExiste) return NotFound(new { success = false, message = "Producto no encontrado." });

                var hacer1 = new hacer1
                {
                    id_producto = dto.id_item,
                    id_pregunta = nuevaPregunta.id,
                    id_usuario = rut
                };
                _context.hacer1s.Add(hacer1);
            }
            else if (dto.tipo.ToLower() == "servicio")
            {
                var servicioExiste = await _context.servicios.AnyAsync(s => s.id == dto.id_item);
                if (!servicioExiste) return NotFound(new { success = false, message = "Servicio no encontrado." });

                var hacer2 = new hacer2
                {
                    id_servicio = dto.id_item,
                    id_pregunta = nuevaPregunta.id,
                    id_usuario = rut
                };
                _context.hacer2s.Add(hacer2);
            }
            else
            {
                return BadRequest(new { success = false, message = "Tipo inválido. Use 'producto' o 'servicio'." });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Pregunta enviada.", data = new { id = nuevaPregunta.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error al crear la pregunta.", errors = new[] { ex.Message } });
        }
    }

    // PUT: api/preguntas/responder (Requiere Auth - Solo el vendedor debería poder responder, pero por simplicidad cualquier usuario autenticado puede)
    [HttpPut("responder")]
    [Authorize]
    public async Task<IActionResult> ResponderPregunta([FromBody] RespuestaCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var preguntaDb = await _context.preguntas.FindAsync(dto.id_pregunta);
        if (preguntaDb == null)
            return NotFound(new { success = false, message = "Pregunta no encontrada." });

        if (!string.IsNullOrEmpty(preguntaDb.respuesta))
            return BadRequest(new { success = false, message = "Esta pregunta ya fue respondida." });

        preguntaDb.respuesta = dto.respuesta;
        preguntaDb.fecharespuesta = DateTime.Today;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Respuesta guardada.", data = (object?)null, errors = (object?)null });
    }
}