using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Todas las rutas requieren autenticación
public class DireccionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DireccionesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/direcciones (Listar mis direcciones)
    [HttpGet]
    public async Task<IActionResult> GetMisDirecciones()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        // Buscamos las direcciones vinculadas al usuario a través de la navegación id_direccions
        var usuario = await _context.usuarios
            .Include(u => u.id_direccions)
                .ThenInclude(d => d.id_comunaNavigation) // Para obtener el nombre de la comuna
            .FirstOrDefaultAsync(u => u.rut == rut);

        if (usuario == null)
            return NotFound(new { success = false, message = "Usuario no encontrado." });

        var direcciones = usuario.id_direccions.Select(d => new DireccionDto
        {
            id = d.id,
            numero = d.numero,
            calle = d.calle,
            descripcion = d.descripcion,
            pasaje = d.pasaje,
            sector = d.sector,
            id_comuna = d.id_comuna,
            nombre_comuna = d.id_comunaNavigation?.nombre
        }).ToList();

        return Ok(new { success = true, message = "Direcciones obtenidas.", data = direcciones, errors = (object?)null });
    }

    // POST: api/direcciones (Crear y vincular dirección)
    [HttpPost]
    public async Task<IActionResult> CrearDireccion([FromBody] DireccionCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        // Validar que la comuna exista
        var comunaExiste = await _context.comunas.FindAsync(dto.id_comuna);
        if (comunaExiste == null)
            return BadRequest(new { success = false, message = "La comuna no existe.", errors = new[] { "id_comuna: inválido." } });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Crear la dirección
            var nuevaDireccion = new direccion
            {
                numero = dto.numero,
                calle = dto.calle,
                descripcion = dto.descripcion,
                pasaje = dto.pasaje,
                sector = dto.sector,
                id_comuna = dto.id_comuna
            };

            _context.direccions.Add(nuevaDireccion);
            await _context.SaveChangesAsync(); // Guardamos para obtener el ID (si es IDENTITY) o para insertar.

            // 2. Vincular al usuario (insertar en registrar2)
            var usuario = await _context.usuarios.FindAsync(rut);
            if (usuario == null)
                return NotFound(new { success = false, message = "Usuario no encontrado." });

            usuario.id_direccions.Add(nuevaDireccion);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Dirección creada y vinculada.", data = new { id = nuevaDireccion.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error interno al crear la dirección.", errors = new[] { ex.Message } });
        }
    }
}