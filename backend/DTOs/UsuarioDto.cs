namespace TiendaOnline.API.DTOs;

public class UsuarioDto
{
    public string rut { get; set; } = null!;
    public string nombre { get; set; } = null!;
    public DateOnly fechanacimiento { get; set; }
    public string tipousuario { get; set; } = null!;
    public string? descuentos { get; set; } 
}