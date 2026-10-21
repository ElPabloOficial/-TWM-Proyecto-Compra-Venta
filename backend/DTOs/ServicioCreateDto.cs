using System.Text.Json;

namespace TiendaOnline.API.DTOs;

public class ServicioCreateDto
{
    public string nombre { get; set; } = null!;
    public bool restriccionedad { get; set; }
    public TimeOnly duracion { get; set; } // TimeOnly
    public JsonElement caracteristicas { get; set; }
    public int id_categoria { get; set; }
}