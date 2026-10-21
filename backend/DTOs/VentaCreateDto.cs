namespace TiendaOnline.API.DTOs;

public class VentaCreateDto
{
    public string mediopago { get; set; } = null!; // "Tarjeta", "Transferencia", "Efectivo"
    public int? ult4digitostarjeta { get; set; }
    public int? codigotransferencia { get; set; }
    public bool requieredespacho { get; set; }
    public int? id_direccion { get; set; } // Requerido si requieredespacho es true
    public string? nota { get; set; }
}