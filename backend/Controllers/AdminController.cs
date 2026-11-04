using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // Aquí deberías validar que el usuario tenga rol de administrador
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    // Tipos de usuario que se guardan en la BD (el login los traduce a roles)
    private static readonly string[] TiposValidos = { "cliente", "vendedor", "ambos", "administrador", "admin" };

    private static object Error(string mensaje, params string[] errores) =>
        new { success = false, message = mensaje, data = (object?)null, errors = errores };

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/admin/usuarios
    [HttpGet("usuarios")]
    public async Task<IActionResult> GetUsuarios()
    {
        var usuarios = await _context.usuarios
            .Select(u => new
            {
                rut = u.rut,
                nombre = u.nombre,
                correo = u.correos.Select(c => c.correo1).FirstOrDefault() ?? "Sin correo",
                tipo = u.tipousuario,
                estado = u.secioniniciada ? "Activo" : "Inactivo", // Simulación de estado
                registro = u.fechacreacion
            })
            .ToListAsync();

        return Ok(new { success = true, message = "Usuarios obtenidos.", data = usuarios, errors = (object?)null });
    }

    // POST: api/admin/usuarios
    // Crea un usuario con su correo. La contraseña se guarda con hash BCrypt, igual que en el registro.
    [HttpPost("usuarios")]
    public async Task<IActionResult> CrearUsuario([FromBody] AdminUsuarioCreateDto dto)
    {
        var rut = dto.rut?.Trim() ?? "";
        var nombre = dto.nombre?.Trim() ?? "";
        var correoNuevo = dto.correo?.Trim() ?? "";
        var tipo = dto.tipousuario?.Trim().ToLowerInvariant() ?? "";

        if (rut == "" || nombre == "" || correoNuevo == "" || string.IsNullOrEmpty(dto.clave))
            return BadRequest(Error("Rut, nombre, correo y contraseña son obligatorios."));

        if (!TiposValidos.Contains(tipo))
            return BadRequest(Error("El tipo de usuario no es válido."));

        // La BD exige fecha de nacimiento desde 1940 (chk_usuario_fecha_nac)
        if (dto.fechanacimiento < new DateOnly(1940, 1, 1) || dto.fechanacimiento > DateOnly.FromDateTime(DateTime.Today))
            return BadRequest(Error("La fecha de nacimiento debe estar entre 1940 y hoy."));

        if (await _context.usuarios.AnyAsync(u => u.rut == rut))
            return Conflict(Error("El RUT ya está registrado.", "rut: ya existe."));

        if (await _context.correos.AnyAsync(c => c.correo1 == correoNuevo))
            return Conflict(Error("El correo ya está registrado.", "correo: ya existe."));

        var nuevo = new usuario
        {
            rut = rut,
            nombre = nombre,
            clave = BCrypt.Net.BCrypt.HashPassword(dto.clave),
            fechanacimiento = dto.fechanacimiento,
            fechacreacion = DateOnly.FromDateTime(DateTime.Now),
            tipousuario = tipo,
            descuentos = "{}",
            secioniniciada = false
        };
        nuevo.correos.Add(new correo { correo1 = correoNuevo });

        _context.usuarios.Add(nuevo);
        await _context.SaveChangesAsync();

        return StatusCode(201, new
        {
            success = true,
            message = "Usuario creado.",
            data = new
            {
                rut = nuevo.rut,
                nombre = nuevo.nombre,
                correo = correoNuevo,
                tipo = nuevo.tipousuario,
                estado = "Inactivo",
                registro = nuevo.fechacreacion
            },
            errors = (object?)null
        });
    }

    // DELETE: api/admin/usuarios/{rut}
    [HttpDelete("usuarios/{rut}")]
    public async Task<IActionResult> EliminarUsuario(string rut)
    {
        if (User.FindFirst(ClaimTypes.NameIdentifier)?.Value == rut)
            return BadRequest(Error("No puedes eliminar tu propia cuenta."));

        var usuarioExistente = await _context.usuarios.FirstOrDefaultAsync(u => u.rut == rut);
        if (usuarioExistente == null)
            return NotFound(Error("El usuario no existe."));

        _context.usuarios.Remove(usuarioExistente);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Casi todas las tablas (ventas, productos, mensajes...) referencian al usuario
            return Conflict(Error("No se puede eliminar: el usuario tiene ventas, productos u otros registros asociados."));
        }

        return Ok(new { success = true, message = "Usuario eliminado.", data = (object?)null, errors = (object?)null });
    }

    // GET: api/admin/resenias
    [HttpGet("resenias")]
    public async Task<IActionResult> GetResenias()
    {
        var resenias = await _context.escribir1s
            .Include(e => e.id_calificacionNavigation)
            .Include(e => e.id_productoNavigation)
            .Include(e => e.id_usuarioNavigation)
            .Select(e => new
            {
                id = e.id_calificacion,
                cliente = e.id_usuarioNavigation.nombre,
                producto = e.id_productoNavigation.nombre,
                calificacion = e.id_calificacionNavigation.calificacion1,
                comentario = e.id_calificacionNavigation.comentario,
                fecha = e.id_calificacionNavigation.fecha
            })
            .OrderByDescending(x => x.fecha)
            .ToListAsync();

        return Ok(new { success = true, message = "Reseñas obtenidas.", data = resenias, errors = (object?)null });
    }

    // GET: api/admin/mensajes
    [HttpGet("mensajes")]
    public async Task<IActionResult> GetMensajes()
    {
        var mensajes = await _context.enviars
            .Include(e => e.id_mensajeNavigation)
            .Include(e => e.id_usuarioNavigation)
            .Select(e => new
            {
                id = e.id_mensaje,
                cliente = e.id_usuarioNavigation.nombre,
                tipo = "Mensaje", // Podrías diferenciar si es pregunta o chat
                contenido = e.id_mensajeNavigation.contenido,
                fecha = e.id_mensajeNavigation.fechaenvio
            })
            .OrderByDescending(x => x.fecha)
            .ToListAsync();

        return Ok(new { success = true, message = "Mensajes obtenidos.", data = mensajes, errors = (object?)null });
    }

    // GET: api/admin/devoluciones
    [HttpGet("devoluciones")]
    public async Task<IActionResult> GetDevoluciones()
    {
        var devolucionesDb = await _context.devolucions
            .Include(d => d.generar1s)
                .ThenInclude(g => g.id_productoNavigation)
            .Include(d => d.generar1s)
                .ThenInclude(g => g.id_usuarioNavigation)
            .ToListAsync();

        var devoluciones = devolucionesDb.Select(d => {
            var primerGenerar1 = d.generar1s.FirstOrDefault();
            
            return new
            {
                id = d.id,
                motivo = d.motivo,
                estado = d.estado,
                fecha_solicitud = d.fechasolicitud,
                producto = primerGenerar1?.id_productoNavigation?.nombre ?? "N/A",
                cliente = primerGenerar1?.id_usuarioNavigation?.nombre ?? "N/A",
                monto = d.montoreintegrado
            };
        })
            .OrderByDescending(x => x.fecha_solicitud)
            .ToList();

        return Ok(new { success = true, message = "Devoluciones obtenidas.", data = devoluciones, errors = (object?)null });
    }

    // PUT: api/admin/devoluciones/{id}/estado
    [HttpPut("devoluciones/{id}/estado")]
    public async Task<IActionResult> ActualizarDevolucion(int id, [FromBody] string estado)
    {
        var devolucion = await _context.devolucions.FindAsync(id);
        if (devolucion == null) return NotFound(new { success = false, message = "Devolución no encontrada." });

        devolucion.estado = estado;
        if (estado == "Aprobada" || estado == "Rechazada")
            devolucion.fecharesolucion = DateOnly.FromDateTime(DateTime.Now);

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Estado actualizado.", data = (object?)null, errors = (object?)null });
    }
}