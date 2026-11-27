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
            var hoyFecha = DateOnly.FromDateTime(hoy);

            // 1. Ingresos del mes y variación respecto al mes anterior -> f_consolidacion_8
            var variacion = (await _f.VariacionIngresos(hoyFecha, ct)).FirstOrDefault();
            var ingresosMes = variacion?.IngresoMesActual ?? 0;
            var ingresosMesAnterior = variacion?.IngresoMesAnterior ?? 0;
            var variacionPorcentual = variacion?.VariacionPorcentual;

            // 2. Ventas completadas (Pagadas o Entregadas)
            var ventasCompletadas = await _context.venta
                .CountAsync(v => v.estado == "Pagado" || v.estado == "Entregado", ct);

            // 3. Calificación promedio general
            var calificacionPromedio = await _context.calificacions
                .AverageAsync(c => (double?)c.calificacion1, ct) ?? 0;

            // 4. Tiempo promedio de entrega en días -> f_georreferenciacion_4 (promedio por empresa de transporte)
            var promediosEmpresa = await _f.PromedioDiasPorEmpresa(ct);
            var tiempoEntregaPromedio = promediosEmpresa.Count > 0
                ? (double)promediosEmpresa.Average(e => e.PromedioDias ?? 0)
                : 0;

            // 5. Utilidad operativa proyectada (5% comisión) -> f_logicas_6
            var utilidadProyectada = (await _f.UtilidadProyectada(0.05m, ct)).FirstOrDefault()?.UtilidadProyectada ?? 0;

            // 6. Promedio diario de nuevos clientes en los últimos 30 días -> f_logicas_8
            var promedioNuevosClientes = (await _f.PromedioNuevosClientes(hoyFecha.AddDays(-29), hoyFecha, ct))
                .FirstOrDefault()?.PromedioDiarioNuevosClientes ?? 0;

            // 7. Capital total reintegrado por devoluciones en el año -> f_inventario_3
            var capitalReintegrado = await _f.CapitalReintegrado(hoy.Year, ct) ?? 0;

            return Ok(new { 
                success = true, 
                message = "Resumen del dashboard.", 
                data = new {
                    ingresos_mes = ingresosMes,
                    ingresos_mes_anterior = ingresosMesAnterior,
                    variacion_ingresos = variacionPorcentual,
                    ventas_completadas = ventasCompletadas,
                    calificacion_promedio = Math.Round(calificacionPromedio, 1),
                    tiempo_entrega_promedio = Math.Round(tiempoEntregaPromedio, 1),
                    dias_por_empresa = promediosEmpresa.Select(e => new
                    {
                        empresa = e.EmpresaTransporte ?? "",
                        promedio_dias = e.PromedioDias ?? 0
                    }).ToList(),
                    utilidad_proyectada = utilidadProyectada,
                    promedio_nuevos_clientes = promedioNuevosClientes,
                    capital_reintegrado_anio = capitalReintegrado
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

            // Emprendedores con calificación < 3 -> f_fidelizacion_5
            var vendedoresBajos = await _f.VendedoresBajaCalificacion(ct);

            // Mensajes sin respuesta > 48h -> f_fidelizacion_10
            var mensajesSinResponder48h = (await _f.MensajesSinResponder48h(ct)).Count;

            // Vendedores de servicios sin calificaciones en últimos 6 meses -> f_fidelizacion_6
            var vendedoresServiciosSinResenas = (await _f.VendedoresServiciosSinCalificaciones(ct)).Count;

            return Ok(new { 
                success = true, 
                message = "Alertas del sistema.", 
                data = new {
                    preguntas_sin_responder = preguntasSinResponder,
                    mensajes_sin_responder_48h = mensajesSinResponder48h,
                    resenas_nuevas_semana = resenasNuevas,
                    tasa_devoluciones = Math.Round(tasaDevoluciones, 1),
                    emprendedores_baja_calificacion = vendedoresBajos.Count,
                    vendedores_baja_calificacion = vendedoresBajos.Select(v => new { rut = v.Rut ?? "", nombre = v.Nombre ?? "" }).ToList(),
                    vendedores_servicios_sin_resenas = vendedoresServiciosSinResenas
                }, 
                errors = (object?)null 
            });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/reportes/analitica (Indicadores adicionales calculados con las funciones PostgreSQL)
    [HttpGet("analitica")]
    public async Task<IActionResult> GetAnalitica(CancellationToken ct = default)
    {
        try
        {
            var hoyFecha = DateOnly.FromDateTime(DateTime.Today);

            var finDeSemanaVsHabiles = await _f.VentasFinDeSemanaVsHabiles(new DateOnly(2000, 1, 1), hoyFecha, ct);
            var volumenPorRegion = await _f.VolumenPorRegion(0m, ct);
            var gruposEtarios = await _f.GruposEtarios(10, null, null, ct);
            var topLtv = (await _f.LtvClientes(1, ct)).Take(5).ToList();
            var compradosJuntos = (await _f.ProductosCompradosJuntos(1, ct)).Take(5).ToList();

            return Ok(new
            {
                success = true,
                message = "Analítica de funciones obtenida.",
                data = new
                {
                    fin_de_semana_vs_habiles = finDeSemanaVsHabiles.Select(x => new
                    {
                        tipo_dia = x.TipoDia ?? "",
                        total_ventas = x.TotalVentas ?? 0,
                        total_vendido = x.TotalVendido ?? 0
                    }).ToList(),
                    volumen_por_region = volumenPorRegion.Select(x => new
                    {
                        region = x.Region ?? "",
                        volumen = x.Volumen ?? 0
                    }).ToList(),
                    grupos_etarios = gruposEtarios.Select(x => new
                    {
                        grupo_etario = x.GrupoEtario ?? 0,
                        cantidad_clientes = x.CantidadClientes ?? 0
                    }).ToList(),
                    top_ltv_clientes = topLtv.Select(x => new
                    {
                        rut_cliente = x.RutCliente ?? "",
                        nombre_cliente = x.NombreCliente ?? "",
                        total_transacciones = x.TotalTransacciones ?? 0,
                        ltv = x.Ltv ?? 0,
                        ticket_promedio = x.TicketPromedio ?? 0
                    }).ToList(),
                    productos_comprados_juntos = compradosJuntos.Select(x => new
                    {
                        producto_a = x.ProductoA ?? "",
                        producto_b = x.ProductoB ?? "",
                        veces_comprados_juntos = x.VecesCompradosJuntos ?? 0
                    }).ToList()
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