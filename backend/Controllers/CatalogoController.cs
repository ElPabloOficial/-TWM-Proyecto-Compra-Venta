using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaOnline.API.Models;

namespace TiendaOnline.API.Controllers;

// Catálogo público: los productos y los servicios juntos, con lo que necesitan el Home y el
// Catálogo (precio final, precio anterior si hay oferta, categorías y ubicación del vendedor).
//
// Dónde está cada dato en la base de datos:
//   - precio de un producto:  JSON Producto.Caracteristicas ("precio"); la descripción también.
//   - precio de un servicio:  tabla Valorar (el precio lo pone cada vendedor).
//   - oferta de un producto:  Oferta.PrecioOferta guarda el DESCUENTO (0.15 = 15 %), no un precio.
//                             Solo cuenta si está activa (Estado) y si hoy está entre
//                             Producto.FechaInicio y Producto.FechaFin.
//   - ubicación:              la comuna de la primera dirección del vendedor.
[ApiController]
[Route("api/[controller]")]
public class CatalogoController : ControllerBase
{
    private readonly AppDbContext _context;

    public CatalogoController(AppDbContext context)
    {
        _context = context;
    }

    private static JsonElement LeerJson(string? texto)
    {
        try
        {
            return JsonDocument.Parse(string.IsNullOrWhiteSpace(texto) ? "{}" : texto).RootElement.Clone();
        }
        catch (JsonException)
        {
            return JsonDocument.Parse("{}").RootElement.Clone();
        }
    }

    private static decimal? Numero(JsonElement json, string campo)
    {
        if (json.ValueKind == JsonValueKind.Object
            && json.TryGetProperty(campo, out var valor)
            && valor.ValueKind == JsonValueKind.Number
            && valor.TryGetDecimal(out var numero))
            return numero;

        return null;
    }

    private static string? Texto(JsonElement json, string campo)
    {
        if (json.ValueKind == JsonValueKind.Object
            && json.TryGetProperty(campo, out var valor)
            && valor.ValueKind == JsonValueKind.String)
            return valor.GetString();

        return null;
    }

    // Si el producto no tiene descripción se arma una corta con lo que sí tiene ("Color Azul · Material Aluminio")
    private static string Descripcion(JsonElement json)
    {
        var descripcion = Texto(json, "descripcion");
        if (!string.IsNullOrWhiteSpace(descripcion)) return descripcion;

        var partes = new List<string>();
        var color = Texto(json, "color");
        var material = Texto(json, "material");
        if (!string.IsNullOrWhiteSpace(color)) partes.Add($"Color {color}");
        if (!string.IsNullOrWhiteSpace(material)) partes.Add($"Material {material}");
        return string.Join(" · ", partes);
    }

    // GET: api/catalogo (Público)
    [HttpGet]
    public async Task<IActionResult> GetCatalogo()
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);

        // ---------- Datos de la base ----------
        var productosDb = await _context.productos
            .AsNoTracking()
            .Select(p => new
            {
                p.id,
                p.nombre,
                p.restriccionedad,
                p.caracteristicas,
                imagen = p.rutaimagen,
                p.fechainicio,
                p.fechafin,
                ofertaActiva = p.id_ofertaNavigation != null && p.id_ofertaNavigation.estado == true,
                descuento = p.id_ofertaNavigation != null ? (decimal?)p.id_ofertaNavigation.preciooferta : null,
                categorias = p.id_categoria.Select(c => new { c.id, c.nombre }).ToList()
            })
            .ToListAsync();

        var serviciosDb = await _context.servicios
            .AsNoTracking()
            .Select(s => new
            {
                s.id,
                s.nombre,
                s.restriccionedad,
                s.caracteristicas,
                imagen = s.rutaimagen,
                categorias = s.id_categoria.Select(c => new { c.id, c.nombre }).ToList()
            })
            .ToListAsync();

        var vendedoresProducto = await _context.ofrecer1s
            .AsNoTracking()
            .Select(o => new { o.id_producto, rut = o.id_usuario, nombre = o.id_usuarioNavigation.nombre })
            .ToListAsync();

        var vendedoresServicio = await _context.ofrecer2s
            .AsNoTracking()
            .Select(o => new { o.id_servicio, rut = o.id_usuario, nombre = o.id_usuarioNavigation.nombre })
            .ToListAsync();

        var preciosServicio = await _context.valorars
            .AsNoTracking()
            .Select(v => new { v.id_servicio, v.id_usuario, v.precio })
            .ToListAsync();

        // Ubicación: comuna de la primera dirección de cada vendedor
        var ruts = vendedoresProducto.Select(v => v.rut)
            .Concat(vendedoresServicio.Select(v => v.rut))
            .Distinct()
            .ToList();

        var direcciones = await _context.usuarios
            .AsNoTracking()
            .Where(u => ruts.Contains(u.rut))
            .SelectMany(u => u.id_direccions, (u, d) => new { u.rut, d.id, comuna = d.id_comunaNavigation.nombre })
            .ToListAsync();

        var ubicacionPorRut = direcciones
            .GroupBy(d => d.rut)
            .ToDictionary(g => g.Key, g => g.OrderBy(d => d.id).First().comuna);

        string? UbicacionDe(string? rut)
        {
            if (rut == null) return null;
            return ubicacionPorRut.TryGetValue(rut, out var comuna) ? comuna : null;
        }

        // ---------- Productos ----------
        var items = new List<object>();

        foreach (var p in productosDb)
        {
            var json = LeerJson(p.caracteristicas);
            var precioBase = Numero(json, "precio");

            var vigente = p.ofertaActiva
                && (p.fechainicio == null || p.fechainicio <= hoy)
                && (p.fechafin == null || hoy <= p.fechafin);

            decimal? descuento = vigente ? p.descuento : null;

            int? precio = null;
            int? precioAnterior = null;
            if (precioBase != null)
            {
                precio = (int)Math.Round(precioBase.Value * (1 - (descuento ?? 0)), MidpointRounding.AwayFromZero);
                if (descuento != null) precioAnterior = (int)Math.Round(precioBase.Value, MidpointRounding.AwayFromZero);
            }

            var vendedor = vendedoresProducto.FirstOrDefault(v => v.id_producto == p.id);

            items.Add(new
            {
                tipo = "producto",
                p.id,
                p.nombre,
                descripcion = Descripcion(json),
                precio,
                precio_anterior = precioAnterior,
                descuento,
                p.imagen,
                p.restriccionedad,
                p.categorias,
                ubicacion = UbicacionDe(vendedor?.rut),
                vendedor = vendedor == null ? null : new { vendedor.rut, vendedor.nombre }
            });
        }

        // ---------- Servicios ----------
        foreach (var s in serviciosDb)
        {
            var json = LeerJson(s.caracteristicas);
            var vendedor = vendedoresServicio.FirstOrDefault(v => v.id_servicio == s.id);

            int? precio = null;
            if (vendedor != null)
                precio = preciosServicio
                    .Where(v => v.id_servicio == s.id && v.id_usuario == vendedor.rut)
                    .Select(v => (int?)v.precio)
                    .FirstOrDefault();

            items.Add(new
            {
                tipo = "servicio",
                s.id,
                s.nombre,
                descripcion = Descripcion(json),
                precio,
                precio_anterior = (int?)null,
                descuento = (decimal?)null,
                s.imagen,
                s.restriccionedad,
                s.categorias,
                ubicacion = UbicacionDe(vendedor?.rut),
                vendedor = vendedor == null ? null : new { vendedor.rut, vendedor.nombre }
            });
        }

        return Ok(new { success = true, message = "Catálogo obtenido.", data = items, errors = (object?)null });
    }
}
