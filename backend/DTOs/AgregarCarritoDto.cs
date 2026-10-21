namespace TiendaOnline.API.DTOs;

public class AgregarCarritoDto
{
    public string tipo { get; set; } = null!; // "producto" o "servicio"
    public int id_item { get; set; }
    public int cantidad { get; set; }
}