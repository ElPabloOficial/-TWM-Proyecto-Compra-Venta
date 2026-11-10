namespace backend.api.DTOs;

public class MensajeCreateDto
{
    public int id_venta { get; set; }
    public string contenido { get; set; } = null!;
}