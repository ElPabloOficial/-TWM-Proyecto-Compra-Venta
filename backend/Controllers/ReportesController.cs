using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // En un caso real, aquí validarías que el usuario sea Admin
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/reportes/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var hoy = DateTime.Now;
        var inicioMes = new DateTime(hoy.Year, hoy.Month, 1);
        var inicioSemana = hoy.AddDays(-7);

        // 1. Ingresos del mes (Neto + IVA)
        var ingresosMes = await _context.venta
            .Where(v => v.fecha >= inicioMes && v.estado != "Anulado")
            .SumAsync(v => v.neto + (v.neto * v.iva));

        // 2. Ventas completadas (Pagadas o Entregadas)
        var ventasCompletadas = await _context.venta
            .CountAsync(v => v.estado == "Pagado" || v.estado == "Entregado");

        // 3. Calificación promedio general
        var calificacionPromedio = await _context.calificacions
            .AverageAsync(c => (double?)c.calificacion1) ?? 0;

        // 4. Tiempo promedio de entrega (Usando la consulta SQL de tu archivo)
        var tiempoEntregaSql = @"
            SELECT COALESCE(AVG(EXTRACT(DAY FROM((d.datoslogisticos->>'fecha_llegada_real')::TIMESTAMP - (d.datoslogisticos->>'fecha_salida')::TIMESTAMP))), 0)
            FROM despacho d
            WHERE d.datoslogisticos->>'fecha_salida' <> ''
            AND d.datoslogisticos->>'fecha_llegada_real' <> ''";
        
        var tiempoEntregaPromedio = await _context.Database
            .SqlQueryRaw<double>(tiempoEntregaSql)
            .FirstOrDefaultAsync();

        return Ok(new { 
            success = true, 
            message = "Resumen del dashboard.", 
            data = new {
                ingresos_mes = ingresosMes,
                ventas_completadas = ventasCompletadas,
                calificacion_promedio = Math.Round(calificacionPromedio, 1),
                tiempo_entrega_promedio = Math.Round(tiempoEntregaPromedio, 1)
            }, 
            errors = (object?)null 
        });
    }

    // GET: api/reportes/ingresos-mensuales (Para el gráfico de línea)
    [HttpGet("ingresos-mensuales")]
    public async Task<IActionResult> GetIngresosMensuales()
    {
        // Agrupamos las ventas por año y mes
        var ingresos = await _context.venta
            .Where(v => v.fecha != null && v.estado != "Anulado")
            .GroupBy(v => new { Anio = v.fecha!.Value.Year, Mes = v.fecha.Value.Month })
            .Select(g => new
            {
                anio = g.Key.Anio,
                mes = g.Key.Mes,
                total = g.Sum(v => v.neto + (v.neto * v.iva))
            })
            .OrderBy(x => x.anio).ThenBy(x => x.mes)
            .ToListAsync();

        return Ok(new { success = true, message = "Ingresos mensuales.", data = ingresos, errors = (object?)null });
    }

    // GET: api/reportes/envios-por-empresa (Para el gráfico de barras)
    [HttpGet("envios-por-empresa")]
    public async Task<IActionResult> GetEnviosPorEmpresa()
    {
        var envios = await _context.despachar2s
            .Include(d => d.id_empresadNavigation)
            .GroupBy(d => d.id_empresadNavigation.nombre)
            .Select(g => new
            {
                empresa = g.Key,
                cantidad = g.Count()
            })
            .OrderByDescending(x => x.cantidad)
            .ToListAsync();

        return Ok(new { success = true, message = "Envíos por empresa.", data = envios, errors = (object?)null });
    }

    // GET: api/reportes/alertas (Para los cuadros laterales del dashboard)
    [HttpGet("alertas")]
    public async Task<IActionResult> GetAlertas()
    {
        var hace48Horas = DateTime.Now.AddHours(-48);
        var inicioSemana = DateTime.Now.AddDays(-7);

        // Preguntas sin responder > 48h
        var preguntasSinResponder = await _context.preguntas
            .CountAsync(p => p.respuesta == null && p.fechacreacion < hace48Horas);

        // Reseñas nuevas esta semana
        var resenasNuevas = await _context.calificacions
            .CountAsync(c => c.fecha >= inicioSemana);

        // Tasa de devoluciones (Devoluciones / Total Ventas)
        var totalVentas = await _context.venta.CountAsync();
        var totalDevoluciones = await _context.devolucions.CountAsync();
        var tasaDevoluciones = totalVentas > 0 ? (double)totalDevoluciones / totalVentas * 100 : 0;

        // Emprendedores con calificación < 3 (Usando la consulta de tu archivo)
        var emprendedoresBajos = await _context.Database
            .SqlQueryRaw<int>(@"
                SELECT COUNT(DISTINCT u.rut)
                FROM usuario u
                JOIN ofrecer1 o ON u.rut = o.id_usuario
                JOIN escribir1 e ON o.id_producto = e.id_producto
                JOIN calificacion c ON e.id_calificacion = c.id
                GROUP BY u.rut
                HAVING AVG(c.calificacion) < 3
            ")
            .FirstOrDefaultAsync();

        return Ok(new { 
            success = true, 
            message = "Alertas del sistema.", 
            data = new {
                preguntas_sin_responder = preguntasSinResponder,
                resenas_nuevas_semana = resenasNuevas,
                tasa_devoluciones = Math.Round(tasaDevoluciones, 1),
                emprendedores_baja_calificacion = emprendedoresBajos
            }, 
            errors = (object?)null 
        });
    }
}