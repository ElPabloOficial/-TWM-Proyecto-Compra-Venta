namespace TiendaOnline.API.DTOs;

public class WishlistAddDto
{
    public string tipo { get; set; } = null!; // "producto" o "servicio"
    public int id_item { get; set; }
}