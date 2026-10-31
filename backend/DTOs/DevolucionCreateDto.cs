namespace TiendaOnline.API.DTOs;

public class DevolucionCreateDto
{
    public int id_venta { get; set; }
    public int id_producto { get; set; }
    public int cantidad { get; set; }
    public string motivo { get; set; } = null!;
    public string tipodevolucion { get; set; } = null!; // "Reembolso" o "Cambio"
    public IFormFile? imagen { get; set; }
}