namespace TiendaOnline.API.DTOs;

public class UsuarioCreateDto
{
    public string rut { get; set; } = null!;
    public string nombre { get; set; } = null!;
    public string clave { get; set; } = null!;
    public DateOnly fechanacimiento { get; set; }
    public string tipousuario { get; set; } = null!;
}