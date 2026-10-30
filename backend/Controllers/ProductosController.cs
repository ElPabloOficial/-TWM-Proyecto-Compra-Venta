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
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/productos (Público)
    [HttpGet]
    public async Task<IActionResult> GetProductos()
    {
        var productosDb = await _context.productos
            .Include(p => p.id_categoria)
            .Include(p => p.ofrecer1s)
            .ToListAsync();

        var productos = productosDb.Select(p => {
            var oferta = p.ofrecer1s.FirstOrDefault();
            
            // Manejo seguro del JSON
            JsonElement caracteristicasJson;
            try { caracteristicasJson = JsonDocument.Parse(p.caracteristicas ?? "{}").RootElement; }
            catch { caracteristicasJson = JsonDocument.Parse("{}").RootElement; }

            return new ProductoDto
            {
                id = p.id,
                nombre = p.nombre,
                restriccionedad = p.restriccionedad,
                caracteristicas = caracteristicasJson,
                imagen = p.imagen,
                rut_vendedor = oferta != null ? oferta.id_usuario : null,
                categorias = p.id_categoria.Select(c => c.id).ToList()
            };
        }).ToList();

        return Ok(new { success = true, message = "Productos obtenidos.", data = productos, errors = (object?)null });
    }

    // GET: api/productos/{id} (Público - Detalle)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProducto(int id)
    {
        var producto = await _context.productos
            .Include(p => p.id_categoria)
            .Include(p => p.ofrecer1s)
                .ThenInclude(o => o.id_usuarioNavigation)
            .Include(p => p.id_ofertaNavigation)
            .FirstOrDefaultAsync(p => p.id == id);

        if (producto == null)
            return NotFound(new { success = false, message = "Producto no encontrado.", data = (object?)null, errors = (object?)null });

        var vendedor = producto.ofrecer1s.FirstOrDefault();
        
        JsonElement caracteristicasJson;
        try { caracteristicasJson = JsonDocument.Parse(producto.caracteristicas ?? "{}").RootElement; }
        catch { caracteristicasJson = JsonDocument.Parse("{}").RootElement; }

        var resultado = new
        {
            id = producto.id,
            nombre = producto.nombre,
            restriccionedad = producto.restriccionedad,
            caracteristicas = caracteristicasJson,
            imagen = producto.imagen,
            precio_oferta = producto.id_ofertaNavigation != null ? producto.id_ofertaNavigation.preciooferta : (decimal?)null,
            categorias = producto.id_categoria.Select(c => new { c.id, c.nombre }),
            vendedor = vendedor != null ? new { rut = vendedor.id_usuario, nombre = vendedor.id_usuarioNavigation.nombre } : null
        };

        return Ok(new { success = true, message = "Producto obtenido.", data = resultado, errors = (object?)null });
    }

    // GET: api/productos/mis-productos (Requiere Auth - Panel Vendedor)
    // Devuelve también el stock y la oferta (con sus fechas) para la gestión de inventario.
    [HttpGet("mis-productos")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> GetMisProductos()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var productos = await _context.ofrecer1s
            .Where(o => o.id_usuario == rut)
            .Select(o => new
            {
                id = o.id_producto,
                nombre = o.id_productoNavigation.nombre,
                restriccionedad = o.id_productoNavigation.restriccionedad,
                caracteristicas = o.id_productoNavigation.caracteristicas,
                imagen = o.id_productoNavigation.imagen,
                categorias = o.id_productoNavigation.id_categoria.Select(c => c.id).ToList(),

                stockactual = o.id_productoNavigation.almacenars
                    .Where(a => a.id_inventarioNavigation.id_usuario == rut)
                    .Sum(a => a.stockactual),

                id_oferta = o.id_productoNavigation.id_oferta,
                preciooferta = o.id_productoNavigation.id_ofertaNavigation != null
                    ? (decimal?)o.id_productoNavigation.id_ofertaNavigation.preciooferta
                    : null,
                ofertaactiva = o.id_productoNavigation.id_ofertaNavigation != null
                    ? o.id_productoNavigation.id_ofertaNavigation.estado
                    : null,
                fechainicio = o.id_productoNavigation.fechainicio,
                fechafin = o.id_productoNavigation.fechafin
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Mis productos obtenidos.", data = productos, errors = (object?)null });
    }

    // POST: api/productos (Requiere Autenticación Básica)
    [HttpPost]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> CreateProducto([FromBody] ProductoCreateDto dto)
    {
        var rutVendedor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rutVendedor))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var categoriaExiste = await _context.categoria.FindAsync(dto.id_categoria);
        if (categoriaExiste == null)
            return BadRequest(new { success = false, message = "La categoría no existe.", errors = new[] { "id_categoria: inválido." } });

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var nuevoProducto = new producto
            {
                nombre = dto.nombre,
                restriccionedad = dto.restriccionedad,
                caracteristicas = dto.caracteristicas.GetRawText(),
                imagen = dto.imagen
            };

            // EF Core insertará automáticamente en 'pertenecer1'
            nuevoProducto.id_categoria.Add(categoriaExiste);

            _context.productos.Add(nuevoProducto);
            await _context.SaveChangesAsync(); 

            var ofrecer = new ofrecer1
            {
                id_usuario = rutVendedor,
                id_producto = nuevoProducto.id,
                tipobien = "Producto"
            };
            _context.ofrecer1s.Add(ofrecer);

            await _context.SaveChangesAsync(); 
            await transaction.CommitAsync(); 

            return StatusCode(201, new { success = true, message = "Producto creado exitosamente.", data = new { id = nuevoProducto.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { success = false, message = "Error interno al crear el producto.", errors = new[] { ex.Message } });
        }
    }

    // PUT: api/productos/{id} (Requiere Auth - Solo el dueño)
    [HttpPut("{id}")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> UpdateProducto(int id, [FromBody] ProductoCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var producto = await _context.productos
            .Include(p => p.ofrecer1s)
            .FirstOrDefaultAsync(p => p.id == id);

        if (producto == null) return NotFound(new { success = false, message = "Producto no encontrado." });
        if (!producto.ofrecer1s.Any(o => o.id_usuario == rut)) return Forbid(); // un producto puede tener varios vendedores

        // Actualizar campos
        producto.nombre = dto.nombre;
        producto.restriccionedad = dto.restriccionedad;
        producto.caracteristicas = dto.caracteristicas.GetRawText();
        producto.imagen = dto.imagen;

        // Actualizar categoría (SQL directo, ya que no hay DbSet para 'pertenecer1')
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM pertenecer1 WHERE id_producto = {0}", id);
        await _context.Database.ExecuteSqlRawAsync("INSERT INTO pertenecer1 (id_producto, id_categoria) VALUES ({0}, {1})", id, dto.id_categoria);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Producto actualizado.", data = (object?)null, errors = (object?)null });
    }

    // DELETE: api/productos/{id} (Requiere Auth - Solo el dueño)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Vendedor,Administrador")]
    public async Task<IActionResult> DeleteProducto(int id)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var producto = await _context.productos
            .Include(p => p.ofrecer1s)
            .FirstOrDefaultAsync(p => p.id == id);

        if (producto == null) return NotFound(new { success = false, message = "Producto no encontrado." });
        if (!producto.ofrecer1s.Any(o => o.id_usuario == rut)) return Forbid(); // un producto puede tener varios vendedores

        // Si la BD tiene ON DELETE CASCADE, esto borrará también las relaciones
        _context.productos.Remove(producto);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Producto eliminado.", data = (object?)null, errors = (object?)null });
    }
}