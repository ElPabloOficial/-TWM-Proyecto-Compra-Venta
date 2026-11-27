using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

// Registro público de usuarios (POST api/usuarios).
// Solo se puede crear una cuenta de cliente, vendedor o ambos: la cuenta de administrador
// la crea únicamente otro administrador (POST api/admin/usuarios).
public class UsuarioCreateDto : IValidatableObject
{
    public static readonly string[] TiposPermitidos = { "cliente", "vendedor", "ambos" };

    [Required(ErrorMessage = "El RUT es obligatorio.")]
    [RegularExpression(@"^\d{7,8}-[\dkK]$", ErrorMessage = "El RUT debe tener el formato 12345678-9 (sin puntos y con guion).")]
    public string rut { get; set; } = null!;

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres.")]
    [RegularExpression(@"^\p{L}[\p{L}\s'-]*$", ErrorMessage = "El nombre solo puede contener letras, espacios, apóstrofes y guiones.")]
    public string nombre { get; set; } = null!;

    // BCrypt solo considera los primeros 72 bytes de la contraseña
    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(72, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 72 caracteres.")]
    public string clave { get; set; } = null!;

    public DateOnly fechanacimiento { get; set; }

    [Required(ErrorMessage = "El tipo de usuario es obligatorio.")]
    public string tipousuario { get; set; } = null!;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // La base de datos exige fecha de nacimiento desde 1940 (chk_usuario_fecha_nac)
        if (fechanacimiento < new DateOnly(1940, 1, 1) || fechanacimiento > DateOnly.FromDateTime(DateTime.Today))
            yield return new ValidationResult(
                "La fecha de nacimiento debe estar entre 1940 y hoy.", new[] { nameof(fechanacimiento) });

        if (!string.IsNullOrWhiteSpace(tipousuario)
            && !TiposPermitidos.Contains(tipousuario.Trim().ToLowerInvariant()))
            yield return new ValidationResult(
                "El tipo de usuario debe ser cliente, vendedor o ambos.", new[] { nameof(tipousuario) });
    }
}
