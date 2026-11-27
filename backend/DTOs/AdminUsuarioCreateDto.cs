using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

// Datos para que un administrador cree un usuario (POST api/admin/usuarios)
public class AdminUsuarioCreateDto
{
    [Required(ErrorMessage = "El RUT es obligatorio.")]
    [StringLength(11, MinimumLength = 3, ErrorMessage = "El RUT no es válido.")]
    public string rut { get; set; } = null!;

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres.")]
    public string nombre { get; set; } = null!;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no es válido.")]
    [StringLength(100, ErrorMessage = "El correo admite máximo 100 caracteres.")]
    public string correo { get; set; } = null!;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(72, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 72 caracteres.")]
    public string clave { get; set; } = null!;

    public DateOnly fechanacimiento { get; set; }

    [Required(ErrorMessage = "El tipo de usuario es obligatorio.")]
    [StringLength(20, ErrorMessage = "El tipo de usuario no es válido.")]
    public string tipousuario { get; set; } = null!;
}
