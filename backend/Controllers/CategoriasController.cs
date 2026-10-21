using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaOnline.API.DTOs;  
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriasController(AppDbContext context)
    {
        _context = context;
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
    [Authorize]
    public async Task<IActionResult> CrearCategoria([FromBody] CategoriaCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.nombre))
            return BadRequest(new { success = false, message = "El nombre no puede estar vacío." });

        // Si se envía id_categoria_padre, validar que exista
        if (dto.id_categoria_padre.HasValue)
        {
            var padreExiste = await _context.categoria.AnyAsync(c => c.id == dto.id_categoria_padre.Value);
            if (!padreExiste)
                return BadRequest(new { success = false, message = "La categoría padre no existe." });
        }

        var nuevaCategoria = new categorium
        {
            nombre = dto.nombre,
            id_categoria = dto.id_categoria_padre
        };

        _context.categoria.Add(nuevaCategoria);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Categoría creada.", data = new { id = nuevaCategoria.id }, errors = (object?)null });
    }

    // PUT: api/categorias/{id} (Requiere Auth - Editar)
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> ActualizarCategoria(int id, [FromBody] CategoriaCreateDto dto)
    {
        var categoria = await _context.categoria.FindAsync(id);
        if (categoria == null)
            return NotFound(new { success = false, message = "Categoría no encontrada." });

        categoria.nombre = dto.nombre;
        categoria.id_categoria = dto.id_categoria_padre;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Categoría actualizada.", data = (object?)null, errors = (object?)null });
    }

    // DELETE: api/categorias/{id} (Requiere Auth - Eliminar)
    [HttpDelete("{id}")]
    [Authorize]
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