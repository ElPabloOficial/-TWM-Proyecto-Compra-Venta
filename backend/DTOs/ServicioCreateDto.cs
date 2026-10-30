using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace TiendaOnline.API.DTOs;

public class ServicioCreateDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres.")]
    public string nombre { get; set; } = null!;
    public bool restriccionedad { get; set; }
    public TimeOnly duracion { get; set; } // "HH:mm:ss", p. ej. "01:30:00"
    public JsonElement caracteristicas { get; set; } // codigo, descripcion, modalidad...

    public string? imagen { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La categoría es obligatoria.")]
    public int id_categoria { get; set; }
    // El precio del servicio vive en la tabla Valorar (uno por vendedor), no en "caracteristicas"
    [Range(0, int.MaxValue, ErrorMessage = "El precio debe ser 0 o más.")]
    public int precio { get; set; }
}