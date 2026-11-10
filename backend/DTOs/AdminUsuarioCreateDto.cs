namespace backend.DTOs;

// Datos para que un administrador cree un usuario (POST api/admin/usuarios)
public class AdminUsuarioCreateDto
{
    public string rut { get; set; } = null!;
    public string nombre { get; set; } = null!;
    public string correo { get; set; } = null!;
    public string clave { get; set; } = null!;
    public DateOnly fechanacimiento { get; set; }
    public string tipousuario { get; set; } = null!;
}
