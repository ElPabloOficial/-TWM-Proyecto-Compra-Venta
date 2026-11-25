using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace backend.Controllers;

/// <summary>
/// Utilidades compartidas por los controladores.
/// </summary>
public static class ControllerExtensions
{
    /// <summary>
    /// Respuesta estándar para un error no controlado dentro de un endpoint (bloque catch).
    /// Registra la excepción completa en el log del servidor y responde 500 con el mismo formato
    /// { success, message, data, errors } del resto de la API, sin exponer detalles internos al cliente.
    /// </summary>
    public static ObjectResult ErrorInterno(this ControllerBase controlador, Exception ex)
    {
        var accion = controlador.ControllerContext.ActionDescriptor?.ActionName ?? "(desconocida)";

        var logger = controlador.HttpContext.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(controlador.GetType());
        logger.LogError(ex, "Error no controlado en {Controlador}.{Accion}", controlador.GetType().Name, accion);

        return controlador.StatusCode(StatusCodes.Status500InternalServerError, new
        {
            success = false,
            message = "Ocurrió un error interno en el servidor. Inténtalo nuevamente.",
            data = (object?)null,
            errors = (object?)null
        });
    }
}
