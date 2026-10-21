namespace TiendaOnline.API.DTOs;

public class InventarioCreateDto
{
    public int stockminimo { get; set; }
    public int stockmaximo { get; set; }
}

public class AlmacenarCreateDto
{
    public int id_inventario { get; set; }
    public int id_producto { get; set; }
    public int stockactual { get; set; }
}