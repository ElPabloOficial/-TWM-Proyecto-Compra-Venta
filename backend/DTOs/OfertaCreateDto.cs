namespace TiendaOnline.API.DTOs;

public class OfertaCreateDto
{
    public decimal preciooferta { get; set; } // Ej: 0.15 para 15% de descuento
    public bool estado { get; set; } = true;
    public int? id_producto { get; set; } // Opcional: aplicar a un producto
    public int? id_servicio { get; set; } // Opcional: aplicar a un servicio
    public DateOnly? fechainicio { get; set; }
    public DateOnly? fechafin { get; set; }
}