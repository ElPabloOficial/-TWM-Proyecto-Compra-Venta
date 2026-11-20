namespace backend.DTOs;

public class WishlistAddDto
{
    public string tipo { get; set; } = null!; // "producto" o "servicio"
    public int id_item { get; set; }
    public int? id_lista { get; set; } // opcional: si no viene, se guarda en "Mis Favoritos"
}