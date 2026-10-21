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
public class CotizacionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CotizacionesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/cotizaciones
    [HttpGet]
    public async Task<IActionResult> GetMisCotizaciones()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var cotizaciones = await _context.cotizacions
            .Where(c => c.solicitar1s.Any(s => s.id_usuario == rut)
                     || c.solicitar2s.Any(s => s.id_usuario == rut || s.id_oferente == rut))
            .Select(c => new
            {
                id = c.id,
                fechacreacion = c.fechacreacion,
                estado = c.estado,
                fechaultimaactualizacion = c.fechaultimaactualizacion,
                productos = c.solicitar1s.Select(s => new { id = s.id_producto, precio = s.precio, cantidad = s.cantidad }).ToList(),
                servicios = c.solicitar2s.Select(s => new { id = s.id_servicio, oferente = s.id_oferente, precio = s.precio, cantidad = s.cantidad }).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Cotizaciones obtenidas.", data = cotizaciones, errors = (object?)null });
    }

    // POST: api/cotizaciones
    [HttpPost]
    public async Task<IActionResult> CrearCotizacion([FromBody] CotizacionCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        if (dto.items == null || !dto.items.Any())
            return BadRequest(new { success = false, message = "La cotización debe tener al menos un ítem." });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var nuevaCotizacion = new cotizacion
            {
                fechacreacion = DateOnly.FromDateTime(DateTime.Now),
                estado = "En Proceso"
            };
            _context.cotizacions.Add(nuevaCotizacion);
            await _context.SaveChangesAsync();

            foreach (var item in dto.items)
            {
                if (item.tipo.ToLower() == "producto")
                {
                    var solicitar1 = new solicitar1
                    {
                        id_usuario = rut,
                        id_producto = item.id_item,
                        id_cotizacion = nuevaCotizacion.id,
                        precio = item.precio,
                        cantidad = item.cantidad
                    };
                    _context.solicitar1s.Add(solicitar1);
                }
                else if (item.tipo.ToLower() == "servicio")
                {
                    var solicitar2 = new solicitar2
                    {
                        id_usuario = rut,
                        id_servicio = item.id_item,
                        id_cotizacion = nuevaCotizacion.id,
                        id_oferente = rut, // el cliente propone, después un vendedor puede responder
                        precio = item.precio,
                        cantidad = item.cantidad
                    };
                    _context.solicitar2s.Add(solicitar2);
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Cotización creada.", data = new { id = nuevaCotizacion.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error al crear la cotización.", errors = new[] { ex.Message } });
        }
    }

    // PUT: api/cotizaciones/{id}/estado
    [HttpPut("{id}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] CotizacionEstadoDto dto)
    {
        var cotizacionDb = await _context.cotizacions.FindAsync(id);
        if (cotizacionDb == null)
            return NotFound(new { success = false, message = "Cotización no encontrada." });

        cotizacionDb.estado = dto.estado;
        cotizacionDb.fechaultimaactualizacion = DateOnly.FromDateTime(DateTime.Now);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Estado actualizado.", data = (object?)null, errors = (object?)null });
    }
}