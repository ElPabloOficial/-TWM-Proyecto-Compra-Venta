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
[Authorize] // Todo el carrito requiere login
public class CarritoController : ControllerBase
{
    private readonly AppDbContext _context;

    public CarritoController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/carrito (Ver mi carrito)
    [HttpGet]
    public async Task<IActionResult> GetMiCarrito()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var productosCarrito = await _context.crear3s
            .Where(c => c.id_usuario == rut)
            .Include(c => c.id_productoNavigation)
            .Select(c => new {
                id_carrito = c.id_carrito,
                tipo = "producto",
                id_item = c.id_producto,
                nombre = c.id_productoNavigation.nombre,
                cantidad = c.cantidad,
                total = c.total
            }).ToListAsync();

        var serviciosCarrito = await _context.crear4s
            .Where(c => c.id_usuario == rut)
            .Include(c => c.id_servicioNavigation)
            .Select(c => new {
                id_carrito = c.id_carrito,
                tipo = "servicio",
                id_item = c.id_servicio,
                nombre = c.id_servicioNavigation.nombre,
                cantidad = c.cantidad,
                total = c.total
            }).ToListAsync();

        return Ok(new { 
            success = true, 
            message = "Carrito obtenido.", 
            data = new { productos = productosCarrito, servicios = serviciosCarrito }, 
            errors = (object?)null 
        });
    }

    // POST: api/carrito/agregar
    [HttpPost("agregar")]
    public async Task<IActionResult> AgregarAlCarrito([FromBody] AgregarCarritoDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var carritoExistente = await _context.carritocompras
            .FirstOrDefaultAsync(c => c.crear3s.Any(x => x.id_usuario == rut) || c.crear4s.Any(x => x.id_usuario == rut));

        int idCarrito;

        if (carritoExistente == null)
        {
            var nuevoCarrito = new carritocompra
            {
                estado = "Activo",
                ultimaactualizacion = DateTime.Today
            };
            _context.carritocompras.Add(nuevoCarrito);
            await _context.SaveChangesAsync(); 
            idCarrito = nuevoCarrito.id;
        }
        else
        {
            idCarrito = carritoExistente.id;
        }

        if (dto.tipo.ToLower() == "producto")
        {
            var producto = await _context.productos.FindAsync(dto.id_item);
            if (producto == null) return NotFound(new { success = false, message = "Producto no encontrado" });

            var existente = await _context.crear3s.FirstOrDefaultAsync(c => c.id_carrito == idCarrito && c.id_producto == dto.id_item);
            if (existente != null)
            {
                existente.cantidad += dto.cantidad;
            }
            else
            {
                var nuevoItem = new crear3
                {
                    id_carrito = idCarrito,
                    id_producto = dto.id_item,
                    id_usuario = rut,
                    cantidad = dto.cantidad,
                    total = 0 
                };
                _context.crear3s.Add(nuevoItem);
            }
        }
        else if (dto.tipo.ToLower() == "servicio")
        {
            var servicio = await _context.servicios.FindAsync(dto.id_item);
            if (servicio == null) return NotFound(new { success = false, message = "Servicio no encontrado" });

            var existente = await _context.crear4s.FirstOrDefaultAsync(c => c.id_carrito == idCarrito && c.id_servicio == dto.id_item);
            if (existente != null)
            {
                existente.cantidad += dto.cantidad;
            }
            else
            {
                var nuevoItem = new crear4
                {
                    id_carrito = idCarrito,
                    id_servicio = dto.id_item,
                    id_usuario = rut,
                    cantidad = dto.cantidad,
                    total = 0
                };
                _context.crear4s.Add(nuevoItem);
            }
        }
        else
        {
            return BadRequest(new { success = false, message = "Tipo inválido. Use 'producto' o 'servicio'." });
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Item agregado al carrito.", data = new { id_carrito = idCarrito }, errors = (object?)null });
    }

    // PUT: api/carrito/actualizar (Actualizar cantidad)
    [HttpPut("actualizar")]
    public async Task<IActionResult> ActualizarCantidad([FromBody] ActualizarCarritoDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized();
        if (dto.cantidad <= 0) return BadRequest(new { success = false, message = "La cantidad debe ser mayor a 0." });

        if (dto.tipo.ToLower() == "producto")
        {
            var item = await _context.crear3s
                .Include(c => c.id_productoNavigation)
                .FirstOrDefaultAsync(c => c.id_usuario == rut && c.id_producto == dto.id_item);
            
            if (item == null) return NotFound(new { success = false, message = "Producto no está en el carrito." });
            
            item.cantidad = dto.cantidad;
            
            // Recalcular el total usando el precio del JSON
            var json = JsonDocument.Parse(item.id_productoNavigation.caracteristicas ?? "{}");
            if (json.RootElement.TryGetProperty("precio", out var precioElement))
            {
                item.total = precioElement.GetInt32() * dto.cantidad;
            }
        }
        else if (dto.tipo.ToLower() == "servicio")
        {
            var item = await _context.crear4s
                .Include(c => c.id_servicioNavigation)
                .FirstOrDefaultAsync(c => c.id_usuario == rut && c.id_servicio == dto.id_item);
            
            if (item == null) return NotFound(new { success = false, message = "Servicio no está en el carrito." });
            
            item.cantidad = dto.cantidad;

            // Recalcular total para servicio
            var json = JsonDocument.Parse(item.id_servicioNavigation.caracteristicas ?? "{}");
            if (json.RootElement.TryGetProperty("precio", out var precioElement))
            {
                item.total = precioElement.GetInt32() * dto.cantidad;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Cantidad actualizada.", data = (object?)null, errors = (object?)null });
    }

    // DELETE: api/carrito/eliminar/{tipo}/{idItem}
    [HttpDelete("eliminar/{tipo}/{idItem}")]
    public async Task<IActionResult> EliminarDelCarrito(string tipo, int idItem)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return Unauthorized();

        if (tipo.ToLower() == "producto")
        {
            var item = await _context.crear3s.FirstOrDefaultAsync(c => c.id_usuario == rut && c.id_producto == idItem);
            if (item != null) _context.crear3s.Remove(item);
        }
        else if (tipo.ToLower() == "servicio")
        {
            var item = await _context.crear4s.FirstOrDefaultAsync(c => c.id_usuario == rut && c.id_servicio == idItem);
            if (item != null) _context.crear4s.Remove(item);
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Ítem eliminado del carrito.", data = (object?)null, errors = (object?)null });
    }
}