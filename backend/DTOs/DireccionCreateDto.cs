using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

// Los largos coinciden con las columnas de la tabla Direccion (VARCHAR(100))
public class DireccionCreateDto
{
    [Range(1, int.MaxValue, ErrorMessage = "El número debe ser mayor a 0.")]
    public int numero { get; set; }

    [Required(ErrorMessage = "La calle es obligatoria.")]
    [StringLength(100, ErrorMessage = "La calle admite máximo 100 caracteres.")]
    public string calle { get; set; } = null!;

    [StringLength(100, ErrorMessage = "La descripción admite máximo 100 caracteres.")]
    public string? descripcion { get; set; }

    [StringLength(100, ErrorMessage = "El pasaje admite máximo 100 caracteres.")]
    public string? pasaje { get; set; }

    [StringLength(100, ErrorMessage = "El sector admite máximo 100 caracteres.")]
    public string? sector { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La comuna es obligatoria.")]
    public int id_comuna { get; set; }
}
