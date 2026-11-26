using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

// Datos que envía el vendedor al pasar un despacho a la etapa siguiente.
// Solo se usan al pasar a "Despachado"; en las demás etapas pueden ir vacíos.
public class AvanzarDespachoDto
{
    // Nombre de la empresa de transporte. Solo hace falta si el pedido no trae una empresa elegida en la compra.
    [StringLength(50, ErrorMessage = "El nombre de la empresa no puede superar los 50 caracteres.")]
    public string? transportista { get; set; }

    [StringLength(50, ErrorMessage = "El número de seguimiento no puede superar los 50 caracteres.")]
    public string? seguimiento { get; set; }

    // Medidas reales del paquete, en centímetros (la base recalcula el costo de envío con ellas)
    [Range(1, 999, ErrorMessage = "El ancho debe estar entre 1 y 999 cm.")]
    public int? ancho { get; set; }

    [Range(1, 999, ErrorMessage = "El alto debe estar entre 1 y 999 cm.")]
    public int? alto { get; set; }

    [Range(1, 999, ErrorMessage = "El fondo debe estar entre 1 y 999 cm.")]
    public int? fondo { get; set; }
}
