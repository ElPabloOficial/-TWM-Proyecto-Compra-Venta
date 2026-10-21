namespace TiendaOnline.API.DTOs;

public class DireccionDto
{
    public int id { get; set; }
    public int numero { get; set; }
    public string calle { get; set; } = null!;
    public string? descripcion { get; set; }
    public string? pasaje { get; set; }
    public string? sector { get; set; }
    public int id_comuna { get; set; }
    public string? nombre_comuna { get; set; } // Para mostrar en el frontend
}