using System.Text.Json;

namespace TiendaOnline.API.DTOs;

public class ProductoDto
{
    public int id { get; set; }
    public string nombre { get; set; } = null!;
    public bool restriccionedad { get; set; }
    public JsonElement caracteristicas { get; set; } // El JSON anidado
    public string? rut_vendedor { get; set; }
    public List<int> categorias { get; set; } = new List<int>();
}