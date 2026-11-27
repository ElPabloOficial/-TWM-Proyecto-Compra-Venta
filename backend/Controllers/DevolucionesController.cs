using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.DTOs;
using backend.Models;
using System.IO;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevolucionesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public DevolucionesController(
        AppDbContext context,
        IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }


    // GET: api/devoluciones (Ver mis devoluciones como cliente o vendedor)
    [HttpGet]
    public async Task<IActionResult> GetMisDevoluciones()
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut))
                return Unauthorized(new { success = false, message = "Usuario no autenticado." });

            var devoluciones = await _context.generar1s
                .Where(g => g.id_usuario == rut || g.id_ventaNavigation.id_vendedor == rut)
                .Include(g => g.id_devolucionNavigation)
                .Include(g => g.id_productoNavigation)
                .Include(g => g.id_ventaNavigation)
                .Select(g => new
                {
                    id = g.id_devolucion,
                    venta = g.id_venta,
                    producto = g.id_productoNavigation.nombre,
                    cantidad = g.cantidad,
                    motivo = g.id_devolucionNavigation.motivo,
                    estado = g.id_devolucionNavigation.estado,
                    tipodevolucion = g.id_devolucionNavigation.tipodevolucion,
                    monto_reintegrado = g.id_devolucionNavigation.montoreintegrado,
                    fecha_solicitud = g.id_devolucionNavigation.fechasolicitud,
                    fecha_resolucion = g.id_devolucionNavigation.fecharesolucion,
                    rutaimagen = g.id_devolucionNavigation.rutaimagen
                })
                .ToListAsync();

            return Ok(new { success = true, message = "Devoluciones obtenidas.", data = devoluciones, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // GET: api/devoluciones/mias (Seguimiento de las devoluciones que pedí como cliente)
    [HttpGet("mias")]
    public async Task<IActionResult> GetMisDevolucionesComoCliente()
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut))
                return Unauthorized(new { success = false, message = "Usuario no autenticado." });

            var devoluciones = await _context.generar1s
                .AsNoTracking()
                .Where(g => g.id_usuario == rut)
                .OrderByDescending(g => g.id_devolucionNavigation.fechasolicitud)
                .ThenByDescending(g => g.id_devolucion)
                .Select(g => new
                {
                    id = g.id_devolucion,
                    venta = g.id_venta,
                    idProducto = g.id_producto,
                    producto = g.id_productoNavigation.nombre,
                    imagenProducto = g.id_productoNavigation.rutaimagen,
                    cantidad = g.cantidad,
                    vendedor = g.id_ventaNavigation.id_vendedorNavigation.nombre,
                    motivo = g.id_devolucionNavigation.motivo,
                    estado = g.id_devolucionNavigation.estado,
                    tipo = g.id_devolucionNavigation.tipodevolucion,
                    montoReintegrado = g.id_devolucionNavigation.montoreintegrado,
                    fechaSolicitud = g.id_devolucionNavigation.fechasolicitud,
                    fechaResolucion = g.id_devolucionNavigation.fecharesolucion,
                    imagenEvidencia = g.id_devolucionNavigation.rutaimagen
                })
                .ToListAsync();

            return Ok(new { success = true, message = "Devoluciones obtenidas.", data = devoluciones, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // Monto a reembolsar por las unidades devueltas: lo que pagó el cliente por esa línea más el IVA de la venta.
    // Se calcula en memoria porque Venta.Iva es numeric(3,2) y EF lo reventaría si se multiplica dentro de la consulta.
    private static int MontoDeReembolso(int totalLinea, int cantidadComprada, int cantidadDevuelta, decimal iva)
    {
        if (cantidadComprada <= 0) return 0;
        var neto = (decimal)totalLinea * cantidadDevuelta / cantidadComprada;
        return (int)Math.Round(neto * (1 + iva), MidpointRounding.AwayFromZero);
    }

    private static bool EsCambio(string tipo) => tipo.StartsWith("Cambio", StringComparison.OrdinalIgnoreCase);

    // GET: api/devoluciones/vendedor (Solicitudes de devolución de las ventas del vendedor, con el nombre del cliente)
    [HttpGet("vendedor")]
    public async Task<IActionResult> GetDevolucionesDeMisVentas()
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut))
                return Unauthorized(new { success = false, message = "Usuario no autenticado." });

            var filas = await _context.generar1s
                .AsNoTracking()
                .Where(g => g.id_ventaNavigation.id_vendedor == rut)
                .OrderByDescending(g => g.id_devolucionNavigation.fechasolicitud)
                .ThenByDescending(g => g.id_devolucion)
                .Select(g => new
                {
                    id = g.id_devolucion,
                    venta = g.id_venta,
                    idProducto = g.id_producto,
                    cliente = g.id_usuarioNavigation.nombre,
                    producto = g.id_productoNavigation.nombre,
                    cantidad = g.cantidad,
                    motivo = g.id_devolucionNavigation.motivo,
                    estado = g.id_devolucionNavigation.estado,
                    tipo = g.id_devolucionNavigation.tipodevolucion,
                    montoReintegrado = g.id_devolucionNavigation.montoreintegrado,
                    fechaSolicitud = g.id_devolucionNavigation.fechasolicitud,
                    fechaResolucion = g.id_devolucionNavigation.fecharesolucion,
                    imagenEvidencia = g.id_devolucionNavigation.rutaimagen,
                    iva = g.id_ventaNavigation.iva
                })
                .ToListAsync();

            // Lo que costó cada línea (venta + producto), para calcular cuánto se reembolsaría
            var idsVenta = filas.Select(f => f.venta).Distinct().ToList();
            var lineas = (await _context.generar3s
                    .AsNoTracking()
                    .Where(x => idsVenta.Contains(x.id_venta))
                    .Select(x => new { x.id_venta, x.id_producto, x.cantidad, x.totalfinal })
                    .ToListAsync())
                .GroupBy(x => (x.id_venta, x.id_producto))
                .ToDictionary(g => g.Key, g => (cantidad: g.Sum(x => x.cantidad), total: g.Sum(x => x.totalfinal)));

            var items = filas.Select(f =>
            {
                var hayLinea = lineas.TryGetValue((f.venta, f.idProducto), out var linea);
                return new
                {
                    f.id,
                    f.venta,
                    f.cliente,
                    f.producto,
                    f.cantidad,
                    f.motivo,
                    f.estado,
                    f.tipo,
                    f.montoReintegrado,
                    f.fechaSolicitud,
                    f.fechaResolucion,
                    f.imagenEvidencia,
                    montoSugerido = hayLinea && !EsCambio(f.tipo) ? MontoDeReembolso(linea.total, linea.cantidad, f.cantidad, f.iva) : 0
                };
            }).ToList();

            // Tasa de devolución: devoluciones pedidas sobre las ventas del vendedor (sin contar las anuladas)
            var totalVentas = await _context.venta.CountAsync(v => v.id_vendedor == rut && v.estado != "Anulado");
            var tasa = totalVentas == 0 ? 0 : Math.Round(100.0 * items.Count / totalVentas, 1);

            return Ok(new
            {
                success = true,
                message = "Devoluciones obtenidas.",
                data = new { tasa_devolucion = tasa, items },
                errors = (object?)null
            });
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // POST: api/devoluciones (Solicitar devolución)
    [HttpPost]
    public async Task<IActionResult> CrearDevolucion(
        [FromForm] DevolucionCreateDto dto)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
            if (string.IsNullOrEmpty(rut))
                return Unauthorized(new { success = false, message = "Usuario no autenticado." });
    
            if (dto.cantidad <= 0)
                return BadRequest(new { success = false, message = "La cantidad debe ser mayor a 0." });
    
            // Validar venta
            var venta = await _context.venta.FindAsync(dto.id_venta);
    
            if (venta == null)
                return NotFound(new { success = false, message = "Venta no encontrada." });
    
            if (venta.id_cliente != rut)
                return Forbid();
    
            // Validar producto
            var detalleVenta = await _context.generar3s
                .FirstOrDefaultAsync(g =>
                    g.id_venta == dto.id_venta &&
                    g.id_producto == dto.id_producto);
    
            if (detalleVenta == null)
                return BadRequest(new { success = false, message = "El producto no pertenece a esta venta." });
    
            if (dto.cantidad > detalleVenta.cantidad)
                return BadRequest(new { success = false, message = $"Solo compraste {detalleVenta.cantidad} unidades." });
    
            string? rutaImagen = null;
            string? rutaFisica = null;
    
            try
            {
                // Guardar imagen si el usuario adjuntó una
                if (dto.imagen != null && dto.imagen.Length > 0)
                {
                    // Máximo 5 MB
                    if (dto.imagen.Length > 5 * 1024 * 1024)
                        return BadRequest(new { success = false, message = "La imagen no puede superar los 5 MB." });
    
                    var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                    var extension = Path.GetExtension(dto.imagen.FileName).ToLowerInvariant();
    
                    if (!extensionesPermitidas.Contains(extension))
                        return BadRequest(new { success = false, message = "Formato de imagen no permitido." });
    
                    var tiposPermitidos = new[] { "image/jpeg", "image/png", "image/webp" };
    
                    if (!tiposPermitidos.Contains(dto.imagen.ContentType.ToLowerInvariant()))
                        return BadRequest(new { success = false, message = "El archivo debe ser una imagen válida." });
    
                    var carpeta = Path.Combine(
                        _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"),
                        "uploads",
                        "devoluciones"
                    );
    
                    Directory.CreateDirectory(carpeta);
    
                    var nombreArchivo = $"{Guid.NewGuid()}{extension}";
    
                    rutaFisica = Path.Combine(carpeta, nombreArchivo);
                    rutaImagen = $"/uploads/devoluciones/{nombreArchivo}";
    
                    using (var stream = new FileStream(rutaFisica, FileMode.Create))
                    {
                        await dto.imagen.CopyToAsync(stream);
                    }
                }
    
                using var transaction = await _context.Database.BeginTransactionAsync();
    
                // Crear devolución
                var nuevaDevolucion = new devolucion
                {
                    motivo = dto.motivo,
                    fechasolicitud = DateOnly.FromDateTime(DateTime.Now),
                    estado = "En Proceso",
                    tipodevolucion = dto.tipodevolucion,
                    montoreintegrado = 0,
                    rutaimagen = rutaImagen
                };
    
                _context.devolucions.Add(nuevaDevolucion);
                await _context.SaveChangesAsync();
    
                // Asociar devolución a venta, producto y usuario
                var generar1 = new generar1
                {
                    id_usuario = rut,
                    id_devolucion = nuevaDevolucion.id,
                    id_venta = dto.id_venta,
                    id_producto = dto.id_producto,
                    cantidad = dto.cantidad
                };
    
                _context.generar1s.Add(generar1);
    
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
    
                return Ok(new
                {
                    success = true,
                    message = "Devolución solicitada.",
                    data = new { id = nuevaDevolucion.id },
                    errors = (object?)null
                });
            }
            catch (Exception ex)
            {
                // Si falla el registro, eliminar la imagen guardada
                if (rutaFisica != null && System.IO.File.Exists(rutaFisica))
                    System.IO.File.Delete(rutaFisica);
    
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error al crear la devolución.",
                    errors = new[] { ex.Message }
                });
            }
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // PUT: api/devoluciones/{id}/estado (El vendedor de la venta aprueba o rechaza la solicitud)
    [HttpPut("{id}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] DevolucionEstadoDto dto)
    {
        try
        {
            var rut = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(rut))
                return Unauthorized(new { success = false, message = "Usuario no autenticado." });

            var devolucionDb = await _context.devolucions.FindAsync(id);
            if (devolucionDb == null)
                return NotFound(new { success = false, message = "Devolución no encontrada." });

            // Validar que el usuario sea el vendedor de la venta asociada
            var generar1 = await _context.generar1s
                .Include(g => g.id_ventaNavigation)
                .FirstOrDefaultAsync(g => g.id_devolucion == id);

            if (generar1 == null || generar1.id_ventaNavigation.id_vendedor != rut)
                return Forbid();

            // El vendedor solo responde una solicitud pendiente: la aprueba o la rechaza
            var resoluciones = new[] { "Aprobada", "Rechazada" };
            if (!resoluciones.Contains(dto.estado))
                return BadRequest(new { success = false, message = "El estado debe ser \"Aprobada\" o \"Rechazada\"." });

            if (resoluciones.Contains(devolucionDb.estado))
                return BadRequest(new { success = false, message = "Esta solicitud ya fue resuelta." });

            // Monto reembolsado: solo si se aprueba una devolución de dinero (en un cambio de producto no se devuelve plata)
            var monto = 0;
            if (dto.estado == "Aprobada" && !EsCambio(devolucionDb.tipodevolucion))
            {
                if (dto.montoreintegrado.HasValue)
                {
                    monto = dto.montoreintegrado.Value;
                }
                else
                {
                    var lineas = await _context.generar3s
                        .AsNoTracking()
                        .Where(x => x.id_venta == generar1.id_venta && x.id_producto == generar1.id_producto)
                        .Select(x => new { x.cantidad, x.totalfinal })
                        .ToListAsync();

                    monto = MontoDeReembolso(lineas.Sum(x => x.totalfinal), lineas.Sum(x => x.cantidad),
                        generar1.cantidad, generar1.id_ventaNavigation.iva);
                }
            }

            devolucionDb.estado = dto.estado;
            devolucionDb.montoreintegrado = monto;
            devolucionDb.fecharesolucion = DateOnly.FromDateTime(DateTime.Now);

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Estado actualizado.", data = (object?)null, errors = (object?)null });
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}