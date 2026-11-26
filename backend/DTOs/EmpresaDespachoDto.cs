namespace backend.DTOs;

// Datos de una empresa de despacho y sus límites volumétricos.
// El volumen máximo no se envía: se calcula como alto × ancho × fondo.
public class EmpresaDespachoDto
{
    public string? nombre { get; set; }
    public int? alto_max_cm { get; set; }
    public int? ancho_max_cm { get; set; }
    public int? fondo_max_cm { get; set; }
    public int? peso_max_g { get; set; }
}
