using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.api.DTOs;
using backend.api.Models;

namespace backend.api.Controllers;

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

    // Los estados de una venta se guardan como texto libre ("Pagado", "En Preparación", "Entregado", "Anulado"...).
    // Se agrupan en tres tipos: completada, anulada y pendiente (es decir, en proceso).
    private static string TipoEstadoVenta(string? estado)
    {
        var e = (estado ?? "").Trim().ToLowerInvariant();
        if (e is "completada" or "entregado" or "entregada") return "completada";
        if (e is "anulado" or "anulada" or "cancelado" or "cancelada") return "anulada";
        return "pendiente";
    }

    // Una venta vista desde un usuario: "Contraparte" es el vendedor si él compró, o el cliente si él vendió
    private sealed record VentaFila(int Id, DateTime? Fecha, string Estado, int Neto, decimal Iva, bool RequiereDespacho, string Contraparte)
    {
        public int Total => (int)Math.Round(Neto + Neto * Iva, MidpointRounding.AwayFromZero);
        public string Tipo => TipoEstadoVenta(Estado);
    }

    private static object ResumenVentas(List<VentaFila> filas) => new
    {
        cantidad = filas.Count,
        monto = filas.Where(f => f.Tipo != "anulada").Sum(f => f.Total), // las anuladas no suman
        en_proceso = filas.Count(f => f.Tipo == "pendiente"),
        por_despachar = filas.Count(f => f.Tipo == "pendiente" && f.RequiereDespacho),
        ultima = filas.Select(f => f.Fecha).Max(),
        recientes = filas.Take(5).Select(f => new { f.Id, f.Fecha, f.Estado, tipo_estado = f.Tipo, f.Total, f.Contraparte }).ToList()
    };

    // GET: api/admin/usuarios/{rut}
    // Ficha completa de un usuario: cuenta, contacto, cuánto compró y vendió, y qué tiene en proceso.
    // (No incluye la última sesión: la base de datos solo guarda si el usuario ha iniciado sesión alguna vez.)
    [HttpGet("usuarios/{rut}")]
    public async Task<IActionResult> GetUsuarioDetalle(string rut)
    {
        var usuario = await _context.usuarios
            .AsNoTracking()
            .Where(u => u.rut == rut)
            .Select(u => new { u.rut, u.nombre, u.tipousuario, u.fechanacimiento, u.fechacreacion, u.secioniniciada })
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound(Error("Usuario no encontrado."));

        // ---------- Contacto, direcciones y empresas ----------
        var correos = await _context.correos.AsNoTracking()
            .Where(c => c.id_usuario == rut)
            .OrderBy(c => c.correo1)
            .Select(c => c.correo1)
            .ToListAsync();

        var telefonos = await _context.telefonos.AsNoTracking()
            .Where(t => t.id_usuario == rut)
            .OrderBy(t => t.numero)
            .Select(t => t.numero)
            .ToListAsync();

        var direcciones = await _context.usuarios.AsNoTracking()
            .Where(u => u.rut == rut)
            .SelectMany(u => u.id_direccions)
            .OrderBy(d => d.id)
            .Select(d => new
            {
                d.id,
                d.calle,
                d.numero,
                d.pasaje,
                d.sector,
                comuna = d.id_comunaNavigation.nombre,
                region = d.id_comunaNavigation.id_provinciaNavigation.id_regionNavigation.nombre
            })
            .ToListAsync();

        var empresas = await _context.usuarios.AsNoTracking()
            .Where(u => u.rut == rut)
            .SelectMany(u => u.id_empresas)
            .OrderBy(e => e.rut)
            .Select(e => new { e.rut, e.nombre, e.giro, e.paginaweb })
            .ToListAsync();

        // ---------- Compras y ventas ----------
        var compras = await _context.venta.AsNoTracking()
            .Where(v => v.id_cliente == rut)
            .OrderByDescending(v => v.fecha)
            .ThenByDescending(v => v.id)
            .Select(v => new VentaFila(v.id, v.fecha, v.estado, v.neto, v.iva, v.requieredespacho, v.id_vendedorNavigation.nombre))
            .ToListAsync();

        var ventas = await _context.venta.AsNoTracking()
            .Where(v => v.id_vendedor == rut)
            .OrderByDescending(v => v.fecha)
            .ThenByDescending(v => v.id)
            .Select(v => new VentaFila(v.id, v.fecha, v.estado, v.neto, v.iva, v.requieredespacho, v.id_clienteNavigation.nombre))
            .ToListAsync();

        // ---------- Resto de la actividad ----------
        var cotizaciones = (await _context.solicitar1s.Where(s => s.id_usuario == rut).Select(s => s.id_cotizacion).ToListAsync())
            .Union(await _context.solicitar2s.Where(s => s.id_usuario == rut).Select(s => s.id_cotizacion).ToListAsync())
            .Count();

        var devoluciones = await _context.generar1s.CountAsync(g => g.id_usuario == rut);
        var resenias = await _context.escribir1s.CountAsync(e => e.id_usuario == rut)
                     + await _context.escribir2s.CountAsync(e => e.id_usuario == rut);
        var preguntas = await _context.hacer1s.CountAsync(h => h.id_usuario == rut)
                      + await _context.hacer2s.CountAsync(h => h.id_usuario == rut);
        var favoritos = await _context.crear1s.CountAsync(c => c.id_usuario == rut)
                      + await _context.crear2s.CountAsync(c => c.id_usuario == rut);
        var productosPublicados = await _context.ofrecer1s.CountAsync(o => o.id_usuario == rut);
        var serviciosPublicados = await _context.ofrecer2s.CountAsync(o => o.id_usuario == rut);

        var data = new
        {
            usuario.rut,
            usuario.nombre,
            tipo = usuario.tipousuario,
            usuario.fechanacimiento,
            registro = usuario.fechacreacion,
            sesion_iniciada = usuario.secioniniciada,
            correos,
            telefonos = telefonos.Select(t => t.ToString()).ToList(),
            direcciones,
            empresas,
            compras = ResumenVentas(compras),
            ventas = ResumenVentas(ventas),
            actividad = new { cotizaciones, devoluciones, resenias, preguntas, favoritos },
            publicaciones = new { productos = productosPublicados, servicios = serviciosPublicados }
        };

        return Ok(new { success = true, message = "Usuario obtenido.", data, errors = (object?)null });
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

    // GET: api/admin/ventas
    // Todas las ventas de la plataforma (operaciones globales del administrador),
    // con cliente, vendedor, total (neto + IVA) y el detalle de lo vendido.
    [HttpGet("ventas")]
    public async Task<IActionResult> GetVentas()
    {
        var ventasDb = await _context.venta
            .AsNoTracking()
            .OrderByDescending(v => v.fecha)
            .ThenByDescending(v => v.id)
            .Select(v => new
            {
                id = v.id,
                fecha = v.fecha,
                estado = v.estado,
                neto = v.neto,
                iva = v.iva,
                requieredespacho = v.requieredespacho,
                nota = v.nota,
                cliente = v.id_clienteNavigation.nombre,
                rut_cliente = v.id_cliente,
                vendedor = v.id_vendedorNavigation.nombre,
                rut_vendedor = v.id_vendedor,
                productos = v.generar3s.Select(g => new
                {
                    nombre = g.id_productoNavigation.nombre,
                    cantidad = g.cantidad,
                    subtotal = g.totalfinal
                }).ToList(),
                servicios = v.generar4s.Select(g => new
                {
                    nombre = g.id_servicioNavigation.nombre,
                    cantidad = g.cantidad,
                    subtotal = g.totalfinal
                }).ToList()
            })
            .ToListAsync();

        var ventas = ventasDb.Select(v => new
        {
            v.id,
            v.fecha,
            v.estado,
            v.neto,
            total = Math.Round(v.neto + v.neto * v.iva, MidpointRounding.AwayFromZero),
            requiere_despacho = v.requieredespacho,
            v.nota,
            v.cliente,
            v.rut_cliente,
            v.vendedor,
            v.rut_vendedor,
            items = v.productos
                .Select(p => new { tipo = "producto", p.nombre, p.cantidad, p.subtotal })
                .Concat(v.servicios.Select(s => new { tipo = "servicio", s.nombre, s.cantidad, s.subtotal }))
                .ToList()
        }).ToList();

        return Ok(new { success = true, message = "Ventas obtenidas.", data = ventas, errors = (object?)null });
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