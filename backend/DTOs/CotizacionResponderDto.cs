namespace backend.DTOs;

// El vendedor responde una cotización poniendo el precio unitario de cada ítem suyo
public class CotizacionResponderDto
{
    public List<PrecioItemCotizacionDto> precios { get; set; } = new List<PrecioItemCotizacionDto>();
}

public class PrecioItemCotizacionDto
{
    public string tipo { get; set; } = null!; // "producto" o "servicio"
    public int id_item { get; set; }
    public int precio { get; set; }
}