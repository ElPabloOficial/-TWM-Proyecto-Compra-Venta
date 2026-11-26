namespace backend.DTOs;

public class VentaCreateDto
{
    public string mediopago { get; set; } = null!; // "Tarjeta", "Transferencia", "Efectivo"
    public int? ult4digitostarjeta { get; set; }
    public int? codigotransferencia { get; set; }
    public bool requieredespacho { get; set; }
    public int? id_direccion { get; set; } // Requerido si requieredespacho es true
    public int? id_empresad { get; set; } // Empresa de despacho elegida por el comprador (requerida si hay productos que enviar)
    public string? nota { get; set; }
    public int? id_cotizacion { get; set; } // Si viene, se compra con esa cotización aceptada (no con el carrito)
}