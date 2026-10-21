namespace TiendaOnline.API.DTOs;

public class PreguntaCreateDto
{
    public string tipo { get; set; } = null!; // "producto" o "servicio"
    public int id_item { get; set; }
    public string pregunta { get; set; } = null!;
}