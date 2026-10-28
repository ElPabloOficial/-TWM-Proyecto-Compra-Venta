using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public UsuariosController(
        AppDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // GET: api/usuarios
    [HttpGet]
    public async Task<IActionResult> GetUsuarios()
    {
        var usuarios = await _context.usuarios
            .Select(u => new UsuarioDto
            {
                rut = u.rut,
                nombre = u.nombre,
                fechanacimiento = u.fechanacimiento,
                tipousuario = u.tipousuario,
                descuentos = u.descuentos
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            message = "Usuarios obtenidos.",
            data = usuarios,
            errors = (object?)null
        });
    }

    // GET: api/usuarios/{rut}
    [HttpGet("{rut}")]
    public async Task<IActionResult> GetUsuario(string rut)
    {
        var usuarioDto = await _context.usuarios
            .Where(u => u.rut == rut)
            .Select(u => new UsuarioDto
            {
                rut = u.rut,
                nombre = u.nombre,
                fechanacimiento = u.fechanacimiento,
                tipousuario = u.tipousuario,
                descuentos = u.descuentos
            })
            .FirstOrDefaultAsync();

        if (usuarioDto == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Usuario no encontrado.",
                data = (object?)null,
                errors = new[] { "RUT no existe." }
            });
        }

        return Ok(new
        {
            success = true,
            message = "Usuario encontrado.",
            data = usuarioDto,
            errors = (object?)null
        });
    }

    // POST: api/usuarios
    [HttpPost]
    public async Task<IActionResult> CreateUsuario(
        [FromBody] UsuarioCreateDto dto)
    {
        if (await _context.usuarios
            .AnyAsync(u => u.rut == dto.rut))
        {
            return Conflict(new
            {
                success = false,
                message = "El RUT ya está registrado.",
                data = (object?)null,
                errors = new[] { "rut: ya existe." }
            });
        }

        string hashedPassword =
            BCrypt.Net.BCrypt.HashPassword(dto.clave);

        var nuevoUsuario = new usuario
        {
            rut = dto.rut,
            nombre = dto.nombre,
            clave = hashedPassword,
            fechanacimiento = dto.fechanacimiento,
            fechacreacion = DateOnly.FromDateTime(DateTime.Now),
            tipousuario = dto.tipousuario,
            descuentos = "{}",
            secioniniciada = false
        };

        _context.usuarios.Add(nuevoUsuario);

        await _context.SaveChangesAsync();

        var usuarioDto = new UsuarioDto
        {
            rut = nuevoUsuario.rut,
            nombre = nuevoUsuario.nombre,
            fechanacimiento = nuevoUsuario.fechanacimiento,
            tipousuario = nuevoUsuario.tipousuario,
            descuentos = nuevoUsuario.descuentos
        };

        return CreatedAtAction(
            nameof(GetUsuario),
            new { rut = nuevoUsuario.rut },
            new
            {
                success = true,
                message = "Usuario creado.",
                data = usuarioDto,
                errors = (object?)null
            }
        );
    }

    // POST: api/usuarios/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto dto)
    {
        // 1. Buscar usuario
        var usuario = await _context.usuarios
            .FirstOrDefaultAsync(u => u.rut == dto.rut);

        if (usuario == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "RUT o contraseña incorrectos.",
                data = (object?)null,
                errors = (object?)null
            });
        }

        // 2. Verificar contraseña
        bool contraseñaCorrecta =
            BCrypt.Net.BCrypt.Verify(
                dto.clave,
                usuario.clave
            );

        if (!contraseñaCorrecta)
        {
            return Unauthorized(new
            {
                success = false,
                message = "RUT o contraseña incorrectos.",
                data = (object?)null,
                errors = (object?)null
            });
        }

        // 3. Marcar sesión iniciada
        usuario.secioniniciada = true;

        await _context.SaveChangesAsync();

        // 4. Obtener clave JWT
        var jwtKey = _configuration["Jwt:Key"];

        if (string.IsNullOrEmpty(jwtKey))
        {
            throw new InvalidOperationException(
                "La clave Jwt:Key no está configurada."
            );
        }

        // 5. Crear claims
        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                usuario.rut
            ),

            new Claim(
                ClaimTypes.Name,
                usuario.nombre
            ),

            new Claim(
                ClaimTypes.Role,
                usuario.tipousuario
            )
        };

        // 6. Crear clave de firma
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        // 7. Crear JWT
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        // 8. Convertir JWT a texto
        var tokenString =
            new JwtSecurityTokenHandler()
                .WriteToken(token);

        // 9. Crear DTO del usuario
        var usuarioDto = new UsuarioDto
        {
            rut = usuario.rut,
            nombre = usuario.nombre,
            fechanacimiento = usuario.fechanacimiento,
            tipousuario = usuario.tipousuario,
            descuentos = usuario.descuentos
        };

        // 10. Devolver JWT + usuario
        return Ok(new
        {
            success = true,
            message = "Inicio de sesión exitoso.",

            data = new
            {
                token = tokenString,
                usuario = usuarioDto
            },

            errors = (object?)null
        });
    }
}