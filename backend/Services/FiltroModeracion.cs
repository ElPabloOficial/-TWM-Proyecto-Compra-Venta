using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace backend.Services;

/// <summary>
/// Detecta mensajes y reseñas con lenguaje ofensivo para enviarlos a la moderación del administrador.
/// Solo el contenido que contiene alguna de estas palabras o frases aparece en /mensajes.
/// </summary>
public static class FiltroModeracion
{
    // Para agregar o quitar palabras basta con editar esta lista (no importan mayúsculas ni tildes).
    // Las frases de varias palabras también valen. Se detecta la palabra completa y su plural:
    // "weon" detecta "weon" y "weones", pero no "tweon".
    public static readonly string[] Palabras =
    {
        // Insultos
        "puta", "puto", "hijo de puta", "hdp", "mierda", "conchetumare", "conchesumadre", "ctm",
        "culiao", "culiado", "reculiao", "reculiado", "weon", "weona", "huevon", "maricon",
        "cabron", "pendejo", "imbecil", "idiota", "estupido", "estupida", "retrasado", "mongolico",
        "subnormal", "malnacido", "desgraciado", "maldito", "perra", "zorra", "chucha", "carajo",
        // Amenazas
        "te voy a matar", "te mato", "ojala te mueras", "muerete", "te voy a buscar",
    };

    private static readonly Lazy<List<(string Palabra, Regex Patron)>> Patrones = new(() =>
        Palabras.Select(p => (p, Crear(p))).ToList());

    // Minúsculas y sin tildes: "Weón" -> "weon"
    private static string Normalizar(string texto)
    {
        var descompuesto = texto.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(descompuesto.Length);
        foreach (var c in descompuesto)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark) sb.Append(c);
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    private static Regex Crear(string palabra)
    {
        var partes = Normalizar(palabra).Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(Regex.Escape);
        var cuerpo = string.Join(@"\s+", partes);
        return new Regex($@"(?<![a-z0-9]){cuerpo}(?:e?s)?(?![a-z0-9])",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);
    }

    /// <summary>Palabras de la lista que aparecen en el texto (vacío si no hay ninguna).</summary>
    public static List<string> Detectar(string? texto)
    {
        if (string.IsNullOrWhiteSpace(texto)) return new List<string>();

        var normalizado = Normalizar(texto);
        return Patrones.Value
            .Where(p => p.Patron.IsMatch(normalizado))
            .Select(p => p.Palabra)
            .ToList();
    }
}
