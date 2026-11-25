using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using backend.Models;

namespace backend.Controllers;

// Reporte de ventas del vendedor (pantalla "Reportes de Ventas" de su gestión).
// Comparte el prefijo api/reportes con ReportesController (el dashboard del administrador), que tiene otros endpoints.
[ApiController]
[Route("api/reportes")]
[Authorize]
public class ReportesVentasController : ControllerBase
{
    private const int DiasPorDefecto = 30;
    private const int MaxDias = 366;

    // Solo cuentan las ventas cobradas; las "Pendiente", "Anulado" o "Cancelado" no son ingresos
    private static readonly string[] EstadosQueCuentan = { "Pagado", "Entregado" };

    private readonly AppDbContext _context;

    public ReportesVentasController(AppDbContext context)
    {
        _context = context;
    }

    private sealed record Fila(string Tipo, int IdVenta, DateTime Fecha, string Nombre, string? Categoria, int Cantidad, int Total);

    // GET: api/reportes/ventas?desde=2026-10-23&hasta=2026-11-21
    // Una fila por cada producto o servicio vendido por el usuario (como vendedor) en el período. Las pantallas
    // agrupan por día, producto y categoría. "total" es el neto de la línea (sin IVA), tal como queda en Generar3 y Generar4.
    [HttpGet("ventas")]
    public async Task<IActionResult> GetVentasDelVendedor([FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut))
                return Unauthorized(new { success = false, message = "Usuario no autenticado." });

            var hastaFecha = hasta ?? DateOnly.FromDateTime(DateTime.Today);
            var desdeFecha = desde ?? hastaFecha.AddDays(-(DiasPorDefecto - 1));

            if (desdeFecha > hastaFecha)
                return BadRequest(new { success = false, message = "La fecha de inicio no puede ser posterior a la de término." });
            if (hastaFecha.DayNumber - desdeFecha.DayNumber >= MaxDias)
                return BadRequest(new { success = false, message = $"El período no puede superar {MaxDias} días." });

            var inicio = desdeFecha.ToDateTime(TimeOnly.MinValue);
            var finExclusivo = hastaFecha.AddDays(1).ToDateTime(TimeOnly.MinValue);

            var productos = await _context.generar3s
                .AsNoTracking()
                .Where(g => g.id_ventaNavigation.id_vendedor == rut
                         && EstadosQueCuentan.Contains(g.id_ventaNavigation.estado)
                         && g.id_ventaNavigation.fecha >= inicio
                         && g.id_ventaNavigation.fecha < finExclusivo)
                .Select(g => new
                {
                    g.id_venta,
                    fecha = g.id_ventaNavigation.fecha!.Value,
                    nombre = g.id_productoNavigation.nombre,
                    categoria = g.id_productoNavigation.id_categoria.OrderBy(c => c.id).Select(c => c.nombre).FirstOrDefault(),
                    g.cantidad,
                    g.totalfinal
                })
                .ToListAsync();

            var servicios = await _context.generar4s
                .AsNoTracking()
                .Where(g => g.id_ventaNavigation.id_vendedor == rut
                         && EstadosQueCuentan.Contains(g.id_ventaNavigation.estado)
                         && g.id_ventaNavigation.fecha >= inicio
                         && g.id_ventaNavigation.fecha < finExclusivo)
                .Select(g => new
                {
                    g.id_venta,
                    fecha = g.id_ventaNavigation.fecha!.Value,
                    nombre = g.id_servicioNavigation.nombre,
                    categoria = g.id_servicioNavigation.id_categoria.OrderBy(c => c.id).Select(c => c.nombre).FirstOrDefault(),
                    g.cantidad,
                    g.totalfinal
                })
                .ToListAsync();

            var filas = productos
                .Select(p => new Fila("producto", p.id_venta, p.fecha, p.nombre, p.categoria, p.cantidad, p.totalfinal))
                .Concat(servicios.Select(s => new Fila("servicio", s.id_venta, s.fecha, s.nombre, s.categoria, s.cantidad, s.totalfinal)))
                .OrderByDescending(f => f.Fecha)
                .ThenByDescending(f => f.IdVenta)
                .ToList();

            var data = filas.Select(f => new
            {
                idVenta = f.IdVenta,
                fecha = f.Fecha.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                tipo = f.Tipo,
                producto = f.Nombre,
                categoria = string.IsNullOrWhiteSpace(f.Categoria) ? "Sin categoría" : f.Categoria,
                cantidad = f.Cantidad,
                precio = (int)Math.Round((double)f.Total / f.Cantidad),
                total = f.Total
            }).ToList();

            return Ok(new { success = true, message = "Ventas del período.", data, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}