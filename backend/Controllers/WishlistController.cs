using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _context;

    public WishlistController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/wishlist (Ver mi lista)
    [HttpGet]
    public async Task<IActionResult> GetMiWishlist()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        var productos = await _context.crear1s
            .Where(c => c.id_usuario == rut)
            .Include(c => c.id_productoNavigation)
            .Select(c => new { id = c.id_producto, nombre = c.id_productoNavigation.nombre, tipo = "producto" })
            .ToListAsync();

        var servicios = await _context.crear2s
            .Where(c => c.id_usuario == rut)
            .Include(c => c.id_servicioNavigation)
            .Select(c => new { id = c.id_servicio, nombre = c.id_servicioNavigation.nombre, tipo = "servicio" })
            .ToListAsync();

        return Ok(new { success = true, message = "Wishlist obtenida.", data = new { productos, servicios }, errors = (object?)null });
    }

    // POST: api/wishlist/agregar
    [HttpPost("agregar")]
    public async Task<IActionResult> AgregarAWishlist([FromBody] WishlistAddDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        // 1. Buscar o crear una lista de deseos por defecto para el usuario
        var lista = await _context.listadeseos.FirstOrDefaultAsync();
        if (lista == null)
        {
            lista = new listadeseo { nombrelista = "Mis Favoritos", descripcion = "Lista por defecto", visibilidad = false };
            _context.listadeseos.Add(lista);
            await _context.SaveChangesAsync();
        }

        // 2. Agregar el ítem
        if (dto.tipo.ToLower() == "producto")
        {
            var existe = await _context.crear1s.AnyAsync(c => c.id_lista == lista.id && c.id_producto == dto.id_item && c.id_usuario == rut);
            if (existe) return BadRequest(new { success = false, message = "El producto ya está en tu lista." });

            var item = new crear1 { id_lista = lista.id, id_producto = dto.id_item, id_usuario = rut };
            _context.crear1s.Add(item);
        }
        else if (dto.tipo.ToLower() == "servicio")
        {
            var existe = await _context.crear2s.AnyAsync(c => c.id_lista == lista.id && c.id_servicio == dto.id_item && c.id_usuario == rut);
            if (existe) return BadRequest(new { success = false, message = "El servicio ya está en tu lista." });

            var item = new crear2 { id_lista = lista.id, id_servicio = dto.id_item, id_usuario = rut };
            _context.crear2s.Add(item);
        }
        else
        {
            return BadRequest(new { success = false, message = "Tipo inválido." });
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Agregado a la lista de deseos.", data = (object?)null, errors = (object?)null });
    }
}