using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaOnline.API.DTOs;
using TiendaOnline.API.Models; // Importante para reconocer 'usuario'

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/usuarios (Público)
    [HttpGet]
    public async Task<IActionResult> GetUsuarios()
    {
        // ✅ CAMBIO: _context.usuarios
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

        return Ok(new { success = true, message = "Usuarios obtenidos.", data = usuarios, errors = (object?)null });
    }

    // GET: api/usuarios/{rut} (Público)
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
            return NotFound(new { success = false, message = "Usuario no encontrado.", data = (object?)null, errors = new[] { "RUT no existe." } });

        return Ok(new { success = true, message = "Usuario encontrado.", data = usuarioDto, errors = (object?)null });
    }

    // POST: api/usuarios (Registro Público)
    [HttpPost]
    public async Task<IActionResult> CreateUsuario([FromBody] UsuarioCreateDto dto)
    {

        if (await _context.usuarios.AnyAsync(u => u.rut == dto.rut))
            return Conflict(new { success = false, message = "El RUT ya está registrado.", data = (object?)null, errors = new[] { "rut: ya existe." } });

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.clave);

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

        return CreatedAtAction(nameof(GetUsuario), new { rut = nuevoUsuario.rut }, new { success = true, message = "Usuario creado.", data = usuarioDto, errors = (object?)null });
    }
}