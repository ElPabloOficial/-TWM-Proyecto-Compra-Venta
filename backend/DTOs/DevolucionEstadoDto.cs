namespace TiendaOnline.API.DTOs;

public class DevolucionEstadoDto
{
    public string estado { get; set; } = null!; // "Aprobada", "Rechazada", "En Proceso"
    public int? montoreintegrado { get; set; }
}