using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace TiendaOnline.API.DTOs;

public class ProductoCreateDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres.")]
    public string nombre { get; set; } = null!;
    public bool restriccionedad { get; set; }
    public JsonElement caracteristicas { get; set; }

    public string? imagen { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La categoría es obligatoria.")]
    public int id_categoria { get; set; }
}