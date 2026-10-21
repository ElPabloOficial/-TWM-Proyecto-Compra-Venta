namespace TiendaOnline.API.DTOs;

public class DireccionCreateDto
{
    public int numero { get; set; }
    public string calle { get; set; } = null!;
    public string? descripcion { get; set; }
    public string? pasaje { get; set; }
    public string? sector { get; set; }
    public int id_comuna { get; set; }
}