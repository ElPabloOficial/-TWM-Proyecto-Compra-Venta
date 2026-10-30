using System.Text.Json;

namespace TiendaOnline.API.DTOs;

public class ServicioDto
{
    public int id { get; set; }
    public string nombre { get; set; } = null!;
    public bool restriccionedad { get; set; }
    public TimeOnly duracion { get; set; }
    public JsonElement caracteristicas { get; set; }

    public string? imagen { get; set; }

    public string? rut_vendedor { get; set; }
    public List<int> categorias { get; set; } = new List<int>();
}