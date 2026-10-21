using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Aquí deberías validar que el usuario tenga rol de administrador
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

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