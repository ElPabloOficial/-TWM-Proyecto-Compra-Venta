namespace TiendaOnline.API.DTOs;

// Lo que el frontend manda al guardar el perfil (PUT api/perfil).
// Un campo vacío ("" o null) significa "no cambiar": nunca borra datos que ya existen.
public class PerfilUpdateDto
{
    public string? nombre { get; set; }
    public DateOnly? fechanacimiento { get; set; }
    public string? correo { get; set; }
    // Lista completa de teléfonos del usuario. Si viene (aunque sea vacía) reemplaza a la actual:
    // los que ya no están se quitan y los nuevos se agregan. Si es null, no se toca nada.
    public List<string>? telefonos { get; set; }
    public PerfilDireccionDto? direccion { get; set; }
    public PerfilEmpresaDto? empresa { get; set; }
}

public class PerfilDireccionDto
{
    public string? calle { get; set; }
    public int? numero { get; set; }
    public string? pasaje { get; set; }
    public string? descripcion { get; set; }
    public string? sector { get; set; }
    public int? id_comuna { get; set; }
}

public class PerfilEmpresaDto
{
    public string? rut { get; set; }
    public string? nombre { get; set; }
    public string? giro { get; set; }
    public string? paginaweb { get; set; }
}

// PUT api/perfil/clave
public class ClaveUpdateDto
{
    public string claveActual { get; set; } = string.Empty;
    public string claveNueva { get; set; } = string.Empty;
}
