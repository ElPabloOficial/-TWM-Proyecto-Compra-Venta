using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Auth;

public class BasicAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly AppDbContext _context;

    public BasicAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        AppDbContext context) : base(options, logger, encoder)
    {
        _context = context;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.ContainsKey("Authorization"))
            return AuthenticateResult.NoResult(); 

        try
        {
            var authHeaderValue = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeaderValue))
                return AuthenticateResult.Fail("Header vacío");

            var authHeader = AuthenticationHeaderValue.Parse(authHeaderValue);
            var credentialBytes = Convert.FromBase64String(authHeader.Parameter ?? string.Empty);
            var credentials = Encoding.UTF8.GetString(credentialBytes).Split(':');
            
            if (credentials.Length != 2)
                return AuthenticateResult.Fail("Formato de credenciales inválido");

            var rut = credentials[0];
            var clave = credentials[1];

            // ✅ AQUÍ ESTÁ EL CAMBIO: usamos _context.usuarios (plural) y el tipo es 'usuario'
            var usuarioEncontrado = await _context.usuarios.FirstOrDefaultAsync(u => u.rut == rut);

            if (usuarioEncontrado == null)
                return AuthenticateResult.Fail("Usuario no encontrado");

            // Verificamos la contraseña con BCrypt
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(clave, usuarioEncontrado.clave);

            if (!isPasswordValid)
                return AuthenticateResult.Fail("Contraseña incorrecta");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuarioEncontrado.rut),
                new Claim(ClaimTypes.Name, usuarioEncontrado.nombre),
                new Claim(ClaimTypes.Role, usuarioEncontrado.tipousuario)
            };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch
        {
            return AuthenticateResult.Fail("Error en el formato de autenticación");
        }
    }
}
