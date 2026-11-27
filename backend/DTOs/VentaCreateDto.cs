using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class VentaCreateDto : IValidatableObject
{
    [Required(ErrorMessage = "El medio de pago es obligatorio.")]
    [RegularExpression("(?i)^(Tarjeta|Transferencia)$", ErrorMessage = "El medio de pago debe ser Tarjeta o Transferencia.")]
    public string mediopago { get; set; } = null!;

    public int? ult4digitostarjeta { get; set; }   // Obligatorio si el pago es con Tarjeta (4 dígitos)
    public int? codigotransferencia { get; set; }  // Obligatorio si el pago es por Transferencia (mayor a 0)
    public bool requieredespacho { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La dirección no es válida.")]
    public int? id_direccion { get; set; }         // Requerido si requieredespacho es true

    [Range(1, int.MaxValue, ErrorMessage = "La empresa de despacho no es válida.")]
    public int? id_empresad { get; set; }          // Empresa de despacho elegida por el comprador (requerida si hay productos que enviar)

    [StringLength(500, ErrorMessage = "La nota admite máximo 500 caracteres.")]
    public string? nota { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La cotización no es válida.")]
    public int? id_cotizacion { get; set; }        // Si viene, se compra con esa cotización aceptada (no con el carrito)

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var medio = mediopago?.Trim().ToLowerInvariant();

        // chk_pago_tarjeta: los últimos 4 dígitos van entre 1000 y 9999
        if (medio == "tarjeta" && (ult4digitostarjeta is null || ult4digitostarjeta < 1000 || ult4digitostarjeta > 9999))
            yield return new ValidationResult(
                "Indica los últimos 4 dígitos de la tarjeta.", new[] { nameof(ult4digitostarjeta) });

        // chk_pago_transferencia: el código debe ser positivo
        if (medio == "transferencia" && (codigotransferencia is null || codigotransferencia <= 0))
            yield return new ValidationResult(
                "Indica el código de la transferencia.", new[] { nameof(codigotransferencia) });

        if (requieredespacho && id_direccion is null)
            yield return new ValidationResult(
                "Selecciona una dirección para el despacho.", new[] { nameof(id_direccion) });
    }
}
