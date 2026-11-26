namespace backend.DTOs;

// Datos de una empresa de despacho y sus límites volumétricos.
// El volumen máximo no se envía: se calcula como alto × ancho × fondo.
// La tarifa (divisor volumétrico, precio por kg, precio mínimo y plazo) también se guarda en el JSON de la empresa.
public class EmpresaDespachoDto
{
    public string? nombre { get; set; }
    public int? alto_max_cm { get; set; }
    public int? ancho_max_cm { get; set; }
    public int? fondo_max_cm { get; set; }
    public int? peso_max_g { get; set; }
    public int? divisor_volumetrico { get; set; } // cm³ por kg volumétrico (5000 es lo habitual)
    public int? tarifa_por_kg { get; set; }       // pesos por kg cobrado
    public int? tarifa_minima { get; set; }       // pesos, precio mínimo de un envío
    public int? dias_entrega { get; set; }        // plazo estimado en días
}
