using System.Text.Json;

namespace TiendaOnline.API.DTOs;

public class ProductoCreateDto
{
    public string nombre { get; set; } = null!;
    public bool restriccionedad { get; set; }
    public JsonElement caracteristicas { get; set; } // Recibimos el JSON
    public int id_categoria { get; set; } // El frontend envía a qué categoría pertenece
}