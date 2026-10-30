using System.ComponentModel.DataAnnotations;

namespace TiendaOnline.API.DTOs;

public class PedidoEstadoDto
{
    // pendiente | preparacion | enviado | entregado | cancelado
    [Required(ErrorMessage = "El estado es obligatorio.")]
    public string estado { get; set; } = null!;

    // Código de seguimiento del envío (obligatorio para pasar a "enviado")
    [StringLength(50, ErrorMessage = "El código de seguimiento no puede superar los 50 caracteres.")]
    public string? seguimiento { get; set; }
}
