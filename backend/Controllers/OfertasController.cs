using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OfertasController : ControllerBase
{
    private readonly AppDbContext _context;

    public OfertasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/ofertas (Público)
    [HttpGet]
    public async Task<IActionResult> GetOfertas()
    {
        var ofertas = await _context.oferta
            .Where(o => o.estado == true)
            .Select(o => new
            {
                id = o.id,
                preciooferta = o.preciooferta,
                productos = o.productos.Select(p => p.id).ToList(),
                servicios = o.servicios.Select(s => s.id).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Ofertas obtenidas.", data = ofertas, errors = (object?)null });
    }

    // POST: api/ofertas (Requiere Auth)
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CrearOferta([FromBody] OfertaCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });
    
        if (dto.preciooferta < 0 || dto.preciooferta >= 1)
            return BadRequest(new { success = false, message = "El precio de oferta debe estar entre 0 y 1 (ej: 0.15 = 15% off)." });
    
        // Asignar fechas por defecto si no vienen
        var fechaInicio = dto.fechainicio ?? DateOnly.FromDateTime(DateTime.Now);
        var fechaFin = dto.fechafin ?? DateOnly.FromDateTime(DateTime.Now.AddDays(30));
    
        if (fechaFin <= fechaInicio)
            return BadRequest(new { success = false, message = "La fecha de fin debe ser posterior a la de inicio." });
    
        var nuevaOferta = new ofertum
        {
            preciooferta = dto.preciooferta,
            estado = dto.estado
        };
        _context.oferta.Add(nuevaOferta);
        await _context.SaveChangesAsync();
    
        if (dto.id_producto.HasValue)
        {
            var producto = await _context.productos
                .Include(p => p.ofrecer1s)
                .FirstOrDefaultAsync(p => p.id == dto.id_producto.Value);
    
            if (producto == null || !producto.ofrecer1s.Any(o => o.id_usuario == rut))
                return Forbid();
    
            producto.id_oferta = nuevaOferta.id;
            producto.fechainicio = fechaInicio;
            producto.fechafin = fechaFin;
        }
        else if (dto.id_servicio.HasValue)
        {
            var servicio = await _context.servicios
                .Include(s => s.ofrecer2s)
                .FirstOrDefaultAsync(s => s.id == dto.id_servicio.Value);
    
            if (servicio == null || !servicio.ofrecer2s.Any(o => o.id_usuario == rut))
                return Forbid();
    
            servicio.id_oferta = nuevaOferta.id;
            servicio.fechainicio = fechaInicio;
            servicio.fechafin = fechaFin;
        }
        else
        {
            return BadRequest(new { success = false, message = "Debe indicar id_producto o id_servicio." });
        }
    
        await _context.SaveChangesAsync();
    
        return Ok(new { success = true, message = "Oferta creada.", data = new { id = nuevaOferta.id }, errors = (object?)null });
    }

    // DELETE: api/ofertas/{id} (Desactivar oferta)
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DesactivarOferta(int id)
    {
        var ofertaDb = await _context.oferta.FindAsync(id);
        if (ofertaDb == null)
            return NotFound(new { success = false, message = "Oferta no encontrada." });

        ofertaDb.estado = false;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Oferta desactivada.", data = (object?)null, errors = (object?)null });
    }
}