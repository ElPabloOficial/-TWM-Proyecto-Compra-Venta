using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.api.DTOs;
using backend.api.Models;

namespace backend.api.Controllers;

// Perfil del usuario con sesión iniciada. El RUT sale siempre del token (JWT), nunca del cuerpo
// de la petición, así que nadie puede ver ni modificar el perfil de otra persona.
//
//   GET  api/perfil        -> datos personales + dirección + empresa
//   PUT  api/perfil        -> guarda los cambios
//   PUT  api/perfil/clave  -> cambia la contraseña
//   PUT  api/perfil/vendedor -> convierte una cuenta de cliente en vendedor (la empresa es opcional)
//
// Cómo se guardan los datos en la base:
//   - teléfonos: el perfil maneja la lista completa (hasta 5).
//   - correo y dirección: el usuario puede tener varios; el perfil edita el "principal"
//     (el primero). Si no tiene ninguno, se crea.
//   - empresa: se edita la primera empresa del vendedor (tabla tener3). El RUT de la empresa no
//     se puede cambiar después de creada porque es su clave primaria.
//   - el RUT del usuario tampoco se puede cambiar (es su clave primaria y va dentro del token).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PerfilController : ControllerBase
{
    private const int MaximoTelefonos = 5;

    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public PerfilController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    private string? RutActual() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private IActionResult Falla(int status, string mensaje, params string[] errores) =>
        StatusCode(status, new
        {
            success = false,
            message = mensaje,
            data = (object?)null,
            errors = errores
        });

    private static string? Vacio(string? texto) =>
        string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();

    // "76.543.210-k" -> "76543210-K" (así se guardan los RUT en la base de datos)
    private static string LimpiarRut(string? rut) =>
        new string((rut ?? "").Where(c => !char.IsWhiteSpace(c) && c != '.').ToArray()).ToUpperInvariant();

    private static bool EsCorreoValido(string valor)
    {
        try
        {
            return new MailAddress(valor).Address == valor;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    // GET: api/perfil
    [HttpGet]
    public async Task<IActionResult> GetPerfil()
    {
        var rut = RutActual();
        if (string.IsNullOrEmpty(rut))
            return Falla(401, "Usuario no autenticado.");

        var perfil = await ConstruirPerfil(rut);
        if (perfil == null)
            return Falla(404, "Usuario no encontrado.");

        return Ok(new { success = true, message = "Perfil obtenido.", data = perfil, errors = (object?)null });
    }

    // PUT: api/perfil
    [HttpPut]
    public async Task<IActionResult> ActualizarPerfil([FromBody] PerfilUpdateDto dto)
    {
        var rut = RutActual();
        if (string.IsNullOrEmpty(rut))
            return Falla(401, "Usuario no autenticado.");

        var u = await _context.usuarios
            .Include(x => x.correos)
            .Include(x => x.telefonos)
            .Include(x => x.id_direccions)
            .Include(x => x.id_empresas)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.rut == rut);

        if (u == null)
            return Falla(404, "Usuario no encontrado.");

        var errores = new List<string>();
        var hayConflicto = false; // 409 (dato ya usado por otra persona) en vez de 400

        // ---------- Datos personales ----------
        var nombre = Vacio(dto.nombre);
        if (nombre != null)
        {
            if (nombre.Length > 100) errores.Add("nombre: máximo 100 caracteres.");
            else u.nombre = nombre;
        }

        if (dto.fechanacimiento is DateOnly nacimiento)
        {
            if (nacimiento < new DateOnly(1940, 1, 1) || nacimiento > DateOnly.FromDateTime(DateTime.Today))
                errores.Add("fechanacimiento: la fecha no es válida.");
            else
                u.fechanacimiento = nacimiento;
        }

        // ---------- Correo ----------
        var correoNuevo = Vacio(dto.correo);
        if (correoNuevo != null)
        {
            var correoActual = u.correos.OrderBy(c => c.correo1).FirstOrDefault();
            if (correoActual == null || correoActual.correo1 != correoNuevo)
            {
                if (correoNuevo.Length > 100 || !EsCorreoValido(correoNuevo))
                {
                    errores.Add("correo: el formato no es válido.");
                }
                else if (await _context.correos.AnyAsync(c => c.correo1 == correoNuevo))
                {
                    errores.Add("correo: ya está registrado.");
                    hayConflicto = true;
                }
                else
                {
                    // El correo es la clave primaria de su tabla: para cambiarlo se reemplaza la fila
                    if (correoActual != null) _context.correos.Remove(correoActual);
                    _context.correos.Add(new correo { correo1 = correoNuevo, id_usuario = rut });
                }
            }
        }

        // ---------- Teléfonos ----------
        if (dto.telefonos != null)
        {
            var deseados = new List<int>();

            foreach (var texto in dto.telefonos)
            {
                var limpio = Vacio(texto);
                if (limpio == null) continue; // las filas en blanco se ignoran

                // Acepta "+56 9 8765 4321", "9 8765 4321", "987654321"...
                var digitos = new string(limpio.Where(char.IsDigit).ToArray());
                if (digitos.Length == 11 && digitos.StartsWith("56")) digitos = digitos.Substring(2);

                if (digitos.Length != 9 || !int.TryParse(digitos, out var numeroTel))
                    errores.Add($"telefono: \"{limpio}\" debe tener 9 dígitos (ej. +56 9 1234 5678).");
                else if (!deseados.Contains(numeroTel))
                    deseados.Add(numeroTel);
            }

            if (deseados.Count > MaximoTelefonos)
                errores.Add($"telefono: máximo {MaximoTelefonos} números.");

            var actuales = u.telefonos.ToList();

            // Los que ya no están en la lista se quitan. Si el mismo número también es de una empresa,
            // solo se desvincula del usuario para no borrarle el teléfono a la empresa.
            foreach (var viejo in actuales.Where(x => !deseados.Contains(x.numero)))
            {
                if (viejo.id_empresa != null) viejo.id_usuario = null;
                else _context.telefonos.Remove(viejo);
            }

            // Los nuevos se agregan (el número es clave primaria: no puede estar usado por otra persona)
            foreach (var numeroNuevo in deseados.Where(x => actuales.All(y => y.numero != x)))
            {
                if (await _context.telefonos.AnyAsync(t => t.numero == numeroNuevo))
                {
                    errores.Add($"telefono: {numeroNuevo} ya está registrado.");
                    hayConflicto = true;
                }
                else
                {
                    _context.telefonos.Add(new telefono { numero = numeroNuevo, id_usuario = rut });
                }
            }
        }

        // ---------- Dirección ----------
        if (dto.direccion != null)
        {
            var d = dto.direccion;
            var calle = Vacio(d.calle);

            if (calle != null || d.numero.HasValue || d.id_comuna.HasValue)
            {
                var existente = u.id_direccions.OrderBy(x => x.id).FirstOrDefault();

                // Calle, número y comuna son obligatorios: si no vienen se conserva lo que ya había.
                // Pasaje, descripción y sector son opcionales y sí se pueden vaciar.
                var calleFinal = calle ?? existente?.calle;
                var numeroFinal = d.numero ?? existente?.numero;
                var comunaFinal = d.id_comuna ?? existente?.id_comuna;
                var pasaje = Vacio(d.pasaje);
                var descripcion = Vacio(d.descripcion);
                var sector = Vacio(d.sector);

                if (string.IsNullOrEmpty(calleFinal)) errores.Add("direccion.calle: es obligatoria.");
                else if (calleFinal.Length > 100) errores.Add("direccion.calle: máximo 100 caracteres.");

                if (numeroFinal is null or <= 0) errores.Add("direccion.numero: debe ser mayor a 0.");

                if (comunaFinal is null) errores.Add("direccion.comuna: selecciona una comuna.");
                else if (!await _context.comunas.AnyAsync(c => c.id == comunaFinal))
                    errores.Add("direccion.comuna: la comuna no existe.");

                if ((pasaje?.Length ?? 0) > 100 || (descripcion?.Length ?? 0) > 100 || (sector?.Length ?? 0) > 100)
                    errores.Add("direccion: pasaje, descripción y sector admiten máximo 100 caracteres.");

                if (errores.Count == 0)
                {
                    if (existente == null)
                    {
                        // Al agregarla a la colección del usuario EF crea la dirección y su vínculo (registrar2)
                        u.id_direccions.Add(new direccion
                        {
                            calle = calleFinal!,
                            numero = numeroFinal!.Value,
                            id_comuna = comunaFinal!.Value,
                            pasaje = pasaje,
                            descripcion = descripcion,
                            sector = sector
                        });
                    }
                    else
                    {
                        existente.calle = calleFinal!;
                        existente.numero = numeroFinal!.Value;
                        existente.id_comuna = comunaFinal!.Value;
                        existente.pasaje = pasaje;
                        existente.descripcion = descripcion;
                        existente.sector = sector;
                    }
                }
            }
        }

        // ---------- Empresa (solo vendedores) ----------
        if (dto.empresa != null)
        {
            var tipo = u.tipousuario.Trim().ToLowerInvariant();
            if (tipo != "vendedor" && tipo != "ambos")
                return Falla(403, "Solo los vendedores tienen datos de empresa.");

            var e = dto.empresa;
            var rutEmpresa = LimpiarRut(e.rut);
            var nombreEmpresa = Vacio(e.nombre);
            var giro = Vacio(e.giro);
            var paginaweb = Vacio(e.paginaweb);
            var empresaActual = u.id_empresas.OrderBy(x => x.rut).FirstOrDefault();

            if ((nombreEmpresa?.Length ?? 0) > 100 || (giro?.Length ?? 0) > 100 || (paginaweb?.Length ?? 0) > 100)
            {
                errores.Add("empresa: nombre, giro y página web admiten máximo 100 caracteres.");
            }
            else if (empresaActual != null)
            {
                if (nombreEmpresa != null) empresaActual.nombre = nombreEmpresa;
                empresaActual.giro = giro;
                empresaActual.paginaweb = paginaweb;
            }
            else if (rutEmpresa.Length > 0 || nombreEmpresa != null)
            {
                if (rutEmpresa.Length == 0 || nombreEmpresa == null)
                {
                    errores.Add("empresa: indica el RUT y el nombre.");
                }
                else if (rutEmpresa.Length > 11)
                {
                    errores.Add("empresa.rut: el RUT no es válido.");
                }
                else if (await _context.empresas.AnyAsync(x => x.rut == rutEmpresa))
                {
                    // No se vincula automáticamente una empresa que ya existe: podría ser de otra persona
                    errores.Add("empresa.rut: ya está registrado.");
                    hayConflicto = true;
                }
                else
                {
                    // Al agregarla a la colección del usuario EF crea la empresa y su vínculo (tener3)
                    u.id_empresas.Add(new empresa
                    {
                        rut = rutEmpresa,
                        nombre = nombreEmpresa,
                        giro = giro,
                        paginaweb = paginaweb
                    });
                }
            }
        }

        if (errores.Count > 0)
            return Falla(hayConflicto ? 409 : 400, "No se pudo guardar el perfil.", errores.ToArray());

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return Falla(400, "No se pudo guardar el perfil.", ex.InnerException?.Message ?? ex.Message);
        }

        var perfil = await ConstruirPerfil(rut);
        return Ok(new { success = true, message = "Perfil actualizado.", data = perfil, errors = (object?)null });
    }

    // PUT: api/perfil/clave
    [HttpPut("clave")]
    public async Task<IActionResult> CambiarClave([FromBody] ClaveUpdateDto dto)
    {
        var rut = RutActual();
        if (string.IsNullOrEmpty(rut))
            return Falla(401, "Usuario no autenticado.");

        if (string.IsNullOrEmpty(dto.claveActual) || string.IsNullOrEmpty(dto.claveNueva))
            return Falla(400, "Ingresa tu contraseña actual y la nueva.");

        // Mismo mínimo que pide el registro. BCrypt solo lee los primeros 72 caracteres.
        if (dto.claveNueva.Length < 8 || dto.claveNueva.Length > 72)
            return Falla(400, "La nueva contraseña debe tener entre 8 y 72 caracteres.");

        var u = await _context.usuarios.FirstOrDefaultAsync(x => x.rut == rut);
        if (u == null)
            return Falla(404, "Usuario no encontrado.");

        bool claveCorrecta;
        try
        {
            claveCorrecta = BCrypt.Net.BCrypt.Verify(dto.claveActual, u.clave);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            claveCorrecta = false;
        }

        // 400 y no 401: el frontend traduce todo 401 a "tu sesión no es válida"
        if (!claveCorrecta)
            return Falla(400, "La contraseña actual no es correcta.");

        if (dto.claveActual == dto.claveNueva)
            return Falla(400, "La nueva contraseña debe ser distinta a la actual.");

        u.clave = BCrypt.Net.BCrypt.HashPassword(dto.claveNueva);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Contraseña actualizada.", data = (object?)null, errors = (object?)null });
    }

    // PUT: api/perfil/vendedor
    // Convierte una cuenta de cliente en vendedor y cambia el tipo de usuario.
    // La empresa es opcional: si se envían el RUT y el nombre se crea; si no se envía nada, solo cambia el tipo
    // y la empresa se puede agregar después desde el perfil. Un vendedor también compra, así que no pierde nada de lo que ya tenía como cliente.
    // Como el rol viaja dentro del token (JWT), se devuelve un token nuevo con el rol "Vendedor";
    // con el token anterior la API seguiría tratando a la persona como cliente hasta volver a entrar.
    [HttpPut("vendedor")]
    public async Task<IActionResult> ConvertirEnVendedor([FromBody] PerfilEmpresaDto? dto)
    {
        dto ??= new PerfilEmpresaDto();
        var rut = RutActual();
        if (string.IsNullOrEmpty(rut))
            return Falla(401, "Usuario no autenticado.");

        var u = await _context.usuarios
            .Include(x => x.id_empresas)
            .FirstOrDefaultAsync(x => x.rut == rut);

        if (u == null)
            return Falla(404, "Usuario no encontrado.");

        var tipo = u.tipousuario.Trim().ToLowerInvariant();
        if (tipo == "vendedor" || tipo == "ambos")
            return Falla(400, "Tu cuenta ya es de vendedor.");
        if (tipo != "cliente")
            return Falla(403, "Solo una cuenta de cliente puede convertirse en vendedor.");

        var rutEmpresa = LimpiarRut(dto.rut);
        var nombreEmpresa = Vacio(dto.nombre);
        var giro = Vacio(dto.giro);
        var paginaweb = Vacio(dto.paginaweb);

        // Si no se escribe nada de la empresa, se omite. Si se escribe algo, deben ir el RUT y el nombre.
        var quiereEmpresa = rutEmpresa.Length > 0 || nombreEmpresa != null;

        var errores = new List<string>();
        if (quiereEmpresa && (rutEmpresa.Length == 0 || nombreEmpresa == null))
            errores.Add("empresa: indica el RUT y el nombre.");
        else if (quiereEmpresa && (rutEmpresa.Length > 11 || !System.Text.RegularExpressions.Regex.IsMatch(rutEmpresa, @"^\d{7,8}-[0-9K]$")))
            errores.Add("empresa.rut: el RUT no es válido.");
        if ((nombreEmpresa?.Length ?? 0) > 100 || (giro?.Length ?? 0) > 100 || (paginaweb?.Length ?? 0) > 100)
            errores.Add("empresa: nombre, giro y página web admiten máximo 100 caracteres.");
        if (errores.Count > 0)
            return Falla(400, "No se pudo convertir la cuenta en vendedor.", errores.ToArray());

        if (quiereEmpresa)
        {
            // No se vincula una empresa que ya existe: podría ser de otra persona
            if (await _context.empresas.AnyAsync(x => x.rut == rutEmpresa))
                return Falla(409, "No se pudo convertir la cuenta en vendedor.", "empresa.rut: ya está registrado.");

            // Al agregarla a la colección del usuario EF crea la empresa y su vínculo (tener3)
            u.id_empresas.Add(new empresa
            {
                rut = rutEmpresa,
                nombre = nombreEmpresa!,
                giro = giro,
                paginaweb = paginaweb
            });
        }
        u.tipousuario = "vendedor";

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return Falla(400, "No se pudo convertir la cuenta en vendedor.", ex.InnerException?.Message ?? ex.Message);
        }

        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
            throw new InvalidOperationException("La clave Jwt:Key no está configurada.");

        // Mismo token que entrega el inicio de sesión para un vendedor
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, u.rut),
            new Claim(ClaimTypes.Name, u.nombre),
            new Claim(ClaimTypes.Role, "Vendedor")
        };
        var credenciales = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credenciales));

        var perfil = await ConstruirPerfil(rut);
        return Ok(new
        {
            success = true,
            message = "Tu cuenta ahora es de vendedor.",
            data = new { token, perfil },
            errors = (object?)null
        });
    }

    // Arma el perfil que recibe el frontend (lecturas sin seguimiento: no modifican nada)
    private async Task<object?> ConstruirPerfil(string rut)
    {
        var u = await _context.usuarios.AsNoTracking()
            .Where(x => x.rut == rut)
            .Select(x => new { x.rut, x.nombre, x.fechanacimiento, x.tipousuario })
            .FirstOrDefaultAsync();

        if (u == null) return null;

        var correo = await _context.correos.AsNoTracking()
            .Where(c => c.id_usuario == rut)
            .OrderBy(c => c.correo1)
            .Select(c => c.correo1)
            .FirstOrDefaultAsync();

        var numerosTelefono = await _context.telefonos.AsNoTracking()
            .Where(t => t.id_usuario == rut)
            .OrderBy(t => t.numero)
            .Select(t => t.numero)
            .ToListAsync();

        var direccion = await _context.usuarios.AsNoTracking()
            .Where(x => x.rut == rut)
            .SelectMany(x => x.id_direccions)
            .OrderBy(d => d.id)
            .Select(d => new
            {
                d.id,
                d.calle,
                d.numero,
                d.pasaje,
                d.descripcion,
                d.sector,
                d.id_comuna,
                comuna = d.id_comunaNavigation.nombre,
                provincia = d.id_comunaNavigation.id_provinciaNavigation.nombre,
                region = d.id_comunaNavigation.id_provinciaNavigation.id_regionNavigation.nombre
            })
            .FirstOrDefaultAsync();

        var empresa = await _context.usuarios.AsNoTracking()
            .Where(x => x.rut == rut)
            .SelectMany(x => x.id_empresas)
            .OrderBy(e => e.rut)
            .Select(e => new { e.rut, e.nombre, e.giro, e.paginaweb })
            .FirstOrDefaultAsync();

        // Dirección del local: viene de la tabla registrar5. Solo se muestra; el perfil no la edita.
        string? direccionLocal = null;
        if (empresa != null)
        {
            var local = await _context.empresas.AsNoTracking()
                .Where(e => e.rut == empresa.rut)
                .SelectMany(e => e.id_direccions)
                .OrderBy(d => d.id)
                .Select(d => new { d.calle, d.numero, comuna = d.id_comunaNavigation.nombre })
                .FirstOrDefaultAsync();

            if (local != null)
                direccionLocal = $"{local.calle} {local.numero}, {local.comuna}";
        }

        return new
        {
            u.rut,
            u.nombre,
            u.fechanacimiento,
            u.tipousuario,
            correo,
            telefonos = numerosTelefono.Select(n => n.ToString()).ToList(),
            direccion,
            empresa = empresa == null
                ? null
                : new { empresa.rut, empresa.nombre, empresa.giro, empresa.paginaweb, direccionlocal = direccionLocal }
        };
    }
}