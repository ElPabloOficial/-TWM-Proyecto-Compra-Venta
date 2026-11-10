using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.api.DTOs;
using backend.api.Models;

namespace backend.api.Controllers;

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

        // 1. Buscar la lista de deseos del usuario (la que ya usa en Crear1/Crear2) o crear una si es su primer favorito.
        // Antes se tomaba la primera lista de toda la tabla, y todos los usuarios compartían la misma.
        var idLista = await _context.crear1s.Where(c => c.id_usuario == rut).Select(c => (int?)c.id_lista).FirstOrDefaultAsync()
            ?? await _context.crear2s.Where(c => c.id_usuario == rut).Select(c => (int?)c.id_lista).FirstOrDefaultAsync();
        var lista = idLista != null ? await _context.listadeseos.FindAsync(idLista.Value) : null;
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

    // DELETE: api/wishlist/eliminar/producto/5 (Quitar un ítem de mi lista)
    // El cliente puede eliminar lo que guardó en su lista de deseos.
    [HttpDelete("eliminar/{tipo}/{id}")]
    public async Task<IActionResult> EliminarDeWishlist(string tipo, int id)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut))
            return Unauthorized(new { success = false, message = "Usuario no autenticado." });

        if (tipo.ToLower() == "producto")
        {
            var items = await _context.crear1s.Where(c => c.id_usuario == rut && c.id_producto == id).ToListAsync();
            if (items.Count == 0)
                return NotFound(new { success = false, message = "El producto no está en tu lista." });
            _context.crear1s.RemoveRange(items);
        }
        else if (tipo.ToLower() == "servicio")
        {
            var items = await _context.crear2s.Where(c => c.id_usuario == rut && c.id_servicio == id).ToListAsync();
            if (items.Count == 0)
                return NotFound(new { success = false, message = "El servicio no está en tu lista." });
            _context.crear2s.RemoveRange(items);
        }
        else
        {
            return BadRequest(new { success = false, message = "Tipo inválido." });
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Quitado de la lista de deseos.", data = (object?)null, errors = (object?)null });
    }
}