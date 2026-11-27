using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "El RUT es obligatorio.")]
    [StringLength(11, MinimumLength = 3, ErrorMessage = "El RUT no es válido.")]
    public string rut { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MaxLength(100, ErrorMessage = "La contraseña es demasiado larga.")]
    public string clave { get; set; } = string.Empty;
}
