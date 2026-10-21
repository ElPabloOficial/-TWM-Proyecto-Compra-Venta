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
public class MensajesController : ControllerBase
{
    private readonly AppDbContext _context;

    public MensajesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/mensajes/venta/1 (Ver mensajes de una venta)
    [HttpGet("venta/{idVenta}")]
    public async Task<IActionResult> GetMensajesVenta(int idVenta)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        // Validar que el usuario participe en la venta
        var venta = await _context.venta.FindAsync(idVenta);
        if (venta == null)
            return NotFound(new { success = false, message = "Venta no encontrada." });

        if (venta.id_cliente != rut && venta.id_vendedor != rut)
            return Forbid(); // No tiene permiso para ver esta conversación

        var mensajes = await _context.enviars
            .Where(e => e.id_venta == idVenta)
            .Include(e => e.id_mensajeNavigation)
            .Include(e => e.id_usuarioNavigation)
            .OrderBy(e => e.id_mensajeNavigation.fechaenvio)
            .Select(e => new
            {
                id = e.id_mensaje,
                contenido = e.id_mensajeNavigation.contenido,
                fecha_envio = e.id_mensajeNavigation.fechaenvio,
                estado = e.id_mensajeNavigation.estado,
                fecha_respuesta = e.id_mensajeNavigation.fecharespuesta,
                usuario = new
                {
                    rut = e.id_usuario,
                    nombre = e.id_usuarioNavigation.nombre
                }
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Mensajes obtenidos.", data = mensajes, errors = (object?)null });
    }

    // POST: api/mensajes (Enviar mensaje)
    [HttpPost]
    public async Task<IActionResult> EnviarMensaje([FromBody] MensajeCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        if (string.IsNullOrWhiteSpace(dto.contenido))
            return BadRequest(new { success = false, message = "El contenido no puede estar vacío." });

        // Validar que el usuario participe en la venta
        var venta = await _context.venta.FindAsync(dto.id_venta);
        if (venta == null)
            return NotFound(new { success = false, message = "Venta no encontrada." });

        if (venta.id_cliente != rut && venta.id_vendedor != rut)
            return Forbid();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Crear el mensaje
            var nuevoMensaje = new mensaje
            {
                contenido = dto.contenido,
                fechaenvio = DateOnly.FromDateTime(DateTime.Now),
                estado = "Enviado"
            };
            _context.mensajes.Add(nuevoMensaje);
            await _context.SaveChangesAsync();

            // 2. Vincular a la venta y al usuario
            var enviar = new enviar
            {
                id_venta = dto.id_venta,
                id_mensaje = nuevoMensaje.id,
                id_usuario = rut
            };
            _context.enviars.Add(enviar);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Mensaje enviado.", data = new { id = nuevoMensaje.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error al enviar el mensaje.", errors = new[] { ex.Message } });
        }
    }

    // PUT: api/mensajes/{id}/responder (Marcar como respondido)
    [HttpPut("{id}/responder")]
    public async Task<IActionResult> MarcarRespondido(int id)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var mensajeDb = await _context.mensajes.FindAsync(id);
        if (mensajeDb == null)
            return NotFound(new { success = false, message = "Mensaje no encontrado." });

        // Validar que el usuario sea parte de la conversación
        var enviar = await _context.enviars.FirstOrDefaultAsync(e => e.id_mensaje == id);
        if (enviar == null)
            return NotFound(new { success = false, message = "Relación de mensaje no encontrada." });

        var venta = await _context.venta.FindAsync(enviar.id_venta);
        if (venta == null || (venta.id_cliente != rut && venta.id_vendedor != rut))
            return Forbid();

        if (mensajeDb.fecharespuesta != null)
            return BadRequest(new { success = false, message = "El mensaje ya fue marcado como respondido." });

        mensajeDb.fecharespuesta = DateTime.Now;
        mensajeDb.estado = "Respondido";

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Mensaje marcado como respondido.", data = (object?)null, errors = (object?)null });
    }
}