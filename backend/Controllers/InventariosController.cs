using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Vendedor,Administrador")]
public class InventariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public InventariosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/inventarios (Ver mis inventarios)
    [HttpGet]
    public async Task<IActionResult> GetMisInventarios()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var inventarios = await _context.inventarios
            .Where(i => i.id_usuario == rut)
            .Include(i => i.almacenars)
                .ThenInclude(a => a.id_productoNavigation)
            .Select(i => new
            {
                id = i.id,
                stockminimo = i.stockminimo,
                stockmaximo = i.stockmaximo,
                productos = i.almacenars.Select(a => new
                {
                    id_producto = a.id_producto,
                    nombre = a.id_productoNavigation.nombre,
                    stockactual = a.stockactual
                }).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Inventarios obtenidos.", data = inventarios, errors = (object?)null });
    }

    // POST: api/inventarios (Crear inventario)
    [HttpPost]
    public async Task<IActionResult> CrearInventario([FromBody] InventarioCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var inventario = new inventario
        {
            stockminimo = dto.stockminimo,
            stockmaximo = dto.stockmaximo,
            id_usuario = rut
        };
        _context.inventarios.Add(inventario);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Inventario creado.", data = new { id = inventario.id }, errors = (object?)null });
    }

    // POST: api/inventarios/almacenar (Agregar producto al inventario)
    [HttpPost("almacenar")]
    public async Task<IActionResult> AlmacenarProducto([FromBody] AlmacenarCreateDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        // Validar que el inventario sea del usuario
        var inventario = await _context.inventarios.FindAsync(dto.id_inventario);
        if (inventario == null || inventario.id_usuario != rut)
            return Forbid();

        // Evita el 500 del CHECK stockactual >= 0
        if (dto.stockactual < 0)
            return BadRequest(new { success = false, message = "El stock no puede ser negativo.", data = (object?)null, errors = (object?)null });

        if (inventario.stockmaximo > 0 && dto.stockactual > inventario.stockmaximo)
            return BadRequest(new { success = false, message = $"El stock supera el máximo del inventario ({inventario.stockmaximo}).", data = (object?)null, errors = (object?)null });

        // El producto debe ser del usuario (o admin)
        var producto = await _context.productos
            .Include(p => p.ofrecer1s)
            .FirstOrDefaultAsync(p => p.id == dto.id_producto);
        if (producto == null)
            return NotFound(new { success = false, message = "Producto no encontrado." });

        if (!User.IsInRole("Administrador") && !producto.ofrecer1s.Any(o => o.id_usuario == rut))
            return Forbid();

        var almacenar = await _context.almacenars
            .FirstOrDefaultAsync(a => a.id_inventario == dto.id_inventario && a.id_producto == dto.id_producto);

        if (almacenar != null)
        {
            almacenar.stockactual = dto.stockactual;
        }
        else
        {
            almacenar = new almacenar
            {
                id_inventario = dto.id_inventario,
                id_producto = dto.id_producto,
                stockactual = dto.stockactual
            };
            _context.almacenars.Add(almacenar);
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Stock actualizado.", data = (object?)null, errors = (object?)null });
    }
}