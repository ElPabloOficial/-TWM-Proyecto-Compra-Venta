namespace backend.DTOs;

// Para crear o editar una lista de deseos
public class WishlistListaDto
{
    public string nombre { get; set; } = null!;
    public string? descripcion { get; set; }
    public bool publica { get; set; }

    // Solo al crear: la lista se crea con su primer ítem (tipo "producto" o "servicio" + id_item)
    public string? tipo { get; set; }
    public int? id_item { get; set; }
}