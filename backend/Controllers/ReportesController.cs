using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // En un caso real, aquí validarías que el usuario sea Admin
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly FuncionesService _f; // funciones PostgreSQL de bd_proyecto/funciones.txt

    public ReportesController(AppDbContext context, FuncionesService funciones)
    {
        _context = context;
        _f = funciones;
    }

    // GET: api/reportes/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct = default)
    {
        try
        {
            var hoy = DateTime.Now;

            // 1. Ingresos del mes (Neto + IVA) -> f_consolidacion_8 (mes de la fecha dada)
            var variacion = (await _f.VariacionIngresos(DateOnly.FromDateTime(hoy), ct)).FirstOrDefault();
            var ingresosMes = variacion?.IngresoMesActual ?? 0;

            // 2. Ventas completadas (Pagadas o Entregadas)
            var ventasCompletadas = await _context.venta
                .CountAsync(v => v.estado == "Pagado" || v.estado == "Entregado");

            // 3. Calificación promedio general
            var calificacionPromedio = await _context.calificacions
                .AverageAsync(c => (double?)c.calificacion1) ?? 0;

            // 4. Tiempo promedio de entrega en días -> f_georreferenciacion_4 (promedio por empresa de
            //    transporte). Se promedian los promedios de las empresas que tienen despachos con fechas.
            var promediosEmpresa = await _f.PromedioDiasPorEmpresa(ct);
            var tiempoEntregaPromedio = promediosEmpresa.Count > 0
                ? (double)promediosEmpresa.Average(e => e.PromedioDias ?? 0)
                : 0;

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
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/reportes/ingresos-mensuales (Para el gráfico de línea)
    [HttpGet("ingresos-mensuales")]
    public async Task<IActionResult> GetIngresosMensuales()
    {
        try
        {
            // Agrupamos las ventas por año y mes
            // Se traen neto, IVA y fecha y se agrupa en memoria (ver nota en GetDashboard sobre numeric(3,2))
            var filas = await _context.venta
                .AsNoTracking()
                .Where(v => v.fecha != null && v.estado != "Anulado")
                .Select(v => new { fecha = v.fecha!.Value, v.neto, v.iva })
                .ToListAsync();

            var ingresos = filas
                .GroupBy(v => new { Anio = v.fecha.Year, Mes = v.fecha.Month })
                .Select(g => new
                {
                    anio = g.Key.Anio,
                    mes = g.Key.Mes,
                    total = g.Sum(v => v.neto + (v.neto * v.iva))
                })
                .OrderBy(x => x.anio).ThenBy(x => x.mes)
                .ToList();

            return Ok(new { success = true, message = "Ingresos mensuales.", data = ingresos, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/reportes/envios-por-empresa (Para el gráfico de barras)
    [HttpGet("envios-por-empresa")]
    public async Task<IActionResult> GetEnviosPorEmpresa()
    {
        try
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
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/reportes/alertas (Para los cuadros laterales del dashboard)
    [HttpGet("alertas")]
    public async Task<IActionResult> GetAlertas(CancellationToken ct = default)
    {
        try
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

            // Emprendedores con calificación < 3 -> f_fidelizacion_5 (vendedores con algún producto
            // o servicio cuya calificación promedio es menor a 3)
            var emprendedoresBajos = (await _f.VendedoresBajaCalificacion(ct)).Count;

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
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}