// Código generado para integrar las funciones PostgreSQL (bd_proyecto/funciones.txt)
#nullable enable
using System.Text.Json;
using backend.DTOs.Funciones;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // Ajusta el rol por endpoint si algún reporte debe ser público para vendedores/clientes
public class FuncionesController : ControllerBase
{
    private readonly FuncionesService _f;
    public FuncionesController(FuncionesService f) => _f = f;

    private static OkObjectResult Ok_(string message, object? data) =>
        new(new { success = true, message, data, errors = (object?)null });

    private IActionResult Fallo(PostgresException ex) =>
        BadRequest(new { success = false, message = "Error en la base de datos.", data = (object?)null, errors = new[] { ex.MessageText } });

    /// <summary>Cantidad de clientes que compraron un producto en un período. (<c>f_consolidacion_1</c>)</summary>
    [HttpGet("consolidacion/clientes-por-producto/cantidad")]
    public async Task<IActionResult> ClientesPorProductoCantidad(string producto, DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ClientesPorProductoCantidad(producto, inicio, fin, ct);
            return Ok_("Cantidad de clientes que compraron un producto en un período.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Clientes que compraron un producto en un período. (<c>f_consolidacion_2</c>)</summary>
    [HttpGet("consolidacion/clientes-por-producto")]
    public async Task<IActionResult> ClientesPorProducto(string producto, DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ClientesPorProducto(producto, inicio, fin, ct);
            return Ok_("Clientes que compraron un producto en un período.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Cantidad de clientes que contrataron un servicio en un período. (<c>f_consolidacion_3</c>)</summary>
    [HttpGet("consolidacion/clientes-por-servicio/cantidad")]
    public async Task<IActionResult> ClientesPorServicioCantidad(string servicio, DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ClientesPorServicioCantidad(servicio, inicio, fin, ct);
            return Ok_("Cantidad de clientes que contrataron un servicio en un período.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Clientes que contrataron un servicio en un período. (<c>f_consolidacion_4</c>)</summary>
    [HttpGet("consolidacion/clientes-por-servicio")]
    public async Task<IActionResult> ClientesPorServicio(string servicio, DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ClientesPorServicio(servicio, inicio, fin, ct);
            return Ok_("Clientes que contrataron un servicio en un período.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Total de compras y total pagado por un cliente en un período. (<c>f_consolidacion_5</c>)</summary>
    [HttpGet("consolidacion/resumen-cliente")]
    public async Task<IActionResult> ResumenCliente(string rut, DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ResumenCliente(rut, inicio, fin, ct);
            return Ok_("Total de compras y total pagado por un cliente en un período.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Total de ventas por artículo y vendedor en un período. (<c>f_consolidacion_6</c>)</summary>
    [HttpGet("consolidacion/ventas-por-articulo-vendedor")]
    public async Task<IActionResult> VentasPorArticuloVendedor(DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VentasPorArticuloVendedor(inicio, fin, ct);
            return Ok_("Total de ventas por artículo y vendedor en un período.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Volumen de ventas: fines de semana vs. días hábiles. (<c>f_consolidacion_7</c>)</summary>
    [HttpGet("consolidacion/ventas-fin-de-semana-vs-habiles")]
    public async Task<IActionResult> VentasFinDeSemanaVsHabiles(DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VentasFinDeSemanaVsHabiles(inicio, fin, ct);
            return Ok_("Volumen de ventas: fines de semana vs. días hábiles.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Variación porcentual de ingresos: mes de la fecha vs. mes anterior. (<c>f_consolidacion_8</c>)</summary>
    [HttpGet("consolidacion/variacion-ingresos")]
    public async Task<IActionResult> VariacionIngresos(DateOnly fecha, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VariacionIngresos(fecha, ct);
            return Ok_("Variación porcentual de ingresos: mes de la fecha vs. mes anterior.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Ventas con descuento aplicado en un año. (<c>f_consolidacion_9</c>)</summary>
    [HttpGet("consolidacion/ventas-con-descuento")]
    public async Task<IActionResult> VentasConDescuento(int anio, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VentasConDescuento(anio, ct);
            return Ok_("Ventas con descuento aplicado en un año.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Ciudades donde se ha contratado un servicio. (<c>f_georreferenciacion_1</c>)</summary>
    [HttpGet("georreferenciacion/ciudades-por-servicio")]
    public async Task<IActionResult> CiudadesPorServicio(string servicio, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.CiudadesPorServicio(servicio, ct);
            return Ok_("Ciudades donde se ha contratado un servicio.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Ciudades donde se ha comprado un producto. (<c>f_georreferenciacion_2</c>)</summary>
    [HttpGet("georreferenciacion/ciudades-por-producto")]
    public async Task<IActionResult> CiudadesPorProducto(string producto, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.CiudadesPorProducto(producto, ct);
            return Ok_("Ciudades donde se ha comprado un producto.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Vendedores y sus productos (opcionalmente de un vendedor). (<c>f_georreferenciacion_3</c>)</summary>
    [HttpGet("georreferenciacion/vendedores-productos")]
    public async Task<IActionResult> VendedoresProductos(string? rutVendedor = null, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VendedoresProductos(rutVendedor, ct);
            return Ok_("Vendedores y sus productos (opcionalmente de un vendedor).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Promedio de días de despacho por empresa de transporte. (<c>f_georreferenciacion_4</c>)</summary>
    [HttpGet("georreferenciacion/promedio-dias-por-empresa")]
    public async Task<IActionResult> PromedioDiasPorEmpresa(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.PromedioDiasPorEmpresa(ct);
            return Ok_("Promedio de días de despacho por empresa de transporte.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Volumen de despachos por región según peso mínimo. (<c>f_georreferenciacion_5</c>)</summary>
    [HttpGet("georreferenciacion/volumen-por-region")]
    public async Task<IActionResult> VolumenPorRegion(decimal pesoMinimo = 10m, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VolumenPorRegion(pesoMinimo, ct);
            return Ok_("Volumen de despachos por región según peso mínimo.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Listado de comunas y direcciones. (<c>f_georreferenciacion_7</c>)</summary>
    [HttpGet("georreferenciacion/direcciones")]
    public async Task<IActionResult> Direcciones(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.Direcciones(ct);
            return Ok_("Listado de comunas y direcciones.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Producto más vendido de un vendedor. (<c>f_fidelizacion_1</c>)</summary>
    [HttpGet("fidelizacion/producto-mas-vendido")]
    public async Task<IActionResult> ProductoMasVendido(string rutVendedor, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ProductoMasVendido(rutVendedor, ct);
            return Ok_("Producto más vendido de un vendedor.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Servicio más vendido de un vendedor. (<c>f_fidelizacion_2</c>)</summary>
    [HttpGet("fidelizacion/servicio-mas-vendido")]
    public async Task<IActionResult> ServicioMasVendido(string rutVendedor, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ServicioMasVendido(rutVendedor, ct);
            return Ok_("Servicio más vendido de un vendedor.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Cantidad de preguntas sin responder de un producto. (<c>f_fidelizacion_3</c>)</summary>
    [HttpGet("fidelizacion/preguntas-sin-responder")]
    public async Task<IActionResult> PreguntasSinResponder(int idProducto, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.PreguntasSinResponder(idProducto, ct);
            return Ok_("Cantidad de preguntas sin responder de un producto.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Productos de un vendedor con promedio de calificación >= 4. (<c>f_fidelizacion_4</c>)</summary>
    [HttpGet("fidelizacion/productos-mejor-calificados")]
    public async Task<IActionResult> ProductosMejorCalificados(string rutVendedor, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ProductosMejorCalificados(rutVendedor, ct);
            return Ok_("Productos de un vendedor con promedio de calificación >= 4.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Vendedores con productos o servicios con promedio < 3. (<c>f_fidelizacion_5</c>)</summary>
    [HttpGet("fidelizacion/vendedores-baja-calificacion")]
    public async Task<IActionResult> VendedoresBajaCalificacion(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VendedoresBajaCalificacion(ct);
            return Ok_("Vendedores con productos o servicios con promedio < 3.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Vendedores de servicios sin calificaciones en los últimos 6 meses. (<c>f_fidelizacion_6</c>)</summary>
    [HttpGet("fidelizacion/vendedores-servicios-sin-calificaciones")]
    public async Task<IActionResult> VendedoresServiciosSinCalificaciones(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VendedoresServiciosSinCalificaciones(ct);
            return Ok_("Vendedores de servicios sin calificaciones en los últimos 6 meses.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Calificaciones cuyo comentario contiene una palabra. (<c>f_fidelizacion_7</c>)</summary>
    [HttpGet("fidelizacion/comentarios-por-palabra")]
    public async Task<IActionResult> ComentariosPorPalabra(string palabra, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ComentariosPorPalabra(palabra, ct);
            return Ok_("Calificaciones cuyo comentario contiene una palabra.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Usuarios con más de 10 calificaciones escritas. (<c>f_fidelizacion_8</c>)</summary>
    [HttpGet("fidelizacion/usuarios-mas-activos-calificando")]
    public async Task<IActionResult> UsuariosMasActivosCalificando(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.UsuariosMasActivosCalificando(ct);
            return Ok_("Usuarios con más de 10 calificaciones escritas.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Tiempo promedio de respuesta a preguntas de un vendedor. (<c>f_fidelizacion_9</c>)</summary>
    [HttpGet("fidelizacion/tiempo-promedio-respuesta")]
    public async Task<IActionResult> TiempoPromedioRespuesta(string rutVendedor, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.TiempoPromedioRespuesta(rutVendedor, ct);
            return Ok_("Tiempo promedio de respuesta a preguntas de un vendedor.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Mensajes sin respuesta con más de 48 horas. (<c>f_fidelizacion_10</c>)</summary>
    [HttpGet("fidelizacion/mensajes-sin-responder-48h")]
    public async Task<IActionResult> MensajesSinResponder48h(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.MensajesSinResponder48h(ct);
            return Ok_("Mensajes sin respuesta con más de 48 horas.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Valor de una característica JSON de los productos de una categoría. (<c>f_json_1</c>)</summary>
    [HttpGet("json/valor-caracteristica")]
    public async Task<IActionResult> ValorCaracteristica(string caracteristica, string categoria, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ValorCaracteristica(caracteristica, categoria, ct);
            return Ok_("Valor de una característica JSON de los productos de una categoría.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Servicios filtrados por modalidad (ej. Remoto). (<c>f_json_2</c>)</summary>
    [HttpGet("json/servicios-por-modalidad")]
    public async Task<IActionResult> ServiciosPorModalidad(string modalidad, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ServiciosPorModalidad(modalidad, ct);
            return Ok_("Servicios filtrados por modalidad (ej. Remoto).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Peso promedio de productos en inventario. (<c>f_json_3</c>)</summary>
    [HttpGet("json/peso-promedio-inventario")]
    public async Task<IActionResult> PesoPromedioInventario(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.PesoPromedioInventario(ct);
            return Ok_("Peso promedio de productos en inventario.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Productos de una categoría (y subcategorías) sin cierta llave JSON. (<c>f_json_4</c>)</summary>
    [HttpGet("json/productos-sin-caracteristica")]
    public async Task<IActionResult> ProductosSinCaracteristica(string categoria, string llave, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ProductosSinCaracteristica(categoria, llave, ct);
            return Ok_("Productos de una categoría (y subcategorías) sin cierta llave JSON.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Variantes de color/talla/dimensiones desnormalizadas. (<c>f_json_5</c>)</summary>
    [HttpGet("json/variantes-color-talla")]
    public async Task<IActionResult> VariantesColorTalla(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VariantesColorTalla(ct);
            return Ok_("Variantes de color/talla/dimensiones desnormalizadas.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Productos con dimensiones declaradas en el JSON. (<c>f_json_6</c>)</summary>
    [HttpGet("json/productos-con-dimensiones")]
    public async Task<IActionResult> ProductosConDimensiones(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ProductosConDimensiones(ct);
            return Ok_("Productos con dimensiones declaradas en el JSON.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Servicios no contratados en el período. (<c>f_exclusion_1</c>)</summary>
    [HttpGet("exclusion/servicios-no-contratados")]
    public async Task<IActionResult> ServiciosNoContratados(DateOnly inicio, DateOnly fin, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ServiciosNoContratados(inicio, fin, ct);
            return Ok_("Servicios no contratados en el período.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Total de pedidos de un vendedor por categoría. (<c>f_exclusion_2</c>)</summary>
    [HttpGet("exclusion/pedidos-por-vendedor-categoria")]
    public async Task<IActionResult> PedidosPorVendedorCategoria(string rutVendedor, string categoria, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.PedidosPorVendedorCategoria(rutVendedor, categoria, ct);
            return Ok_("Total de pedidos de un vendedor por categoría.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Clientes a los que un vendedor ha realizado un negocio. (<c>f_exclusion_3</c>)</summary>
    [HttpGet("exclusion/clientes-de-vendedor")]
    public async Task<IActionResult> ClientesDeVendedor(string rutVendedor, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ClientesDeVendedor(rutVendedor, ct);
            return Ok_("Clientes a los que un vendedor ha realizado un negocio.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Usuarios que son clientes y emprendedores a la vez. (<c>f_exclusion_4</c>)</summary>
    [HttpGet("exclusion/usuarios-rol-dual")]
    public async Task<IActionResult> UsuariosRolDual(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.UsuariosRolDual(ct);
            return Ok_("Usuarios que son clientes y emprendedores a la vez.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Clientes activos con productos en lista de deseos que no han comprado (NOT IN). (<c>f_exclusion_5</c>)</summary>
    [HttpGet("exclusion/clientes-activos-sin-compras")]
    public async Task<IActionResult> ClientesActivosSinCompras(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ClientesActivosSinCompras(ct);
            return Ok_("Clientes activos con productos en lista de deseos que no han comprado (NOT IN).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Categorías sin subcategorías ni productos. (<c>f_exclusion_6</c>)</summary>
    [HttpGet("exclusion/categorias-vacias")]
    public async Task<IActionResult> CategoriasVacias(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.CategoriasVacias(ct);
            return Ok_("Categorías sin subcategorías ni productos.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>División relacional: clientes que compraron en todas las subcategorías de una categoría. (<c>f_exclusion_7</c>)</summary>
    [HttpGet("exclusion/clientes-todas-categorias")]
    public async Task<IActionResult> ClientesTodasCategorias(int idCategoriaPrincipal, bool soloCumplen = true, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ClientesTodasCategorias(idCategoriaPrincipal, soloCumplen, ct);
            return Ok_("División relacional: clientes que compraron en todas las subcategorías de una categoría.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Servicios ofrecidos en múltiples regiones. (<c>f_exclusion_8</c>)</summary>
    [HttpGet("exclusion/servicios-multi-region")]
    public async Task<IActionResult> ServiciosMultiRegion(int idCategoria, int minRegiones = 2, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ServiciosMultiRegion(idCategoria, minRegiones, ct);
            return Ok_("Servicios ofrecidos en múltiples regiones.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Productos comprados frecuentemente en una misma orden. (<c>f_exclusion_9</c>)</summary>
    [HttpGet("exclusion/productos-comprados-juntos")]
    public async Task<IActionResult> ProductosCompradosJuntos(int minVeces = 1, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ProductosCompradosJuntos(minVeces, ct);
            return Ok_("Productos comprados frecuentemente en una misma orden.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Devoluciones por cliente (o de un cliente si se indica su rut). (<c>f_inventario_1</c>)</summary>
    [HttpGet("inventario/devoluciones-por-cliente")]
    public async Task<IActionResult> DevolucionesPorCliente(string? rut = null, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.DevolucionesPorCliente(rut, ct);
            return Ok_("Devoluciones por cliente (o de un cliente si se indica su rut).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Productos en oferta según estado de la oferta. (<c>f_inventario_2</c>)</summary>
    [HttpGet("inventario/productos-en-oferta")]
    public async Task<IActionResult> ProductosEnOferta(bool estado = true, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ProductosEnOferta(estado, ct);
            return Ok_("Productos en oferta según estado de la oferta.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Capital total reintegrado por devoluciones en un año. (<c>f_inventario_3</c>)</summary>
    [HttpGet("inventario/capital-reintegrado")]
    public async Task<IActionResult> CapitalReintegrado(int anio, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.CapitalReintegrado(anio, ct);
            return Ok_("Capital total reintegrado por devoluciones en un año.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Listas de deseos con ofertas vigentes hasta la fecha indicada. (<c>f_inventario_4</c>)</summary>
    [HttpGet("inventario/deseos-con-oferta")]
    public async Task<IActionResult> DeseosConOferta(DateOnly fecha, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.DeseosConOferta(fecha, ct);
            return Ok_("Listas de deseos con ofertas vigentes hasta la fecha indicada.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Tasa porcentual de devoluciones por emprendedor. (<c>f_inventario_5</c>)</summary>
    [HttpGet("inventario/tasa-devoluciones-emprendedor")]
    public async Task<IActionResult> TasaDevolucionesEmprendedor(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.TasaDevolucionesEmprendedor(ct);
            return Ok_("Tasa porcentual de devoluciones por emprendedor.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Productos con más variantes de color y stock que los umbrales. (<c>f_inventario_6</c>)</summary>
    [HttpGet("inventario/productos-stock-colores")]
    public async Task<IActionResult> ProductosStockColores(int minColores = 1, long minStock = 10, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ProductosStockColores(minColores, minStock, ct);
            return Ok_("Productos con más variantes de color y stock que los umbrales.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Ventas anuladas según medio de pago. (<c>f_inventario_7</c>)</summary>
    [HttpGet("inventario/ventas-anuladas")]
    public async Task<IActionResult> VentasAnuladas(string medioPago, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.VentasAnuladas(medioPago, ct);
            return Ok_("Ventas anuladas según medio de pago.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Tasa de conversión de lista de deseos a ventas (todos los productos o uno). (<c>f_inventario_8</c>)</summary>
    [HttpGet("inventario/conversion-lista-deseos")]
    public async Task<IActionResult> ConversionListaDeseos(int? idProducto = null, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.ConversionListaDeseos(idProducto, ct);
            return Ok_("Tasa de conversión de lista de deseos a ventas (todos los productos o uno).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Edad de los usuarios, filtrando menores/mayores de un límite. (<c>f_validacion_1</c>)</summary>
    [HttpGet("validacion/edad-clientes")]
    public async Task<IActionResult> EdadClientes(int edadLimite = 18, bool soloMenores = true, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.EdadClientes(edadLimite, soloMenores, ct);
            return Ok_("Edad de los usuarios, filtrando menores/mayores de un límite.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Clientes agrupados por tramos de edad. (<c>f_validacion_3</c>)</summary>
    [HttpGet("validacion/grupos-etarios")]
    public async Task<IActionResult> GruposEtarios(int anchoGrupo = 10, DateOnly? fechaDesde = null, DateOnly? fechaHasta = null, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.GruposEtarios(anchoGrupo, fechaDesde, fechaHasta, ct);
            return Ok_("Clientes agrupados por tramos de edad.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Emprendedores y su empresa asociada. (<c>f_validacion_5</c>)</summary>
    [HttpGet("validacion/emprendedores-empresa")]
    public async Task<IActionResult> EmprendedoresEmpresa(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.EmprendedoresEmpresa(ct);
            return Ok_("Emprendedores y su empresa asociada.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Direcciones de despacho que cumplen la condición de la función. (<c>f_validacion_6</c>)</summary>
    [HttpGet("validacion/direcciones-despacho")]
    public async Task<IActionResult> DireccionesDespacho(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.DireccionesDespacho(ct);
            return Ok_("Direcciones de despacho que cumplen la condición de la función.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Emprendedores > 60 años que ofrecen servicios educativos presenciales. (<c>f_validacion_7</c>)</summary>
    [HttpGet("validacion/emprendedores-mayores-60")]
    public async Task<IActionResult> EmprendedoresMayores60(CancellationToken ct = default)
    {
        try
        {
            var data = await _f.EmprendedoresMayores60(ct);
            return Ok_("Emprendedores > 60 años que ofrecen servicios educativos presenciales.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Medios de pago registrados bajo una marca (Visa / Mastercard / Transferencia). (<c>f_validacion_8</c>)</summary>
    [HttpGet("validacion/medios-pago")]
    public async Task<IActionResult> MediosPago(string medioEvaluado, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.MediosPago(medioEvaluado, ct);
            return Ok_("Medios de pago registrados bajo una marca (Visa / Mastercard / Transferencia).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Factura fiscal de una venta (si idVenta es null, todas). (<c>f_logicas_1</c>)</summary>
    [HttpGet("logicas/factura")]
    public async Task<IActionResult> Factura(int? idVenta = null, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.Factura(idVenta, ct);
            return Ok_("Factura fiscal de una venta (si idVenta es null, todas).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Rendimiento trimestral de un vendedor en un año. (<c>f_logicas_3</c>)</summary>
    [HttpGet("logicas/rendimiento-vendedor")]
    public async Task<IActionResult> RendimientoVendedor(int anio, string idVendedor, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.RendimientoVendedor(anio, idVendedor, ct);
            return Ok_("Rendimiento trimestral de un vendedor en un año.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Life-Time Value de clientes con un mínimo de transacciones. (<c>f_logicas_4</c>)</summary>
    [HttpGet("logicas/ltv-clientes")]
    public async Task<IActionResult> LtvClientes(int minTransacciones = 1, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.LtvClientes(minTransacciones, ct);
            return Ok_("Life-Time Value de clientes con un mínimo de transacciones.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Jerarquía de categorías desde una raíz (null = todas). (<c>f_logicas_5</c>)</summary>
    [HttpGet("logicas/jerarquia-categorias")]
    public async Task<IActionResult> JerarquiaCategorias(int? idRaiz = null, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.JerarquiaCategorias(idRaiz, ct);
            return Ok_("Jerarquía de categorías desde una raíz (null = todas).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Utilidad operativa proyectada con una comisión dada (ej. 0.05). (<c>f_logicas_6</c>)</summary>
    [HttpGet("logicas/utilidad-proyectada")]
    public async Task<IActionResult> UtilidadProyectada(decimal comision, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.UtilidadProyectada(comision, ct);
            return Ok_("Utilidad operativa proyectada con una comisión dada (ej. 0.05).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Empresas agrupadas por giro (null = todos). (<c>f_logicas_7</c>)</summary>
    [HttpGet("logicas/empresas-por-giro")]
    public async Task<IActionResult> EmpresasPorGiro(string? giro = null, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.EmpresasPorGiro(giro, ct);
            return Ok_("Empresas agrupadas por giro (null = todos).", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Promedio diario de nuevos clientes en un rango de fechas. (<c>f_logicas_8</c>)</summary>
    [HttpGet("logicas/promedio-nuevos-clientes")]
    public async Task<IActionResult> PromedioNuevosClientes(DateOnly fechaDesde, DateOnly fechaHasta, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.PromedioNuevosClientes(fechaDesde, fechaHasta, ct);
            return Ok_("Promedio diario de nuevos clientes en un rango de fechas.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    /// <summary>Catálogo unificado de productos y servicios con disponibilidad. (<c>f_logicas_10</c>)</summary>
    [HttpGet("logicas/catalogo-unificado")]
    public async Task<IActionResult> CatalogoUnificado(string? busqueda = null, bool soloDisponibles = false, CancellationToken ct = default)
    {
        try
        {
            var data = await _f.CatalogoUnificado(busqueda, soloDisponibles, ct);
            return Ok_("Catálogo unificado de productos y servicios con disponibilidad.", data);
        }
        catch (PostgresException ex) { return Fallo(ex); }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }

    // ---- f_dml: INSERT / UPDATE / DELETE genérico ----
    // Tablas que NO se pueden modificar desde este endpoint (datos sensibles).
    private static readonly HashSet<string> TablasBloqueadas = new(StringComparer.OrdinalIgnoreCase)
    { "usuario", "pago", "correo", "telefono" };

    /// <summary>Operación DML genérica sobre una tabla (<c>f_dml</c>). Solo administradores.</summary>
    [HttpPost("dml")]
    public async Task<IActionResult> Dml([FromBody] DmlRequestDto dto, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Tabla) || string.IsNullOrWhiteSpace(dto.Operacion))
                return BadRequest(new { success = false, message = "Tabla y operación son obligatorias.", data = (object?)null, errors = (object?)null });
            if (TablasBloqueadas.Contains(dto.Tabla.Trim()))
                return StatusCode(403, new { success = false, message = $"La tabla '{dto.Tabla}' no se puede modificar por este medio.", data = (object?)null, errors = (object?)null });

            try
            {
                var datos = dto.Datos?.GetRawText() ?? "{}";
                var filtro = dto.Filtro?.GetRawText();
                var filas = await _f.Dml(dto.Tabla, dto.Operacion, datos, filtro, ct);
                return Ok_("Operación realizada.", new { filas_afectadas = filas });
            }
            catch (PostgresException ex) { return Fallo(ex); }
    
        }
        catch (Exception ex)
        {
            return this.ErrorInterno(ex);
        }
    }
}
