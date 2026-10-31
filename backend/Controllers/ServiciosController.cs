
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiciosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServiciosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/servicios (Público)
    [HttpGet]
    public async Task<IActionResult> GetServicios()
    {
        var serviciosDb = await _context.servicios
            .Include(s => s.id_categoria)
            .Include(s => s.ofrecer2s)
            .ToListAsync();

        var servicios = serviciosDb.Select(s =>
        {
            var oferta = s.ofrecer2s.FirstOrDefault();

            JsonElement caracteristicasJson;

            try
            {
                caracteristicasJson = JsonDocument
                    .Parse(s.caracteristicas ?? "{}")
                    .RootElement
                    .Clone();
            }
            catch
            {
                caracteristicasJson = JsonDocument
                    .Parse("{}")
                    .RootElement
                    .Clone();
            }

            return new ServicioDto
            {
                id = s.id,
                nombre = s.nombre,
                restriccionedad = s.restriccionedad,
                duracion = s.duracion,
                caracteristicas = caracteristicasJson,
                imagen = s.rutaimagen,
                rut_vendedor = oferta != null ? oferta.id_usuario : null,
                categorias = s.id_categoria.Select(c => c.id).ToList()
            };
        }).ToList();

        return Ok(new
        {
            success = true,
            message = "Servicios obtenidos.",
            data = servicios,
            errors = (object?)null
        });
    }

    // GET: api/servicios/{id} (Público - Detalle)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetServicio(int id)
    {
        var servicio = await _context.servicios
            .Include(s => s.id_categoria)
            .Include(s => s.ofrecer2s)
                .ThenInclude(o => o.id_usuarioNavigation)
            .FirstOrDefaultAsync(s => s.id == id);

        if (servicio == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Servicio no encontrado.",
                data = (object?)null,
                errors = (object?)null
            });
        }

        var vendedor = servicio.ofrecer2s.FirstOrDefault();

        JsonElement caracteristicasJson;

        try
        {
            caracteristicasJson = JsonDocument
                .Parse(servicio.caracteristicas ?? "{}")
                .RootElement
                .Clone();
        }
        catch
        {
            caracteristicasJson = JsonDocument
                .Parse("{}")
                .RootElement
                .Clone();
        }

        var resultado = new
        {
            id = servicio.id,
            nombre = servicio.nombre,
            restriccionedad = servicio.restriccionedad,
            duracion = servicio.duracion,
            caracteristicas = caracteristicasJson,
            imagen = servicio.rutaimagen,
            categorias = servicio.id_categoria.Select(c => new
            {
                c.id,
                c.nombre
            }),
            vendedor = vendedor != null
                ? new
                {
                    rut = vendedor.id_usuario,
                    nombre = vendedor.id_usuarioNavigation.nombre
                }
                : null
        };

        return Ok(new
        {
            success = true,
            message = "Servicio obtenido.",
            data = resultado,
            errors = (object?)null
        });
    }

    // GET: api/servicios/mis-servicios
    [HttpGet("mis-servicios")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> GetMisServicios()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var servicios = await _context.ofrecer2s
            .Where(o => o.id_usuario == rut)
            .Select(o => new
            {
                id = o.id_servicio,
                nombre = o.id_servicioNavigation.nombre,
                restriccionedad = o.id_servicioNavigation.restriccionedad,
                duracion = o.id_servicioNavigation.duracion,
                caracteristicas = o.id_servicioNavigation.caracteristicas,
                imagen = o.id_servicioNavigation.rutaimagen,
                categorias = o.id_servicioNavigation.id_categoria.Select(c => c.id).ToList(),

                precio = o.id_servicioNavigation.valorars
                    .Where(v => v.id_usuario == rut)
                    .Select(v => (int?)v.precio)
                    .FirstOrDefault(),

                id_oferta = o.id_servicioNavigation.id_oferta,
                preciooferta = o.id_servicioNavigation.id_ofertaNavigation != null
                    ? (decimal?)o.id_servicioNavigation.id_ofertaNavigation.preciooferta
                    : null,
                ofertaactiva = o.id_servicioNavigation.id_ofertaNavigation != null
                    ? o.id_servicioNavigation.id_ofertaNavigation.estado
                    : null,
                fechainicio = o.id_servicioNavigation.fechainicio,
                fechafin = o.id_servicioNavigation.fechafin
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Mis servicios obtenidos.", data = servicios, errors = (object?)null });
    }

    private static string CaracteristicasComoTexto(JsonElement caracteristicas) =>
        caracteristicas.ValueKind == JsonValueKind.Undefined ? "{}" : caracteristicas.GetRawText();


    // POST: api/servicios (Requiere autenticación)
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateServicio(
        [FromBody] ServicioCreateDto dto)
    {
        var rutVendedor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rutVendedor))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        if (dto.duracion == TimeOnly.MinValue)
            return BadRequest(new { success = false, message = "La duración debe ser mayor a 0.", errors = new[] { "duracion: inválida." } });

        var categoriaExiste = await _context.categoria.FindAsync(dto.id_categoria);
        if (categoriaExiste == null)
            return BadRequest(new { success = false, message = "La categoría no existe.", errors = new[] { "id_categoria: inválido." } });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var nuevoServicio = new servicio
            {
                nombre = dto.nombre,
                restriccionedad = dto.restriccionedad,
                duracion = dto.duracion,
                caracteristicas = dto.caracteristicas.GetRawText(),
                rutaimagen = dto.imagen
            };

            nuevoServicio.id_categoria.Add(categoriaExiste);

            _context.servicios.Add(nuevoServicio);
            await _context.SaveChangesAsync();

            _context.ofrecer2s.Add(new ofrecer2
            {
                id_usuario = rutVendedor,
                id_servicio = nuevoServicio.id,
                tipobien = "Servicio"
            });

            // El trigger de ventas lee el precio de Valorar
            _context.valorars.Add(new valorar
            {
                id_servicio = nuevoServicio.id,
                id_usuario = rutVendedor,
                precio = dto.precio
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return StatusCode(201, new { success = true, message = "Servicio creado exitosamente.", data = new { id = nuevoServicio.id }, errors = (object?)null });

        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Error interno al crear el servicio.", errors = new[] { ex.Message } });
            }
        }
    }
    // PUT: api/servicios/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> UpdateServicio(int id, [FromBody] ServicioCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var servicio = await _context.servicios
            .Include(s => s.ofrecer2s)
            .FirstOrDefaultAsync(s => s.id == id);

        if (servicio == null)
            return NotFound(new { success = false, message = "Servicio no encontrado." });
        if (!servicio.ofrecer2s.Any(o => o.id_usuario == rut))
            return Forbid();

        if (dto.duracion == TimeOnly.MinValue)
            return BadRequest(new { success = false, message = "La duración debe ser mayor a 0.", errors = new[] { "duracion: inválida." } });

        if (!await _context.categoria.AnyAsync(c => c.id == dto.id_categoria))
            return BadRequest(new { success = false, message = "La categoría no existe.", errors = new[] { "id_categoria: inválido." } });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            servicio.nombre = dto.nombre;
            servicio.restriccionedad = dto.restriccionedad;
            servicio.duracion = dto.duracion;
            servicio.caracteristicas = CaracteristicasComoTexto(dto.caracteristicas);
            servicio.rutaimagen = dto.imagen;

            var valoracion = await _context.valorars
                .FirstOrDefaultAsync(v => v.id_servicio == id && v.id_usuario == rut);
            if (valoracion == null)
                _context.valorars.Add(new valorar { id_servicio = id, id_usuario = rut, precio = dto.precio });
            else
                valoracion.precio = dto.precio;

            await _context.SaveChangesAsync();

            // pertenecer2 no tiene DbSet
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM pertenecer2 WHERE id_servicio = {0}", id);
            await _context.Database.ExecuteSqlRawAsync("INSERT INTO pertenecer2 (id_servicio, id_categoria) VALUES ({0}, {1})", id, dto.id_categoria);

            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Servicio actualizado.", data = (object?)null, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error interno al actualizar el servicio.", errors = new[] { ex.Message } });
        }
    }

    // DELETE: api/servicios/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> DeleteServicio(int id)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var servicio = await _context.servicios
            .Include(s => s.ofrecer2s)
            .FirstOrDefaultAsync(s => s.id == id);

        if (servicio == null)
            return NotFound(new { success = false, message = "Servicio no encontrado." });
        if (!servicio.ofrecer2s.Any(o => o.id_usuario == rut))
            return Forbid();

        try
        {
            _context.servicios.Remove(servicio);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { success = false, message = "No se puede eliminar: el servicio ya tiene ventas o cotizaciones asociadas." });
        }

        return Ok(new { success = true, message = "Servicio eliminado.", data = (object?)null, errors = (object?)null });
    }
}
 