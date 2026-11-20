using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private const string NombreListaPorDefecto = "Mis Favoritos";
    private const int MaxNombre = 50;
    private const int MaxDescripcion = 150;

    private readonly AppDbContext _context;

    public WishlistController(AppDbContext context)
    {
        _context = context;
    }

    // En la base de datos, ListaDeseos no tiene dueño: una lista es de un usuario cuando ese usuario
    // tiene al menos un ítem en ella (Crear1 para productos, Crear2 para servicios).
    // Por eso una lista solo existe mientras tenga algo guardado: se crea junto con su primer ítem
    // y desaparece cuando se quita el último.

    private async Task<List<int>> IdsListasDelUsuario(string rut)
    {
        var deProductos = await _context.crear1s.Where(c => c.id_usuario == rut).Select(c => c.id_lista).ToListAsync();
        var deServicios = await _context.crear2s.Where(c => c.id_usuario == rut).Select(c => c.id_lista).ToListAsync();
        return deProductos.Concat(deServicios).Distinct().ToList();
    }

    private async Task<bool> UsuarioTieneLista(string rut, int idLista)
    {
        return await _context.crear1s.AnyAsync(c => c.id_usuario == rut && c.id_lista == idLista)
            || await _context.crear2s.AnyAsync(c => c.id_usuario == rut && c.id_lista == idLista);
    }

    // Borra la fila de ListaDeseos cuando nadie tiene ya ítems en ella (llamar después de guardar los cambios)
    private async Task BorrarListasVacias(IEnumerable<int> idsListas)
    {
        foreach (var idLista in idsListas.Distinct())
        {
            var hayItems = await _context.crear1s.AnyAsync(c => c.id_lista == idLista)
                || await _context.crear2s.AnyAsync(c => c.id_lista == idLista);
            if (hayItems) continue;

            var lista = await _context.listadeseos.FindAsync(idLista);
            if (lista != null) _context.listadeseos.Remove(lista);
        }
        await _context.SaveChangesAsync();
    }

    private async Task<bool> NombreRepetido(string rut, string nombre, int? ignorarId = null)
    {
        var ids = await IdsListasDelUsuario(rut);
        var nombres = await _context.listadeseos
            .Where(l => ids.Contains(l.id) && l.id != ignorarId)
            .Select(l => l.nombrelista)
            .ToListAsync();
        return nombres.Any(n => string.Equals(n.Trim(), nombre, StringComparison.OrdinalIgnoreCase));
    }

    private static string? ValidarDatosLista(string? nombre, string? descripcion)
    {
        if (string.IsNullOrWhiteSpace(nombre)) return "El nombre de la lista es obligatorio.";
        if (nombre.Trim().Length > MaxNombre) return $"El nombre no puede superar los {MaxNombre} caracteres.";
        if ((descripcion ?? "").Trim().Length > MaxDescripcion) return $"La descripción no puede superar los {MaxDescripcion} caracteres.";
        return null;
    }

    private IActionResult SinSesion() =>
        Unauthorized(new { success = false, message = "Usuario no autenticado." });

    // GET: api/wishlist (Ver todo lo que guardé; cada ítem indica en qué lista está)
    [HttpGet]
    public async Task<IActionResult> GetMiWishlist()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return SinSesion();

        var productos = await _context.crear1s
            .Where(c => c.id_usuario == rut)
            .Include(c => c.id_productoNavigation)
            .Select(c => new { id = c.id_producto, nombre = c.id_productoNavigation.nombre, tipo = "producto", idLista = c.id_lista })
            .ToListAsync();

        var servicios = await _context.crear2s
            .Where(c => c.id_usuario == rut)
            .Include(c => c.id_servicioNavigation)
            .Select(c => new { id = c.id_servicio, nombre = c.id_servicioNavigation.nombre, tipo = "servicio", idLista = c.id_lista })
            .ToListAsync();

        return Ok(new { success = true, message = "Wishlist obtenida.", data = new { productos, servicios }, errors = (object?)null });
    }

    // GET: api/wishlist/listas (Mis listas, con la cantidad de ítems de cada una)
    [HttpGet("listas")]
    public async Task<IActionResult> GetMisListas()
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return SinSesion();

        var ids = await IdsListasDelUsuario(rut);
        var listas = await _context.listadeseos.Where(l => ids.Contains(l.id)).OrderBy(l => l.id).ToListAsync();

        var porProductos = await _context.crear1s.Where(c => c.id_usuario == rut)
            .GroupBy(c => c.id_lista).Select(g => new { id = g.Key, cantidad = g.Count() }).ToListAsync();
        var porServicios = await _context.crear2s.Where(c => c.id_usuario == rut)
            .GroupBy(c => c.id_lista).Select(g => new { id = g.Key, cantidad = g.Count() }).ToListAsync();

        var data = listas.Select(l => new
        {
            id = l.id,
            nombre = l.nombrelista,
            descripcion = l.descripcion ?? "",
            publica = l.visibilidad,
            cantidad = (porProductos.FirstOrDefault(x => x.id == l.id)?.cantidad ?? 0)
                     + (porServicios.FirstOrDefault(x => x.id == l.id)?.cantidad ?? 0)
        }).ToList();

        return Ok(new { success = true, message = "Listas obtenidas.", data, errors = (object?)null });
    }

    // POST: api/wishlist/listas (Crear una lista nueva junto con su primer producto o servicio)
    [HttpPost("listas")]
    public async Task<IActionResult> CrearLista([FromBody] WishlistListaDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return SinSesion();

        var errorDatos = ValidarDatosLista(dto.nombre, dto.descripcion);
        if (errorDatos != null) return BadRequest(new { success = false, message = errorDatos });

        var nombre = dto.nombre.Trim();
        if (await NombreRepetido(rut, nombre))
            return BadRequest(new { success = false, message = "Ya tienes una lista con ese nombre." });

        // Sin ítems una lista no tendría dueño, así que se crea siempre con el primero
        var tipo = (dto.tipo ?? "").ToLower();
        if ((tipo != "producto" && tipo != "servicio") || dto.id_item == null)
            return BadRequest(new { success = false, message = "Una lista nueva se crea al guardar su primer producto o servicio." });

        if (tipo == "producto" && !await _context.productos.AnyAsync(p => p.id == dto.id_item))
            return NotFound(new { success = false, message = "El producto no existe." });
        if (tipo == "servicio" && !await _context.servicios.AnyAsync(s => s.id == dto.id_item))
            return NotFound(new { success = false, message = "El servicio no existe." });

        var lista = new listadeseo
        {
            nombrelista = nombre,
            descripcion = (dto.descripcion ?? "").Trim(),
            visibilidad = dto.publica
        };

        // La lista y su primer ítem se guardan en un solo SaveChanges: o se crean los dos o ninguno
        if (tipo == "producto")
            _context.crear1s.Add(new crear1 { id_listaNavigation = lista, id_producto = dto.id_item.Value, id_usuario = rut });
        else
            _context.crear2s.Add(new crear2 { id_listaNavigation = lista, id_servicio = dto.id_item.Value, id_usuario = rut });

        await _context.SaveChangesAsync();

        var data = new { id = lista.id, nombre = lista.nombrelista, descripcion = lista.descripcion ?? "", publica = lista.visibilidad, cantidad = 1 };
        return Ok(new { success = true, message = "Lista creada.", data, errors = (object?)null });
    }

    // PUT: api/wishlist/listas/3 (Cambiar nombre, descripción y visibilidad)
    [HttpPut("listas/{id}")]
    public async Task<IActionResult> ActualizarLista(int id, [FromBody] WishlistListaDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return SinSesion();

        if (!await UsuarioTieneLista(rut, id))
            return NotFound(new { success = false, message = "La lista no existe." });

        var errorDatos = ValidarDatosLista(dto.nombre, dto.descripcion);
        if (errorDatos != null) return BadRequest(new { success = false, message = errorDatos });

        var nombre = dto.nombre.Trim();
        if (await NombreRepetido(rut, nombre, id))
            return BadRequest(new { success = false, message = "Ya tienes una lista con ese nombre." });

        var lista = await _context.listadeseos.FindAsync(id);
        if (lista == null)
            return NotFound(new { success = false, message = "La lista no existe." });

        lista.nombrelista = nombre;
        lista.descripcion = (dto.descripcion ?? "").Trim();
        lista.visibilidad = dto.publica;
        await _context.SaveChangesAsync();

        var cantidad = await _context.crear1s.CountAsync(c => c.id_usuario == rut && c.id_lista == id)
                     + await _context.crear2s.CountAsync(c => c.id_usuario == rut && c.id_lista == id);
        var data = new { id = lista.id, nombre = lista.nombrelista, descripcion = lista.descripcion ?? "", publica = lista.visibilidad, cantidad };
        return Ok(new { success = true, message = "Lista actualizada.", data, errors = (object?)null });
    }

    // DELETE: api/wishlist/listas/3 (Eliminar una lista con todo lo que guardé en ella)
    [HttpDelete("listas/{id}")]
    public async Task<IActionResult> EliminarLista(int id)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return SinSesion();

        var productos = await _context.crear1s.Where(c => c.id_usuario == rut && c.id_lista == id).ToListAsync();
        var servicios = await _context.crear2s.Where(c => c.id_usuario == rut && c.id_lista == id).ToListAsync();
        if (productos.Count == 0 && servicios.Count == 0)
            return NotFound(new { success = false, message = "La lista no existe." });

        _context.crear1s.RemoveRange(productos);
        _context.crear2s.RemoveRange(servicios);
        await _context.SaveChangesAsync();
        await BorrarListasVacias(new[] { id });

        return Ok(new { success = true, message = "Lista eliminada.", data = (object?)null, errors = (object?)null });
    }

    // POST: api/wishlist/agregar
    // Con id_lista se guarda en esa lista; sin id_lista, en "Mis Favoritos" (o la primera lista que tenga).
    [HttpPost("agregar")]
    public async Task<IActionResult> AgregarAWishlist([FromBody] WishlistAddDto dto)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return SinSesion();

        var tipo = (dto.tipo ?? "").ToLower();
        if (tipo != "producto" && tipo != "servicio")
            return BadRequest(new { success = false, message = "Tipo inválido." });

        // 1. Elegir la lista del usuario
        listadeseo? lista;
        if (dto.id_lista != null)
        {
            if (!await UsuarioTieneLista(rut, dto.id_lista.Value))
                return NotFound(new { success = false, message = "La lista no existe." });
            lista = await _context.listadeseos.FindAsync(dto.id_lista.Value);
        }
        else
        {
            var ids = await IdsListasDelUsuario(rut);
            var listas = await _context.listadeseos.Where(l => ids.Contains(l.id)).OrderBy(l => l.id).ToListAsync();
            lista = listas.FirstOrDefault(l => l.nombrelista == NombreListaPorDefecto) ?? listas.FirstOrDefault();
            if (lista == null)
            {
                lista = new listadeseo { nombrelista = NombreListaPorDefecto, descripcion = "Lista por defecto", visibilidad = false };
                _context.listadeseos.Add(lista);
                await _context.SaveChangesAsync();
            }
        }
        if (lista == null)
            return NotFound(new { success = false, message = "La lista no existe." });

        // 2. Agregar el ítem
        if (tipo == "producto")
        {
            var existe = await _context.crear1s.AnyAsync(c => c.id_lista == lista.id && c.id_producto == dto.id_item && c.id_usuario == rut);
            if (existe) return BadRequest(new { success = false, message = "El producto ya está en tu lista." });

            _context.crear1s.Add(new crear1 { id_lista = lista.id, id_producto = dto.id_item, id_usuario = rut });
        }
        else
        {
            var existe = await _context.crear2s.AnyAsync(c => c.id_lista == lista.id && c.id_servicio == dto.id_item && c.id_usuario == rut);
            if (existe) return BadRequest(new { success = false, message = "El servicio ya está en tu lista." });

            _context.crear2s.Add(new crear2 { id_lista = lista.id, id_servicio = dto.id_item, id_usuario = rut });
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Agregado a la lista de deseos.", data = (object?)null, errors = (object?)null });
    }

    // DELETE: api/wishlist/eliminar/producto/5?idLista=3 (Quitar un ítem de mis listas)
    // Con idLista lo quita solo de esa lista; sin idLista, de todas las que lo tengan.
    [HttpDelete("eliminar/{tipo}/{id}")]
    public async Task<IActionResult> EliminarDeWishlist(string tipo, int id, [FromQuery] int? idLista = null)
    {
        var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(rut)) return SinSesion();

        List<int> listasAfectadas;
        if (tipo.ToLower() == "producto")
        {
            var items = await _context.crear1s
                .Where(c => c.id_usuario == rut && c.id_producto == id && (idLista == null || c.id_lista == idLista))
                .ToListAsync();
            if (items.Count == 0)
                return NotFound(new { success = false, message = "El producto no está en tu lista." });
            listasAfectadas = items.Select(c => c.id_lista).ToList();
            _context.crear1s.RemoveRange(items);
        }
        else if (tipo.ToLower() == "servicio")
        {
            var items = await _context.crear2s
                .Where(c => c.id_usuario == rut && c.id_servicio == id && (idLista == null || c.id_lista == idLista))
                .ToListAsync();
            if (items.Count == 0)
                return NotFound(new { success = false, message = "El servicio no está en tu lista." });
            listasAfectadas = items.Select(c => c.id_lista).ToList();
            _context.crear2s.RemoveRange(items);
        }
        else
        {
            return BadRequest(new { success = false, message = "Tipo inválido." });
        }

        await _context.SaveChangesAsync();
        await BorrarListasVacias(listasAfectadas);
        return Ok(new { success = true, message = "Quitado de la lista de deseos.", data = (object?)null, errors = (object?)null });
    }
}