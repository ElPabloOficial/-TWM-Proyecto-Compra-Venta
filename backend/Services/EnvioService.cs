using System.Text.Json;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>Paquete estimado de un pedido: una sola caja con el peso y las medidas de todo lo que se envía.</summary>
public record PaqueteEnvio(decimal PesoKg, int AnchoCm, int AltoCm, int FondoCm);

/// <summary>Una empresa de despacho que puede llevar el paquete, con su precio y plazo.</summary>
public record OpcionEnvio(int Id, string Nombre, int Costo, int? DiasEntrega);

/// <summary>
/// Envío de un pedido: arma el paquete a partir de los productos, busca las empresas de despacho que pueden
/// transportarlo (según los límites de EmpresaDespacho.EstandaresVolumetricos) y calcula el precio de cada una
/// con la función de la base fn_costo_envio (bd_proyecto/envio_por_empresa.sql).
/// </summary>
public class EnvioService
{
    // Valores que se usan cuando un producto no tiene el dato en su JSON de características
    private const int PesoDefectoG = 500;
    private const int LadoDefectoCm = 20;
    private const int FondoDefectoCm = 10; // los productos guardan alto_cm y ancho_cm, no el fondo

    private readonly AppDbContext _db;
    private readonly FuncionesService _funciones;

    public EnvioService(AppDbContext db, FuncionesService funciones)
    {
        _db = db;
        _funciones = funciones;
    }

    private static decimal? Numero(JsonElement json, string clave) =>
        json.ValueKind == JsonValueKind.Object
        && json.TryGetProperty(clave, out var v)
        && v.ValueKind == JsonValueKind.Number
        && v.TryGetDecimal(out var n) ? n : null;

    private static JsonElement LeerJson(string? texto)
    {
        try { return JsonDocument.Parse(string.IsNullOrWhiteSpace(texto) ? "{}" : texto).RootElement; }
        catch (JsonException) { return JsonDocument.Parse("{}").RootElement; }
    }

    /// <summary>
    /// Une los productos en un solo paquete: el peso es la suma, y las medidas forman una caja del mismo
    /// volumen total (el lado más largo y el segundo más largo son los de los productos más grandes, y el
    /// fondo crece según la cantidad).
    /// </summary>
    public static PaqueteEnvio ArmarPaquete(IEnumerable<(string? caracteristicas, int cantidad)> productos)
    {
        decimal pesoG = 0;
        long volumen = 0;
        int mayor = 0, medio = 0, menor = 0;

        foreach (var (caracteristicas, cantidad) in productos)
        {
            var json = LeerJson(caracteristicas);
            var peso = Numero(json, "peso") ?? PesoDefectoG;
            var lados = new[]
            {
                (int)Math.Ceiling(Numero(json, "alto_cm") ?? LadoDefectoCm),
                (int)Math.Ceiling(Numero(json, "ancho_cm") ?? LadoDefectoCm),
                (int)Math.Ceiling(Numero(json, "fondo_cm") ?? FondoDefectoCm),
            }.Select(l => Math.Max(l, 1)).OrderByDescending(l => l).ToArray();

            mayor = Math.Max(mayor, lados[0]);
            medio = Math.Max(medio, lados[1]);
            menor = Math.Max(menor, lados[2]);

            pesoG += peso * cantidad;
            volumen += (long)lados[0] * lados[1] * lados[2] * cantidad;
        }

        if (mayor == 0) mayor = medio = menor = 1;
        var fondo = Math.Max(menor, (int)Math.Ceiling(volumen / (double)(mayor * medio)));

        return new PaqueteEnvio(Math.Round(pesoG / 1000m, 3), medio, mayor, fondo);
    }

    // Un paquete cabe si, ordenadas de mayor a menor, cada medida es menor o igual a la de la empresa
    // (así se puede girar la caja) y el peso no pasa el máximo.
    private static bool Cabe(PaqueteEnvio p, JsonElement limites)
    {
        var maximos = new[]
        {
            Numero(limites, "alto_max_cm") ?? 0,
            Numero(limites, "ancho_max_cm") ?? 0,
            Numero(limites, "fondo_max_cm") ?? 0,
        }.OrderByDescending(m => m).ToArray();
        var medidas = new[] { p.AnchoCm, p.AltoCm, p.FondoCm }.OrderByDescending(m => m).ToArray();

        for (var i = 0; i < 3; i++)
            if (medidas[i] > maximos[i]) return false;

        return p.PesoKg * 1000m <= (Numero(limites, "peso_max_g") ?? 0);
    }

    /// <summary>Empresas que pueden llevar el paquete, de la más barata a la más cara.</summary>
    public async Task<List<OpcionEnvio>> OpcionesAsync(PaqueteEnvio paquete, CancellationToken ct = default)
    {
        var empresas = await _db.empresadespachos.AsNoTracking().OrderBy(e => e.nombre)
            .Select(e => new { e.id, e.nombre, e.estandaresvolumetricos })
            .ToListAsync(ct);

        var opciones = new List<OpcionEnvio>();
        foreach (var e in empresas)
        {
            var limites = LeerJson(e.estandaresvolumetricos);
            if (!Cabe(paquete, limites)) continue;

            var costo = await _funciones.CostoEnvio(e.id, paquete.AnchoCm, paquete.AltoCm, paquete.FondoCm, paquete.PesoKg, ct);
            var dias = Numero(limites, "dias_entrega");
            opciones.Add(new OpcionEnvio(e.id, e.nombre, (int)Math.Round(costo), dias is null ? null : (int)dias));
        }

        return opciones.OrderBy(o => o.Costo).ThenBy(o => o.Nombre).ToList();
    }

    /// <summary>La opción de una empresa concreta, o null si esa empresa no puede llevar el paquete.</summary>
    public async Task<OpcionEnvio?> CotizarAsync(PaqueteEnvio paquete, int idEmpresa, CancellationToken ct = default) =>
        (await OpcionesAsync(paquete, ct)).FirstOrDefault(o => o.Id == idEmpresa);

    /// <summary>
    /// JSON que se guarda en Despacho.DatosLogisticos al comprar. El trigger de la base le agrega
    /// "costo_envio" con la misma función (fn_costo_envio) que se usó para cobrar.
    /// </summary>
    public static string DatosLogisticos(PaqueteEnvio p, int idEmpresa) =>
        JsonSerializer.Serialize(new
        {
            peso_kg = p.PesoKg,
            ancho_cm = p.AnchoCm,
            alto_cm = p.AltoCm,
            fondo_cm = p.FondoCm,
            id_empresad = idEmpresa
        });

    /// <summary>Productos del carrito de un usuario (los servicios no se envían).</summary>
    public async Task<List<(string? caracteristicas, int cantidad)>> ProductosDelCarritoAsync(string rut, CancellationToken ct = default) =>
        (await _db.crear3s.AsNoTracking()
            .Where(c => c.id_usuario == rut)
            .Select(c => new { c.id_productoNavigation.caracteristicas, c.cantidad })
            .ToListAsync(ct))
        .Select(c => ((string?)c.caracteristicas, c.cantidad)).ToList();

    /// <summary>Productos de una cotización del usuario.</summary>
    public async Task<List<(string? caracteristicas, int cantidad)>> ProductosDeCotizacionAsync(int idCotizacion, string rut, CancellationToken ct = default) =>
        (await _db.solicitar1s.AsNoTracking()
            .Where(s => s.id_cotizacion == idCotizacion && s.id_usuario == rut)
            .Select(s => new { s.id_productoNavigation.caracteristicas, s.cantidad })
            .ToListAsync(ct))
        .Select(s => ((string?)s.caracteristicas, s.cantidad)).ToList();
}
