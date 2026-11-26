using System.Text.Json;

namespace backend.Controllers;

/// <summary>
/// La visibilidad de un producto vive en su JSON de características ("visibilidad": "Activo" u "Oculto").
/// Los triggers de la BD lo marcan "Oculto" cuando el producto se queda sin stock o lleva más de 40 días sin ventas.
/// </summary>
public static class VisibilidadProducto
{
    /// <summary>
    /// true solo si el JSON trae "visibilidad": "Oculto". Si la clave falta, está vacía o el JSON no se puede leer,
    /// el producto se considera visible.
    /// </summary>
    public static bool EstaOculto(string? caracteristicasJson)
    {
        if (string.IsNullOrWhiteSpace(caracteristicasJson)) return false;

        try
        {
            using var doc = JsonDocument.Parse(caracteristicasJson);
            return doc.RootElement.ValueKind == JsonValueKind.Object
                && doc.RootElement.TryGetProperty("visibilidad", out var visibilidad)
                && visibilidad.ValueKind == JsonValueKind.String
                && string.Equals(visibilidad.GetString()?.Trim(), "Oculto", StringComparison.OrdinalIgnoreCase);
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
