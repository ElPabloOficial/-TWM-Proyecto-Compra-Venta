using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;

// Empresas de despacho (Chilexpress, Starken, etc.) y sus estándares volumétricos:
// medidas y peso máximos de un paquete, que se guardan en el JSON EstandaresVolumetricos.
[ApiController]
[Route("api/empresas-despacho")]
[Authorize(Roles = "Administrador")]
public class EmpresasDespachoController : ControllerBase
{
    private readonly AppDbContext _context;

    private const int MaxNombre = 50;        // largo de EmpresaDespacho.Nombre en la BD
    private const int MaxMedidaCm = 1000;    // tope razonable para alto, ancho y fondo
    private const int MaxPesoG = 1_000_000;  // 1.000 kg

    public EmpresasDespachoController(AppDbContext context)
    {
        _context = context;
    }

    // Valida el DTO. Devuelve la lista de errores (vacía si todo está bien) y el nombre limpio.
    private static List<string> Validar(EmpresaDespachoDto dto, out string nombre)
    {
        var errores = new List<string>();
        nombre = dto.nombre?.Trim() ?? "";

        if (nombre == "") errores.Add("nombre: no puede estar vacío.");
        else if (nombre.Length > MaxNombre) errores.Add($"nombre: máximo {MaxNombre} caracteres.");

        void Medida(int? valor, string campo)
        {
            if (valor is null or <= 0) errores.Add($"{campo}: debe ser mayor a 0.");
            else if (valor > MaxMedidaCm) errores.Add($"{campo}: máximo {MaxMedidaCm} cm.");
        }

        Medida(dto.alto_max_cm, "alto_max_cm");
        Medida(dto.ancho_max_cm, "ancho_max_cm");
        Medida(dto.fondo_max_cm, "fondo_max_cm");

        if (dto.peso_max_g is null or <= 0) errores.Add("peso_max_g: debe ser mayor a 0.");
        else if (dto.peso_max_g > MaxPesoG) errores.Add($"peso_max_g: máximo {MaxPesoG} g.");

        return errores;
    }

    // Arma el JSON que se guarda en la BD (volumen = alto × ancho × fondo)
    private static string ArmarEstandares(EmpresaDespachoDto dto) =>
        JsonSerializer.Serialize(new
        {
            alto_max_cm = dto.alto_max_cm,
            ancho_max_cm = dto.ancho_max_cm,
            fondo_max_cm = dto.fondo_max_cm,
            peso_max_g = dto.peso_max_g,
            volumen_max_cm3 = (long)dto.alto_max_cm!.Value * dto.ancho_max_cm!.Value * dto.fondo_max_cm!.Value
        });

    // Lee un número del JSON guardado (0 si falta o está mal formado)
    private static long Numero(JsonElement json, string clave) =>
        json.ValueKind == JsonValueKind.Object
        && json.TryGetProperty(clave, out var v)
        && v.ValueKind == JsonValueKind.Number
        && v.TryGetInt64(out var n) ? n : 0;

    // GET: api/empresas-despacho (Lista las empresas con sus límites y cuántos despachos han hecho)
    [HttpGet]
    public async Task<IActionResult> GetEmpresas()
    {
        try
        {
            var empresas = await _context.empresadespachos
                .AsNoTracking()
                .OrderBy(e => e.nombre)
                .Select(e => new { e.id, e.nombre, e.estandaresvolumetricos, despachos = e.despachar2s.Count })
                .ToListAsync();

            var data = empresas.Select(e =>
            {
                JsonElement json;
                try { json = JsonDocument.Parse(e.estandaresvolumetricos).RootElement; }
                catch { json = JsonDocument.Parse("{}").RootElement; }

                return new
                {
                    e.id,
                    e.nombre,
                    alto_max_cm = Numero(json, "alto_max_cm"),
                    ancho_max_cm = Numero(json, "ancho_max_cm"),
                    fondo_max_cm = Numero(json, "fondo_max_cm"),
                    peso_max_g = Numero(json, "peso_max_g"),
                    volumen_max_cm3 = Numero(json, "volumen_max_cm3"),
                    e.despachos
                };
            }).ToList();

            return Ok(new { success = true, message = "Empresas de despacho obtenidas.", data, errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // POST: api/empresas-despacho (Crear empresa de despacho)
    [HttpPost]
    public async Task<IActionResult> CrearEmpresa([FromBody] EmpresaDespachoDto dto)
    {
        try
        {
            var errores = Validar(dto, out var nombre);
            if (errores.Count > 0)
                return BadRequest(new { success = false, message = "Datos no válidos.", errors = errores });

            if (await _context.empresadespachos.AnyAsync(e => e.nombre.ToLower() == nombre.ToLower()))
                return Conflict(new { success = false, message = "Ya existe una empresa de despacho con ese nombre." });

            // Los datos iniciales se cargaron con ids fijos, por lo que la secuencia de la BD puede ir atrasada:
            // el id se calcula aquí para no chocar con los existentes.
            var siguienteId = (await _context.empresadespachos.MaxAsync(e => (int?)e.id) ?? 0) + 1;

            var nueva = new empresadespacho
            {
                id = siguienteId,
                nombre = nombre,
                estandaresvolumetricos = ArmarEstandares(dto)
            };
            _context.empresadespachos.Add(nueva);
            await _context.SaveChangesAsync();

            return StatusCode(201, new { success = true, message = "Empresa de despacho creada.", data = new { nueva.id }, errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // PUT: api/empresas-despacho/1 (Editar nombre y límites)
    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarEmpresa(int id, [FromBody] EmpresaDespachoDto dto)
    {
        try
        {
            var errores = Validar(dto, out var nombre);
            if (errores.Count > 0)
                return BadRequest(new { success = false, message = "Datos no válidos.", errors = errores });

            var empresa = await _context.empresadespachos.FindAsync(id);
            if (empresa == null)
                return NotFound(new { success = false, message = "Empresa de despacho no encontrada." });

            if (await _context.empresadespachos.AnyAsync(e => e.id != id && e.nombre.ToLower() == nombre.ToLower()))
                return Conflict(new { success = false, message = "Ya existe una empresa de despacho con ese nombre." });

            empresa.nombre = nombre;
            empresa.estandaresvolumetricos = ArmarEstandares(dto);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Empresa de despacho actualizada.", data = (object?)null, errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // DELETE: api/empresas-despacho/1 (Solo si no tiene despachos: la BD borraría también su historial)
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarEmpresa(int id)
    {
        try
        {
            var empresa = await _context.empresadespachos.FindAsync(id);
            if (empresa == null)
                return NotFound(new { success = false, message = "Empresa de despacho no encontrada." });

            if (await _context.despachar2s.AnyAsync(d => d.id_empresad == id))
                return Conflict(new { success = false, message = "No se puede eliminar: la empresa ya tiene despachos registrados." });

            _context.empresadespachos.Remove(empresa);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Empresa de despacho eliminada.", data = (object?)null, errors = (object?)null });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}
