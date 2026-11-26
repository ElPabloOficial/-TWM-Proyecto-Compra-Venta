// Código generado para integrar las funciones PostgreSQL (bd_proyecto/funciones.txt)
#nullable enable
using backend.DTOs.Funciones;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Punto único de acceso a las funciones PostgreSQL definidas en bd_proyecto/funciones.txt.
/// Todas las llamadas usan SqlQuery con interpolación (EF las convierte en parámetros SQL,
/// por lo que no hay riesgo de inyección) y casteos explícitos para resolver la sobrecarga.
/// </summary>
public class FuncionesService
{
    private readonly AppDbContext _db;
    public FuncionesService(AppDbContext db) => _db = db;

    /// <summary>Cantidad de clientes que compraron un producto en un período. (<c>f_consolidacion_1</c>)</summary>
    public Task<int> ClientesPorProductoCantidad(string producto, DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<int>($"""SELECT f_consolidacion_1({producto}::varchar, {inicio}::date, {fin}::date) AS "Value" """).SingleAsync(ct);

    /// <summary>Clientes que compraron un producto en un período. (<c>f_consolidacion_2</c>)</summary>
    public Task<List<ClientesPorProductoRow>> ClientesPorProducto(string producto, DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ClientesPorProductoRow>($"""SELECT f.rut AS "Rut", f.nombre AS "Nombre" FROM f_consolidacion_2({producto}::varchar, {inicio}::date, {fin}::date) AS f""").ToListAsync(ct);

    /// <summary>Cantidad de clientes que contrataron un servicio en un período. (<c>f_consolidacion_3</c>)</summary>
    public Task<int> ClientesPorServicioCantidad(string servicio, DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<int>($"""SELECT f_consolidacion_3({servicio}::varchar, {inicio}::date, {fin}::date) AS "Value" """).SingleAsync(ct);

    /// <summary>Clientes que contrataron un servicio en un período. (<c>f_consolidacion_4</c>)</summary>
    public Task<List<ClientesPorServicioRow>> ClientesPorServicio(string servicio, DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ClientesPorServicioRow>($"""SELECT f.rut AS "Rut", f.nombre AS "Nombre" FROM f_consolidacion_4({servicio}::varchar, {inicio}::date, {fin}::date) AS f""").ToListAsync(ct);

    /// <summary>Total de compras y total pagado por un cliente en un período. (<c>f_consolidacion_5</c>)</summary>
    public Task<List<ResumenClienteRow>> ResumenCliente(string rut, DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ResumenClienteRow>($"""SELECT f.rut AS "Rut", f.totalcompras AS "TotalCompras", f.totalpagado AS "TotalPagado", f.calificadescuento AS "CalificaDescuento" FROM f_consolidacion_5({rut}::varchar, {inicio}::date, {fin}::date) AS f""").ToListAsync(ct);

    /// <summary>Total de ventas por artículo y vendedor en un período. (<c>f_consolidacion_6</c>)</summary>
    public Task<List<VentasPorArticuloVendedorRow>> VentasPorArticuloVendedor(DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<VentasPorArticuloVendedorRow>($"""SELECT f.rutvendedor AS "RutVendedor", f.vendedor AS "Vendedor", f.articulo AS "Articulo", f.totalvendido AS "TotalVendido" FROM f_consolidacion_6({inicio}::date, {fin}::date) AS f""").ToListAsync(ct);

    /// <summary>Volumen de ventas: fines de semana vs. días hábiles. (<c>f_consolidacion_7</c>)</summary>
    public Task<List<VentasFinDeSemanaVsHabilesRow>> VentasFinDeSemanaVsHabiles(DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<VentasFinDeSemanaVsHabilesRow>($"""SELECT f.tipodia AS "TipoDia", f.totalventas AS "TotalVentas", f.totalvendido AS "TotalVendido" FROM f_consolidacion_7({inicio}::date, {fin}::date) AS f""").ToListAsync(ct);

    /// <summary>Variación porcentual de ingresos: mes de la fecha vs. mes anterior. (<c>f_consolidacion_8</c>)</summary>
    public Task<List<VariacionIngresosRow>> VariacionIngresos(DateOnly fecha, CancellationToken ct = default) =>
        _db.Database.SqlQuery<VariacionIngresosRow>($"""SELECT f.ingresomesactual AS "IngresoMesActual", f.ingresomesanterior AS "IngresoMesAnterior", f.variacionporcentual AS "VariacionPorcentual" FROM f_consolidacion_8({fecha}::date) AS f""").ToListAsync(ct);

    /// <summary>Ventas con descuento aplicado en un año. (<c>f_consolidacion_9</c>)</summary>
    public Task<List<VentasConDescuentoRow>> VentasConDescuento(int anio, CancellationToken ct = default) =>
        _db.Database.SqlQuery<VentasConDescuentoRow>($"""SELECT f.id_venta AS "IdVenta", f.fecha AS "Fecha", f.valorbruto AS "ValorBruto", f.cliente AS "Cliente", f.preciooferta AS "PrecioOferta" FROM f_consolidacion_9({anio}::integer) AS f""").ToListAsync(ct);

    /// <summary>Ciudades donde se ha contratado un servicio. (<c>f_georreferenciacion_1</c>)</summary>
    public Task<List<CiudadesPorServicioRow>> CiudadesPorServicio(string servicio, CancellationToken ct = default) =>
        _db.Database.SqlQuery<CiudadesPorServicioRow>($"""SELECT f.ciudad AS "Ciudad" FROM f_georreferenciacion_1({servicio}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Ciudades donde se ha comprado un producto. (<c>f_georreferenciacion_2</c>)</summary>
    public Task<List<CiudadesPorProductoRow>> CiudadesPorProducto(string producto, CancellationToken ct = default) =>
        _db.Database.SqlQuery<CiudadesPorProductoRow>($"""SELECT f.ciudad AS "Ciudad" FROM f_georreferenciacion_2({producto}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Vendedores y sus productos (opcionalmente de un vendedor). (<c>f_georreferenciacion_3</c>)</summary>
    public Task<List<VendedoresProductosRow>> VendedoresProductos(string? rutVendedor = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<VendedoresProductosRow>($"""SELECT f.vendedor AS "Vendedor", f.producto AS "Producto" FROM f_georreferenciacion_3({rutVendedor}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Promedio de días de despacho por empresa de transporte. (<c>f_georreferenciacion_4</c>)</summary>
    public Task<List<PromedioDiasPorEmpresaRow>> PromedioDiasPorEmpresa(CancellationToken ct = default) =>
        _db.Database.SqlQuery<PromedioDiasPorEmpresaRow>($"""SELECT f.empresatransporte AS "EmpresaTransporte", f.promediodias AS "PromedioDias" FROM f_georreferenciacion_4() AS f""").ToListAsync(ct);

    /// <summary>Volumen de despachos por región según peso mínimo. (<c>f_georreferenciacion_5</c>)</summary>
    public Task<List<VolumenPorRegionRow>> VolumenPorRegion(decimal pesoMinimo = 10m, CancellationToken ct = default) =>
        _db.Database.SqlQuery<VolumenPorRegionRow>($"""SELECT f.region AS "Region", f.volumen AS "Volumen" FROM f_georreferenciacion_5({pesoMinimo}::numeric) AS f""").ToListAsync(ct);

    /// <summary>Listado de comunas y direcciones. (<c>f_georreferenciacion_7</c>)</summary>
    public Task<List<DireccionesRow>> Direcciones(CancellationToken ct = default) =>
        _db.Database.SqlQuery<DireccionesRow>($"""SELECT f.comuna AS "Comuna", f.calle AS "Calle", f.numero AS "Numero" FROM f_georreferenciacion_7() AS f""").ToListAsync(ct);

    /// <summary>Producto más vendido de un vendedor. (<c>f_fidelizacion_1</c>)</summary>
    public Task<List<ProductoMasVendidoRow>> ProductoMasVendido(string rutVendedor, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ProductoMasVendidoRow>($"""SELECT f.idproducto AS "IdProducto", f.nombreproducto AS "NombreProducto", f.cantidadventas AS "CantidadVentas" FROM f_fidelizacion_1({rutVendedor}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Servicio más vendido de un vendedor. (<c>f_fidelizacion_2</c>)</summary>
    public Task<List<ServicioMasVendidoRow>> ServicioMasVendido(string rutVendedor, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ServicioMasVendidoRow>($"""SELECT f.idservicio AS "IdServicio", f.nombreservicio AS "NombreServicio", f.cantidadventas AS "CantidadVentas" FROM f_fidelizacion_2({rutVendedor}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Cantidad de preguntas sin responder de un producto. (<c>f_fidelizacion_3</c>)</summary>
    public Task<int> PreguntasSinResponder(int idProducto, CancellationToken ct = default) =>
        _db.Database.SqlQuery<int>($"""SELECT f_fidelizacion_3({idProducto}::integer) AS "Value" """).SingleAsync(ct);

    /// <summary>Productos de un vendedor con promedio de calificación >= 4. (<c>f_fidelizacion_4</c>)</summary>
    public Task<List<ProductosMejorCalificadosRow>> ProductosMejorCalificados(string rutVendedor, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ProductosMejorCalificadosRow>($"""SELECT f.idproducto AS "IdProducto", f.nombreproducto AS "NombreProducto", f.promediocalificacion AS "PromedioCalificacion" FROM f_fidelizacion_4({rutVendedor}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Vendedores con productos o servicios con promedio < 3. (<c>f_fidelizacion_5</c>)</summary>
    public Task<List<VendedoresBajaCalificacionRow>> VendedoresBajaCalificacion(CancellationToken ct = default) =>
        _db.Database.SqlQuery<VendedoresBajaCalificacionRow>($"""SELECT f.rut AS "Rut", f.nombre AS "Nombre" FROM f_fidelizacion_5() AS f""").ToListAsync(ct);

    /// <summary>Vendedores de servicios sin calificaciones en los últimos 6 meses. (<c>f_fidelizacion_6</c>)</summary>
    public Task<List<VendedoresServiciosSinCalificacionesRow>> VendedoresServiciosSinCalificaciones(CancellationToken ct = default) =>
        _db.Database.SqlQuery<VendedoresServiciosSinCalificacionesRow>($"""SELECT f.rut AS "Rut", f.nombre AS "Nombre" FROM f_fidelizacion_6() AS f""").ToListAsync(ct);

    /// <summary>Calificaciones cuyo comentario contiene una palabra. (<c>f_fidelizacion_7</c>)</summary>
    public Task<List<ComentariosPorPalabraRow>> ComentariosPorPalabra(string palabra, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ComentariosPorPalabraRow>($"""SELECT f.rutvendedor AS "RutVendedor", f.vendedor AS "Vendedor", f.idproducto AS "IdProducto", f.producto AS "Producto", f.calificacion AS "Calificacion", f.comentario AS "Comentario" FROM f_fidelizacion_7({palabra}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Usuarios con más de 10 calificaciones escritas. (<c>f_fidelizacion_8</c>)</summary>
    public Task<List<UsuariosMasActivosCalificandoRow>> UsuariosMasActivosCalificando(CancellationToken ct = default) =>
        _db.Database.SqlQuery<UsuariosMasActivosCalificandoRow>($"""SELECT f.rut AS "Rut", f.nombre AS "Nombre", f.totalcalificaciones AS "TotalCalificaciones" FROM f_fidelizacion_8() AS f""").ToListAsync(ct);

    /// <summary>Tiempo promedio de respuesta a preguntas de un vendedor. (<c>f_fidelizacion_9</c>)</summary>
    public Task<TimeSpan?> TiempoPromedioRespuesta(string rutVendedor, CancellationToken ct = default) =>
        _db.Database.SqlQuery<TimeSpan?>($"""SELECT f_fidelizacion_9({rutVendedor}::varchar) AS "Value" """).SingleAsync(ct);

    /// <summary>Mensajes sin respuesta con más de 48 horas. (<c>f_fidelizacion_10</c>)</summary>
    public Task<List<MensajesSinResponder48hRow>> MensajesSinResponder48h(CancellationToken ct = default) =>
        _db.Database.SqlQuery<MensajesSinResponder48hRow>($"""SELECT f.idmensaje AS "IdMensaje", f.contenido AS "Contenido", f.fechaenvio AS "FechaEnvio", f.vendedor AS "Vendedor", f.cliente AS "Cliente", f.idventa AS "IdVenta" FROM f_fidelizacion_10() AS f""").ToListAsync(ct);

    /// <summary>Valor de una característica JSON de los productos de una categoría. (<c>f_json_1</c>)</summary>
    public Task<List<ValorCaracteristicaRow>> ValorCaracteristica(string caracteristica, string categoria, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ValorCaracteristicaRow>($"""SELECT f.id AS "Id", f.nombre AS "Nombre", f.valor AS "Valor" FROM f_json_1({caracteristica}::text, {categoria}::text) AS f""").ToListAsync(ct);

    /// <summary>Servicios filtrados por modalidad (ej. Remoto). (<c>f_json_2</c>)</summary>
    public Task<List<ServiciosPorModalidadRow>> ServiciosPorModalidad(string modalidad, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ServiciosPorModalidadRow>($"""SELECT f.id AS "Id", f.nombre AS "Nombre", f.modalidad AS "Modalidad" FROM f_json_2({modalidad}::text) AS f""").ToListAsync(ct);

    /// <summary>Peso promedio de productos en inventario. (<c>f_json_3</c>)</summary>
    public Task<List<PesoPromedioInventarioRow>> PesoPromedioInventario(CancellationToken ct = default) =>
        _db.Database.SqlQuery<PesoPromedioInventarioRow>($"""SELECT f.id_inventario AS "IdInventario", f.peso_promedio AS "PesoPromedio" FROM f_json_3() AS f""").ToListAsync(ct);

    /// <summary>Productos de una categoría (y subcategorías) sin cierta llave JSON. (<c>f_json_4</c>)</summary>
    public Task<List<ProductosSinCaracteristicaRow>> ProductosSinCaracteristica(string categoria, string llave, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ProductosSinCaracteristicaRow>($"""SELECT f.id_producto AS "IdProducto", f.nombre AS "Nombre" FROM f_json_4({categoria}::text, {llave}::text) AS f""").ToListAsync(ct);

    /// <summary>Variantes de color/talla/dimensiones desnormalizadas. (<c>f_json_5</c>)</summary>
    public Task<List<VariantesColorTallaRow>> VariantesColorTalla(CancellationToken ct = default) =>
        _db.Database.SqlQuery<VariantesColorTallaRow>($"""SELECT f.id_producto AS "IdProducto", f.nombre AS "Nombre", f.color AS "Color", f.talla AS "Talla", f.altura AS "Altura", f.ancho AS "Ancho" FROM f_json_5() AS f""").ToListAsync(ct);

    /// <summary>Productos con dimensiones declaradas en el JSON. (<c>f_json_6</c>)</summary>
    public Task<List<ProductosConDimensionesRow>> ProductosConDimensiones(CancellationToken ct = default) =>
        _db.Database.SqlQuery<ProductosConDimensionesRow>($"""SELECT f.id AS "Id", f.nombre AS "Nombre" FROM f_json_6() AS f""").ToListAsync(ct);

    /// <summary>Servicios no contratados en el período. (<c>f_exclusion_1</c>)</summary>
    public Task<List<ServiciosNoContratadosRow>> ServiciosNoContratados(DateOnly inicio, DateOnly fin, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ServiciosNoContratadosRow>($"""SELECT f.id_servicio AS "IdServicio", f.nombre AS "Nombre" FROM f_exclusion_1({inicio}::date, {fin}::date) AS f""").ToListAsync(ct);

    /// <summary>Total de pedidos de un vendedor por categoría. (<c>f_exclusion_2</c>)</summary>
    public Task<List<PedidosPorVendedorCategoriaRow>> PedidosPorVendedorCategoria(string rutVendedor, string categoria, CancellationToken ct = default) =>
        _db.Database.SqlQuery<PedidosPorVendedorCategoriaRow>($"""SELECT f.rutvendedor AS "RutVendedor", f.nombrevendedor AS "NombreVendedor", f.categoria AS "Categoria", f.total_pedidos AS "TotalPedidos" FROM f_exclusion_2({rutVendedor}::varchar, {categoria}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Clientes a los que un vendedor ha realizado un negocio. (<c>f_exclusion_3</c>)</summary>
    public Task<List<ClientesDeVendedorRow>> ClientesDeVendedor(string rutVendedor, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ClientesDeVendedorRow>($"""SELECT f.rut_cliente AS "RutCliente", f.nombre_cliente AS "NombreCliente", f.compras AS "Compras" FROM f_exclusion_3({rutVendedor}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Usuarios que son clientes y emprendedores a la vez. (<c>f_exclusion_4</c>)</summary>
    public Task<List<UsuariosRolDualRow>> UsuariosRolDual(CancellationToken ct = default) =>
        _db.Database.SqlQuery<UsuariosRolDualRow>($"""SELECT f.rut AS "Rut", f.nombre AS "Nombre", f.roldual AS "RolDual", f.compras_realizadas AS "ComprasRealizadas", f.productos_ofrecidos AS "ProductosOfrecidos", f.servicios_ofrecidos AS "ServiciosOfrecidos" FROM f_exclusion_4() AS f""").ToListAsync(ct);

    /// <summary>Clientes activos con productos en lista de deseos que no han comprado (NOT IN). (<c>f_exclusion_5</c>)</summary>
    public Task<List<ClientesActivosSinComprasRow>> ClientesActivosSinCompras(CancellationToken ct = default) =>
        _db.Database.SqlQuery<ClientesActivosSinComprasRow>($"""SELECT f.rut_cliente AS "RutCliente", f.nombre_cliente AS "NombreCliente", f.tipo AS "Tipo" FROM f_exclusion_5() AS f""").ToListAsync(ct);

    /// <summary>Categorías sin subcategorías ni productos. (<c>f_exclusion_6</c>)</summary>
    public Task<List<CategoriasVaciasRow>> CategoriasVacias(CancellationToken ct = default) =>
        _db.Database.SqlQuery<CategoriasVaciasRow>($"""SELECT f.id_categoria AS "IdCategoria", f.nombre_categoria AS "NombreCategoria" FROM f_exclusion_6() AS f""").ToListAsync(ct);

    /// <summary>División relacional: clientes que compraron en todas las subcategorías de una categoría. (<c>f_exclusion_7</c>)</summary>
    public Task<List<ClientesTodasCategoriasRow>> ClientesTodasCategorias(int idCategoriaPrincipal, bool soloCumplen = true, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ClientesTodasCategoriasRow>($"""SELECT f.rut_cliente AS "RutCliente", f.nombre_cliente AS "NombreCliente", f.categorias_compradas AS "CategoriasCompradas", f.total_categorias AS "TotalCategorias", f.cumple AS "Cumple" FROM f_exclusion_7({idCategoriaPrincipal}::integer, {soloCumplen}::boolean) AS f""").ToListAsync(ct);

    /// <summary>Servicios ofrecidos en múltiples regiones. (<c>f_exclusion_8</c>)</summary>
    public Task<List<ServiciosMultiRegionRow>> ServiciosMultiRegion(int idCategoria, int minRegiones = 2, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ServiciosMultiRegionRow>($"""SELECT f.id_servicio AS "IdServicio", f.nombre_servicio AS "NombreServicio", f.regiones AS "Regiones" FROM f_exclusion_8({idCategoria}::integer, {minRegiones}::integer) AS f""").ToListAsync(ct);

    /// <summary>Productos comprados frecuentemente en una misma orden. (<c>f_exclusion_9</c>)</summary>
    public Task<List<ProductosCompradosJuntosRow>> ProductosCompradosJuntos(int minVeces = 1, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ProductosCompradosJuntosRow>($"""SELECT f.producto_a AS "ProductoA", f.producto_b AS "ProductoB", f.veces_comprados_juntos AS "VecesCompradosJuntos" FROM f_exclusion_9({minVeces}::integer) AS f""").ToListAsync(ct);

    /// <summary>Devoluciones por cliente (o de un cliente si se indica su rut). (<c>f_inventario_1</c>)</summary>
    public Task<List<DevolucionesPorClienteRow>> DevolucionesPorCliente(string? rut = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<DevolucionesPorClienteRow>($"""SELECT f.cliente AS "Cliente", f.producto AS "Producto", f.motivo AS "Motivo" FROM f_inventario_1({rut}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Productos en oferta según estado de la oferta. (<c>f_inventario_2</c>)</summary>
    public Task<List<ProductosEnOfertaRow>> ProductosEnOferta(bool estado = true, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ProductosEnOfertaRow>($"""SELECT f.idproducto AS "IdProducto", f.nombreproducto AS "NombreProducto", f.preciooriginal AS "PrecioOriginal", f.fechainicio AS "FechaInicio", f.fechafin AS "FechaFin", f.idoferta AS "IdOferta", f.preciooferta AS "PrecioOferta", f.estadooferta AS "EstadoOferta" FROM f_inventario_2({estado}::boolean) AS f""").ToListAsync(ct);

    /// <summary>Capital total reintegrado por devoluciones en un año. (<c>f_inventario_3</c>)</summary>
    public Task<decimal?> CapitalReintegrado(int anio, CancellationToken ct = default) =>
        _db.Database.SqlQuery<decimal?>($"""SELECT f_inventario_3({anio}::integer) AS "Value" """).SingleAsync(ct);

    /// <summary>Listas de deseos con ofertas vigentes hasta la fecha indicada. (<c>f_inventario_4</c>)</summary>
    public Task<List<DeseosConOfertaRow>> DeseosConOferta(DateOnly fecha, CancellationToken ct = default) =>
        _db.Database.SqlQuery<DeseosConOfertaRow>($"""SELECT f.rut AS "Rut", f.nombreusuario AS "NombreUsuario", f.nombrelista AS "NombreLista", f.nombreproducto AS "NombreProducto", f.preciooferta AS "PrecioOferta", f.fechafin AS "FechaFin" FROM f_inventario_4({fecha}::date) AS f""").ToListAsync(ct);

    /// <summary>Tasa porcentual de devoluciones por emprendedor. (<c>f_inventario_5</c>)</summary>
    public Task<List<TasaDevolucionesEmprendedorRow>> TasaDevolucionesEmprendedor(CancellationToken ct = default) =>
        _db.Database.SqlQuery<TasaDevolucionesEmprendedorRow>($"""SELECT f.emprendedor AS "Emprendedor", f.ventas AS "Ventas", f.devoluciones AS "Devoluciones", f.porcentajedevoluciones AS "PorcentajeDevoluciones" FROM f_inventario_5() AS f""").ToListAsync(ct);

    /// <summary>Productos con más variantes de color y stock que los umbrales. (<c>f_inventario_6</c>)</summary>
    public Task<List<ProductosStockColoresRow>> ProductosStockColores(int minColores = 1, long minStock = 10, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ProductosStockColoresRow>($"""SELECT f.nombreproducto AS "NombreProducto", f.variantescolor AS "VariantesColor", f.inventariototal AS "InventarioTotal" FROM f_inventario_6({minColores}::integer, {minStock}::bigint) AS f""").ToListAsync(ct);

    /// <summary>Ventas anuladas según medio de pago. (<c>f_inventario_7</c>)</summary>
    public Task<List<VentasAnuladasRow>> VentasAnuladas(string medioPago, CancellationToken ct = default) =>
        _db.Database.SqlQuery<VentasAnuladasRow>($"""SELECT f.idventa AS "IdVenta", f.fecha AS "Fecha", f.estado AS "Estado", f.mediopago AS "MedioPago", f.codigotransferencia AS "CodigoTransferencia" FROM f_inventario_7({medioPago}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Tasa de conversión de lista de deseos a ventas (todos los productos o uno). (<c>f_inventario_8</c>)</summary>
    public Task<List<ConversionListaDeseosRow>> ConversionListaDeseos(int? idProducto = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<ConversionListaDeseosRow>($"""SELECT f.idproducto AS "IdProducto", f.nombreproducto AS "NombreProducto", f.vecesguardado AS "VecesGuardado", f.ventasrealizadas AS "VentasRealizadas", f.tasaconversion AS "TasaConversion" FROM f_inventario_8({idProducto}::integer) AS f""").ToListAsync(ct);

    /// <summary>Edad de los usuarios, filtrando menores/mayores de un límite. (<c>f_validacion_1</c>)</summary>
    public Task<List<EdadClientesRow>> EdadClientes(int edadLimite = 18, bool soloMenores = true, CancellationToken ct = default) =>
        _db.Database.SqlQuery<EdadClientesRow>($"""SELECT f.rut_usuario AS "RutUsuario", f.nombre_usuario AS "NombreUsuario", f.tipo_usuario AS "TipoUsuario", f.fecha_nacimiento AS "FechaNacimiento", f.edad_anios AS "EdadAnios" FROM f_validacion_1({edadLimite}::integer, {soloMenores}::boolean) AS f""").ToListAsync(ct);

    /// <summary>Clientes agrupados por tramos de edad. (<c>f_validacion_3</c>)</summary>
    public Task<List<GruposEtariosRow>> GruposEtarios(int anchoGrupo = 10, DateOnly? fechaDesde = null, DateOnly? fechaHasta = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<GruposEtariosRow>($"""SELECT f.grupo_etario AS "GrupoEtario", f.cantidad_clientes AS "CantidadClientes" FROM f_validacion_3({anchoGrupo}::integer, {fechaDesde}::date, {fechaHasta}::date) AS f""").ToListAsync(ct);

    /// <summary>Emprendedores y su empresa asociada. (<c>f_validacion_5</c>)</summary>
    public Task<List<EmprendedoresEmpresaRow>> EmprendedoresEmpresa(CancellationToken ct = default) =>
        _db.Database.SqlQuery<EmprendedoresEmpresaRow>($"""SELECT f.rutemprendedor AS "RutEmprendedor", f.nombreempendedor AS "NombreEmpendedor", f.rutempresa AS "RutEmpresa", f.nombreempresa AS "NombreEmpresa", f.paginaweb AS "PaginaWeb" FROM f_validacion_5() AS f""").ToListAsync(ct);

    /// <summary>Direcciones de despacho que cumplen la condición de la función. (<c>f_validacion_6</c>)</summary>
    public Task<List<DireccionesDespachoRow>> DireccionesDespacho(CancellationToken ct = default) =>
        _db.Database.SqlQuery<DireccionesDespachoRow>($"""SELECT f.id AS "Id", f.numero AS "Numero", f.calle AS "Calle", f.descripcion AS "Descripcion", f.pasaje AS "Pasaje", f.sector AS "Sector", f.id_comuna AS "IdComuna" FROM f_validacion_6() AS f""").ToListAsync(ct);

    /// <summary>Emprendedores > 60 años que ofrecen servicios educativos presenciales. (<c>f_validacion_7</c>)</summary>
    public Task<List<EmprendedoresMayores60Row>> EmprendedoresMayores60(CancellationToken ct = default) =>
        _db.Database.SqlQuery<EmprendedoresMayores60Row>($"""SELECT f.rut AS "Rut", f.nombre AS "Nombre", f.edadanios AS "EdadAnios", f.servicio AS "Servicio", f.modalidad AS "Modalidad", f.categoria AS "Categoria" FROM f_validacion_7() AS f""").ToListAsync(ct);

    /// <summary>Medios de pago registrados bajo una marca (Visa / Mastercard / Transferencia). (<c>f_validacion_8</c>)</summary>
    public Task<List<MediosPagoRow>> MediosPago(string medioEvaluado, CancellationToken ct = default) =>
        _db.Database.SqlQuery<MediosPagoRow>($"""SELECT f.id AS "Id", f.mediopago AS "MedioPago", f.ult4digitostarjeta AS "Ult4DigitosTarjeta", f.codigotransferencia AS "CodigoTransferencia" FROM f_validacion_8({medioEvaluado}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Factura fiscal de una venta (si idVenta es null, todas). (<c>f_logicas_1</c>)</summary>
    public Task<List<FacturaRow>> Factura(int? idVenta = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<FacturaRow>($"""SELECT f.folio_factura AS "FolioFactura", f.fecha_emision AS "FechaEmision", f.rut_cliente AS "RutCliente", f.nombre_cliente AS "NombreCliente", f.valor_neto AS "ValorNeto", f.tasa_iva AS "TasaIva", f.monto_iva AS "MontoIva", f.monto_descuento AS "MontoDescuento", f.recargo_envio AS "RecargoEnvio", f.total_a_pagar AS "TotalAPagar" FROM f_logicas_1({idVenta}::integer) AS f""").ToListAsync(ct);

    /// <summary>Rendimiento trimestral de un vendedor en un año. (<c>f_logicas_3</c>)</summary>
    public Task<List<RendimientoVendedorRow>> RendimientoVendedor(int anio, string idVendedor, CancellationToken ct = default) =>
        _db.Database.SqlQuery<RendimientoVendedorRow>($"""SELECT f.id_vendedor AS "IdVendedor", f.anio AS "Anio", f.trimestre AS "Trimestre", f.facturacion_acumulada AS "FacturacionAcumulada", f.categoria_rendimiento AS "CategoriaRendimiento" FROM f_logicas_3({anio}::integer, {idVendedor}::varchar) AS f""").ToListAsync(ct);

    /// <summary>Life-Time Value de clientes con un mínimo de transacciones. (<c>f_logicas_4</c>)</summary>
    public Task<List<LtvClientesRow>> LtvClientes(int minTransacciones = 1, CancellationToken ct = default) =>
        _db.Database.SqlQuery<LtvClientesRow>($"""SELECT f.rut_cliente AS "RutCliente", f.nombre_cliente AS "NombreCliente", f.total_transacciones AS "TotalTransacciones", f.ltv AS "Ltv", f.ticket_promedio AS "TicketPromedio", f.primera_compra AS "PrimeraCompra", f.ultima_compra AS "UltimaCompra", f.antiguedad_dias AS "AntiguedadDias" FROM f_logicas_4({minTransacciones}::integer) AS f""").ToListAsync(ct);

    /// <summary>Jerarquía de categorías desde una raíz (null = todas). (<c>f_logicas_5</c>)</summary>
    public Task<List<JerarquiaCategoriasRow>> JerarquiaCategorias(int? idRaiz = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<JerarquiaCategoriasRow>($"""SELECT f.id_cat AS "IdCat", f.nombre_cat AS "NombreCat", f.id_cat_padre AS "IdCatPadre", f.nivel AS "Nivel" FROM f_logicas_5({idRaiz}::integer) AS f""").ToListAsync(ct);

    /// <summary>Utilidad operativa proyectada con una comisión dada (ej. 0.05). (<c>f_logicas_6</c>)</summary>
    public Task<List<UtilidadProyectadaRow>> UtilidadProyectada(decimal comision, CancellationToken ct = default) =>
        _db.Database.SqlQuery<UtilidadProyectadaRow>($"""SELECT f.utilidadproyectada AS "UtilidadProyectada" FROM f_logicas_6({comision}::numeric) AS f""").ToListAsync(ct);

    /// <summary>Empresas agrupadas por giro (null = todos). (<c>f_logicas_7</c>)</summary>
    public Task<List<EmpresasPorGiroRow>> EmpresasPorGiro(string? giro = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<EmpresasPorGiroRow>($"""SELECT f.giro_empresa AS "GiroEmpresa", f.cantidad_empresas AS "CantidadEmpresas", f.cantidad_comunas AS "CantidadComunas", f.superficie_total_km2 AS "SuperficieTotalKm2" FROM f_logicas_7({giro}::text) AS f""").ToListAsync(ct);

    /// <summary>Promedio diario de nuevos clientes en un rango de fechas. (<c>f_logicas_8</c>)</summary>
    public Task<List<PromedioNuevosClientesRow>> PromedioNuevosClientes(DateOnly fechaDesde, DateOnly fechaHasta, CancellationToken ct = default) =>
        _db.Database.SqlQuery<PromedioNuevosClientesRow>($"""SELECT f.promedio_diario_nuevos_clientes AS "PromedioDiarioNuevosClientes" FROM f_logicas_8({fechaDesde}::date, {fechaHasta}::date) AS f""").ToListAsync(ct);

    /// <summary>Catálogo unificado de productos y servicios con disponibilidad. (<c>f_logicas_10</c>)</summary>
    public Task<List<CatalogoUnificadoRow>> CatalogoUnificado(string? busqueda = null, bool soloDisponibles = false, CancellationToken ct = default) =>
        _db.Database.SqlQuery<CatalogoUnificadoRow>($"""SELECT f.tipo_bien AS "TipoBien", f.id_bien AS "IdBien", f.nombre_bien AS "NombreBien", f.restriccion_edad AS "RestriccionEdad", f.categorias_bien AS "CategoriasBien", f.id_oferta_bien AS "IdOfertaBien", f.fecha_inicio_bien AS "FechaInicioBien", f.fecha_fin_bien AS "FechaFinBien", f.stock_disponible AS "StockDisponible", f.disponibilidad_bien AS "DisponibilidadBien" FROM f_logicas_10({busqueda}::text, {soloDisponibles}::boolean) AS f""").ToListAsync(ct);

    /// <summary>Ejecuta <c>f_dml</c>. Devuelve la cantidad de filas afectadas.</summary>
    public Task<int> Dml(string tabla, string operacion, string datosJson = "{}", string? filtroJson = null, CancellationToken ct = default) =>
        _db.Database.SqlQuery<int>($"""SELECT f_dml({tabla}::text, {operacion}::text, {datosJson}::jsonb, {filtroJson}::jsonb) AS "Value" """).SingleAsync(ct);

    /// <summary>Costo de un envío con una empresa de despacho (tarifa en su JSON). (<c>fn_costo_envio</c>, bd_proyecto/envio_por_empresa.sql)</summary>
    public Task<decimal> CostoEnvio(int? idEmpresa, decimal ancho, decimal alto, decimal fondo, decimal pesoKg, CancellationToken ct = default) =>
        _db.Database.SqlQuery<decimal>($"""SELECT fn_costo_envio({idEmpresa}::integer, {ancho}::numeric, {alto}::numeric, {fondo}::numeric, {pesoKg}::numeric) AS "Value" """).SingleAsync(ct);
}
