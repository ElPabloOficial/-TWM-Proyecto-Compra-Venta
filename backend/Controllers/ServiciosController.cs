
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
                imagen = s.imagen,
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
            imagen = servicio.imagen,
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

    // POST: api/servicios (Requiere autenticación)
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateServicio(
        [FromBody] ServicioCreateDto dto)
    {
        var rutVendedor = User.FindFirst(
            ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(rutVendedor))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Usuario no autenticado."
            });
        }

        var categoriaExiste = await _context.categoria
            .FindAsync(dto.id_categoria);

        if (categoriaExiste == null)
        {
            return BadRequest(new
            {
                success = false,
                message = "La categoría no existe.",
                errors = new[] { "id_categoria: inválido." }
            });
        }

        using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var nuevoServicio = new servicio
            {
                nombre = dto.nombre,
                restriccionedad = dto.restriccionedad,
                duracion = dto.duracion,
                caracteristicas = dto.caracteristicas.GetRawText(),
                imagen = dto.imagen
            };

            nuevoServicio.id_categoria.Add(categoriaExiste);

            _context.servicios.Add(nuevoServicio);
            await _context.SaveChangesAsync();

            var ofrecer = new ofrecer2
            {
                id_usuario = rutVendedor,
                id_servicio = nuevoServicio.id,
                tipobien = "Servicio"
            };

            _context.ofrecer2s.Add(ofrecer);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                success = true,
                message = "Servicio creado exitosamente.",
                data = new { id = nuevoServicio.id },
                errors = (object?)null
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            return StatusCode(500, new
            {
                success = false,
                message = "Error interno al crear el servicio.",
                errors = new[] { ex.Message }
            });
        }
    }
}
