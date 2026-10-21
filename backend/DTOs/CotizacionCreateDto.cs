namespace TiendaOnline.API.DTOs;

public class CotizacionCreateDto
{
    public List<ItemCotizacionDto> items { get; set; } = new List<ItemCotizacionDto>();
}

public class ItemCotizacionDto
{
    public string tipo { get; set; } = null!; // "producto" o "servicio"
    public int id_item { get; set; }
    public int precio { get; set; } // Precio propuesto
    public int cantidad { get; set; }
}