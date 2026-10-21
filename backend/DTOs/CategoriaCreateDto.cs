namespace TiendaOnline.API.DTOs;

public class CategoriaCreateDto
{
    public string nombre { get; set; } = null!;
    public int? id_categoria_padre { get; set; } // null si es categoría raíz
}