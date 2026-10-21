namespace TiendaOnline.API.DTOs;

public class RespuestaCreateDto
{
    public int id_pregunta { get; set; }
    public string respuesta { get; set; } = null!;
}