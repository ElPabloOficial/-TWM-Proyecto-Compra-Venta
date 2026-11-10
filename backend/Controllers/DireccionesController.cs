using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.api.DTOs;
using backend.api.Models;

namespace backend.api.Controllers;

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
                    .ThenInclude(c => c.id_provinciaNavigation)
                        .ThenInclude(p => p.id_regionNavigation) // ...y el de la región
            .FirstOrDefaultAsync(u => u.rut == rut);

        if (usuario == null)
            return NotFound(new { success = false, message = "Usuario no encontrado." });

        // Ordenadas por id: la primera que guardó el usuario es su dirección principal (la misma que edita el perfil)
        var direcciones = usuario.id_direccions.OrderBy(d => d.id).Select(d => new DireccionDto
        {
            id = d.id,
            numero = d.numero,
            calle = d.calle,
            descripcion = d.descripcion,
            pasaje = d.pasaje,
            sector = d.sector,
            id_comuna = d.id_comuna,
            nombre_comuna = d.id_comunaNavigation?.nombre,
            nombre_region = d.id_comunaNavigation?.id_provinciaNavigation?.id_regionNavigation?.nombre
        }).ToList();

        return Ok(new { success = true, message = "Direcciones obtenidas.", data = direcciones, errors = (object?)null });
    }

    // Los textos de la dirección admiten máximo 100 caracteres (largo de las columnas en la base de datos)
    private static List<string> ValidarDireccion(DireccionCreateDto dto)
    {
        var errores = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.calle)) errores.Add("calle: es obligatoria.");
        else if (dto.calle.Trim().Length > 100) errores.Add("calle: máximo 100 caracteres.");

        if (dto.numero <= 0) errores.Add("numero: debe ser mayor a 0.");

        if ((dto.pasaje?.Trim().Length ?? 0) > 100 || (dto.descripcion?.Trim().Length ?? 0) > 100 || (dto.sector?.Trim().Length ?? 0) > 100)
            errores.Add("pasaje, descripcion y sector: máximo 100 caracteres.");

        return errores;
    }

    private static string? Vacio(string? texto) => string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();

    // POST: api/direcciones (Crear y vincular dirección)
    [HttpPost]
    public async Task<IActionResult> CrearDireccion([FromBody] DireccionCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var errores = ValidarDireccion(dto);
        if (errores.Count > 0)
            return BadRequest(new { success = false, message = "Revisa los datos de la dirección.", errors = errores.ToArray() });

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
                calle = dto.calle.Trim(),
                descripcion = Vacio(dto.descripcion),
                pasaje = Vacio(dto.pasaje),
                sector = Vacio(dto.sector),
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

    // PUT: api/direcciones/{id} (Actualizar una de mis direcciones)
    // El cliente puede crear y actualizar sus direcciones, pero no eliminarlas.
    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarDireccion(int id, [FromBody] DireccionCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var errores = ValidarDireccion(dto);
        if (errores.Count > 0)
            return BadRequest(new { success = false, message = "Revisa los datos de la dirección.", errors = errores.ToArray() });

        // Solo se puede editar una dirección vinculada al propio usuario
        var usuario = await _context.usuarios
            .Include(u => u.id_direccions)
            .FirstOrDefaultAsync(u => u.rut == rut);

        var existente = usuario?.id_direccions.FirstOrDefault(d => d.id == id);
        if (existente == null)
            return NotFound(new { success = false, message = "Dirección no encontrada." });

        var comunaExiste = await _context.comunas.FindAsync(dto.id_comuna);
        if (comunaExiste == null)
            return BadRequest(new { success = false, message = "La comuna no existe.", errors = new[] { "id_comuna: inválido." } });

        existente.calle = dto.calle.Trim();
        existente.numero = dto.numero;
        existente.pasaje = Vacio(dto.pasaje);
        existente.descripcion = Vacio(dto.descripcion);
        existente.sector = Vacio(dto.sector);
        existente.id_comuna = dto.id_comuna;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Dirección actualizada.", data = new { id = existente.id }, errors = (object?)null });
    }
}