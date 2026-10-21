namespace TiendaOnline.API.DTOs;

public class ReseniaCreateDto
{
    public string tipo { get; set; } = null!; // "producto" o "servicio"
    public int id_item { get; set; }
    public int calificacion { get; set; } // Del 1 al 5
    public string? comentario { get; set; }
}