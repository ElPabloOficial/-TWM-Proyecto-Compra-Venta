using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;  
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _context;

    private const int MaxNombre = 50; // largo de Categoria.Nombre en la BD

    public CategoriasController(AppDbContext context)
    {
        _context = context;
    }

    // Valida el nombre y devuelve el nombre sin espacios sobrantes (o un error)
    private static string? ValidarNombre(string? nombre, out string limpio)
    {
        limpio = nombre?.Trim() ?? "";
        if (limpio == "") return "El nombre no puede estar vacío.";
        if (limpio.Length > MaxNombre) return $"El nombre no puede tener más de {MaxNombre} caracteres.";
        return null;
    }

    // GET: api/categorias (Público - Listar todas las categorías)
    [HttpGet]
    public async Task<IActionResult> GetCategorias()
    {
        var categorias = await _context.categoria
            .Select(c => new
            {
                id = c.id,
                nombre = c.nombre,
                id_categoria_padre = c.id_categoria, // null si es categoría raíz
                cantidad_productos = c.id_productos.Count(),
                cantidad_servicios = c.id_servicios.Count()
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Categorías obtenidas.", data = categorias, errors = (object?)null });
    }

    // GET: api/categorias/{id} (Público - Detalle de una categoría con subcategorías)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategoria(int id)
    {
        var categoria = await _context.categoria
            .Include(c => c.Inverseid_categoriaNavigation) // Subcategorías
            .FirstOrDefaultAsync(c => c.id == id);

        if (categoria == null)
            return NotFound(new { success = false, message = "Categoría no encontrada.", data = (object?)null, errors = (object?)null });

        var resultado = new
        {
            id = categoria.id,
            nombre = categoria.nombre,
            id_categoria_padre = categoria.id_categoria,
            subcategorias = categoria.Inverseid_categoriaNavigation.Select(s => new
            {
                id = s.id,
                nombre = s.nombre
            }).ToList()
        };

        return Ok(new { success = true, message = "Categoría obtenida.", data = resultado, errors = (object?)null });
    }

    // POST: api/categorias (Requiere Auth - Para el panel de administrador)
    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CrearCategoria([FromBody] CategoriaCreateDto dto)
    {
        var errorNombre = ValidarNombre(dto.nombre, out var nombreNuevo);
        if (errorNombre != null)
            return BadRequest(new { success = false, message = errorNombre });

        // Si se envía id_categoria_padre, validar que exista
        if (dto.id_categoria_padre.HasValue)
        {
            var padreExiste = await _context.categoria.AnyAsync(c => c.id == dto.id_categoria_padre.Value);
            if (!padreExiste)
                return BadRequest(new { success = false, message = "La categoría padre no existe." });
        }

        // No se repite el nombre dentro de la misma categoría padre
        var nombreRepetido = await _context.categoria.AnyAsync(c =>
            c.id_categoria == dto.id_categoria_padre && c.nombre.ToLower() == nombreNuevo.ToLower());
        if (nombreRepetido)
            return Conflict(new { success = false, message = "Ya existe una categoría con ese nombre en este nivel." });

        var nuevaCategoria = new categorium
        {
            nombre = nombreNuevo,
            id_categoria = dto.id_categoria_padre
        };

        _context.categoria.Add(nuevaCategoria);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Categoría creada.", data = new { id = nuevaCategoria.id }, errors = (object?)null });
    }

    // PUT: api/categorias/{id} (Requiere Auth - Editar)
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ActualizarCategoria(int id, [FromBody] CategoriaCreateDto dto)
    {
        var categoria = await _context.categoria.FindAsync(id);
        if (categoria == null)
            return NotFound(new { success = false, message = "Categoría no encontrada." });

        var errorNombre = ValidarNombre(dto.nombre, out var nombreNuevo);
        if (errorNombre != null)
            return BadRequest(new { success = false, message = errorNombre });

        if (dto.id_categoria_padre.HasValue)
        {
            var padreExiste = await _context.categoria.AnyAsync(c => c.id == dto.id_categoria_padre.Value);
            if (!padreExiste)
                return BadRequest(new { success = false, message = "La categoría padre no existe." });

            // Una categoría no puede quedar dentro de sí misma ni de sus propias subcategorías
            int? ancestro = dto.id_categoria_padre;
            while (ancestro.HasValue)
            {
                if (ancestro.Value == id)
                    return BadRequest(new { success = false, message = "Una categoría no puede quedar dentro de sí misma ni de sus subcategorías." });

                var actualId = ancestro.Value;
                ancestro = await _context.categoria
                    .AsNoTracking()
                    .Where(c => c.id == actualId)
                    .Select(c => c.id_categoria)
                    .FirstOrDefaultAsync();
            }
        }

        var nombreRepetido = await _context.categoria.AnyAsync(c =>
            c.id != id && c.id_categoria == dto.id_categoria_padre && c.nombre.ToLower() == nombreNuevo.ToLower());
        if (nombreRepetido)
            return Conflict(new { success = false, message = "Ya existe una categoría con ese nombre en este nivel." });

        categoria.nombre = nombreNuevo;
        categoria.id_categoria = dto.id_categoria_padre;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Categoría actualizada.", data = (object?)null, errors = (object?)null });
    }

    // DELETE: api/categorias/{id} (Requiere Auth - Eliminar)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> EliminarCategoria(int id)
    {
        var categoria = await _context.categoria.FindAsync(id);
        if (categoria == null)
            return NotFound(new { success = false, message = "Categoría no encontrada." });

        // Validar que no tenga subcategorías ni productos/servicios asociados
        var tieneSubcategorias = await _context.categoria.AnyAsync(c => c.id_categoria == id);
        if (tieneSubcategorias)
            return BadRequest(new { success = false, message = "No se puede eliminar: tiene subcategorías asociadas." });

        var tieneProductos = await _context.productos.AnyAsync(p => p.id_categoria.Any(c => c.id == id));
        var tieneServicios = await _context.servicios.AnyAsync(s => s.id_categoria.Any(c => c.id == id));
        
        if (tieneProductos || tieneServicios)
            return BadRequest(new { success = false, message = "No se puede eliminar: tiene productos o servicios asociados." });

        _context.categoria.Remove(categoria);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Categoría eliminada.", data = (object?)null, errors = (object?)null });
    }
}