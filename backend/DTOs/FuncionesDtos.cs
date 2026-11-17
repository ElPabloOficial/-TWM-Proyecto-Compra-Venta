// Código generado para integrar las funciones PostgreSQL (bd_proyecto/funciones.txt)
#nullable enable
// Una clase por cada función que devuelve RETURNS TABLE. Los nombres de propiedad
// coinciden con los alias de la consulta del servicio (SELECT col AS "Propiedad").
namespace backend.DTOs.Funciones;

/// <summary>Fila devuelta por <c>f_consolidacion_2</c>.</summary>
public class ClientesPorProductoRow
{
    public string? Rut { get; set; }
    public string? Nombre { get; set; }
}

/// <summary>Fila devuelta por <c>f_consolidacion_4</c>.</summary>
public class ClientesPorServicioRow
{
    public string? Rut { get; set; }
    public string? Nombre { get; set; }
}

/// <summary>Fila devuelta por <c>f_consolidacion_5</c>.</summary>
public class ResumenClienteRow
{
    public string? Rut { get; set; }
    public long? TotalCompras { get; set; }
    public decimal? TotalPagado { get; set; }
    public bool? CalificaDescuento { get; set; }
}

/// <summary>Fila devuelta por <c>f_consolidacion_6</c>.</summary>
public class VentasPorArticuloVendedorRow
{
    public string? RutVendedor { get; set; }
    public string? Vendedor { get; set; }
    public string? Articulo { get; set; }
    public decimal? TotalVendido { get; set; }
}

/// <summary>Fila devuelta por <c>f_consolidacion_7</c>.</summary>
public class VentasFinDeSemanaVsHabilesRow
{
    public string? TipoDia { get; set; }
    public long? TotalVentas { get; set; }
    public decimal? TotalVendido { get; set; }
}

/// <summary>Fila devuelta por <c>f_consolidacion_8</c>.</summary>
public class VariacionIngresosRow
{
    public decimal? IngresoMesActual { get; set; }
    public decimal? IngresoMesAnterior { get; set; }
    public decimal? VariacionPorcentual { get; set; }
}

/// <summary>Fila devuelta por <c>f_consolidacion_9</c>.</summary>
public class VentasConDescuentoRow
{
    public int? IdVenta { get; set; }
    public DateTime? Fecha { get; set; }
    public decimal? ValorBruto { get; set; }
    public string? Cliente { get; set; }
    public decimal? PrecioOferta { get; set; }
}

/// <summary>Fila devuelta por <c>f_georreferenciacion_1</c>.</summary>
public class CiudadesPorServicioRow
{
    public string? Ciudad { get; set; }
}

/// <summary>Fila devuelta por <c>f_georreferenciacion_2</c>.</summary>
public class CiudadesPorProductoRow
{
    public string? Ciudad { get; set; }
}

/// <summary>Fila devuelta por <c>f_georreferenciacion_3</c>.</summary>
public class VendedoresProductosRow
{
    public string? Vendedor { get; set; }
    public string? Producto { get; set; }
}

/// <summary>Fila devuelta por <c>f_georreferenciacion_4</c>.</summary>
public class PromedioDiasPorEmpresaRow
{
    public string? EmpresaTransporte { get; set; }
    public decimal? PromedioDias { get; set; }
}

/// <summary>Fila devuelta por <c>f_georreferenciacion_5</c>.</summary>
public class VolumenPorRegionRow
{
    public string? Region { get; set; }
    public long? Volumen { get; set; }
}

/// <summary>Fila devuelta por <c>f_georreferenciacion_7</c>.</summary>
public class DireccionesRow
{
    public string? Comuna { get; set; }
    public string? Calle { get; set; }
    public int? Numero { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_1</c>.</summary>
public class ProductoMasVendidoRow
{
    public int? IdProducto { get; set; }
    public string? NombreProducto { get; set; }
    public long? CantidadVentas { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_2</c>.</summary>
public class ServicioMasVendidoRow
{
    public int? IdServicio { get; set; }
    public string? NombreServicio { get; set; }
    public long? CantidadVentas { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_4</c>.</summary>
public class ProductosMejorCalificadosRow
{
    public int? IdProducto { get; set; }
    public string? NombreProducto { get; set; }
    public decimal? PromedioCalificacion { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_5</c>.</summary>
public class VendedoresBajaCalificacionRow
{
    public string? Rut { get; set; }
    public string? Nombre { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_6</c>.</summary>
public class VendedoresServiciosSinCalificacionesRow
{
    public string? Rut { get; set; }
    public string? Nombre { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_7</c>.</summary>
public class ComentariosPorPalabraRow
{
    public string? RutVendedor { get; set; }
    public string? Vendedor { get; set; }
    public int? IdProducto { get; set; }
    public string? Producto { get; set; }
    public int? Calificacion { get; set; }
    public string? Comentario { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_8</c>.</summary>
public class UsuariosMasActivosCalificandoRow
{
    public string? Rut { get; set; }
    public string? Nombre { get; set; }
    public long? TotalCalificaciones { get; set; }
}

/// <summary>Fila devuelta por <c>f_fidelizacion_10</c>.</summary>
public class MensajesSinResponder48hRow
{
    public int? IdMensaje { get; set; }
    public string? Contenido { get; set; }
    public DateOnly? FechaEnvio { get; set; }
    public string? Vendedor { get; set; }
    public string? Cliente { get; set; }
    public int? IdVenta { get; set; }
}

/// <summary>Fila devuelta por <c>f_json_1</c>.</summary>
public class ValorCaracteristicaRow
{
    public int? Id { get; set; }
    public string? Nombre { get; set; }
    public string? Valor { get; set; }
}

/// <summary>Fila devuelta por <c>f_json_2</c>.</summary>
public class ServiciosPorModalidadRow
{
    public int? Id { get; set; }
    public string? Nombre { get; set; }
    public string? Modalidad { get; set; }
}

/// <summary>Fila devuelta por <c>f_json_3</c>.</summary>
public class PesoPromedioInventarioRow
{
    public int? IdInventario { get; set; }
    public decimal? PesoPromedio { get; set; }
}

/// <summary>Fila devuelta por <c>f_json_4</c>.</summary>
public class ProductosSinCaracteristicaRow
{
    public int? IdProducto { get; set; }
    public string? Nombre { get; set; }
}

/// <summary>Fila devuelta por <c>f_json_5</c>.</summary>
public class VariantesColorTallaRow
{
    public int? IdProducto { get; set; }
    public string? Nombre { get; set; }
    public string? Color { get; set; }
    public string? Talla { get; set; }
    public string? Altura { get; set; }
    public string? Ancho { get; set; }
}

/// <summary>Fila devuelta por <c>f_json_6</c>.</summary>
public class ProductosConDimensionesRow
{
    public int? Id { get; set; }
    public string? Nombre { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_1</c>.</summary>
public class ServiciosNoContratadosRow
{
    public int? IdServicio { get; set; }
    public string? Nombre { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_2</c>.</summary>
public class PedidosPorVendedorCategoriaRow
{
    public string? RutVendedor { get; set; }
    public string? NombreVendedor { get; set; }
    public string? Categoria { get; set; }
    public int? TotalPedidos { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_3</c>.</summary>
public class ClientesDeVendedorRow
{
    public string? RutCliente { get; set; }
    public string? NombreCliente { get; set; }
    public long? Compras { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_4</c>.</summary>
public class UsuariosRolDualRow
{
    public string? Rut { get; set; }
    public string? Nombre { get; set; }
    public string? RolDual { get; set; }
    public long? ComprasRealizadas { get; set; }
    public long? ProductosOfrecidos { get; set; }
    public long? ServiciosOfrecidos { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_5</c>.</summary>
public class ClientesActivosSinComprasRow
{
    public string? RutCliente { get; set; }
    public string? NombreCliente { get; set; }
    public string? Tipo { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_6</c>.</summary>
public class CategoriasVaciasRow
{
    public int? IdCategoria { get; set; }
    public string? NombreCategoria { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_7</c>.</summary>
public class ClientesTodasCategoriasRow
{
    public string? RutCliente { get; set; }
    public string? NombreCliente { get; set; }
    public long? CategoriasCompradas { get; set; }
    public long? TotalCategorias { get; set; }
    public bool? Cumple { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_8</c>.</summary>
public class ServiciosMultiRegionRow
{
    public long? IdServicio { get; set; }
    public string? NombreServicio { get; set; }
    public long? Regiones { get; set; }
}

/// <summary>Fila devuelta por <c>f_exclusion_9</c>.</summary>
public class ProductosCompradosJuntosRow
{
    public string? ProductoA { get; set; }
    public string? ProductoB { get; set; }
    public long? VecesCompradosJuntos { get; set; }
}

/// <summary>Fila devuelta por <c>f_inventario_1</c>.</summary>
public class DevolucionesPorClienteRow
{
    public string? Cliente { get; set; }
    public string? Producto { get; set; }
    public string? Motivo { get; set; }
}

/// <summary>Fila devuelta por <c>f_inventario_2</c>.</summary>
public class ProductosEnOfertaRow
{
    public int? IdProducto { get; set; }
    public string? NombreProducto { get; set; }
    public string? PrecioOriginal { get; set; }
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
    public int? IdOferta { get; set; }
    public decimal? PrecioOferta { get; set; }
    public bool? EstadoOferta { get; set; }
}

/// <summary>Fila devuelta por <c>f_inventario_4</c>.</summary>
public class DeseosConOfertaRow
{
    public string? Rut { get; set; }
    public string? NombreUsuario { get; set; }
    public string? NombreLista { get; set; }
    public string? NombreProducto { get; set; }
    public decimal? PrecioOferta { get; set; }
    public DateOnly? FechaFin { get; set; }
}

/// <summary>Fila devuelta por <c>f_inventario_5</c>.</summary>
public class TasaDevolucionesEmprendedorRow
{
    public string? Emprendedor { get; set; }
    public long? Ventas { get; set; }
    public long? Devoluciones { get; set; }
    public decimal? PorcentajeDevoluciones { get; set; }
}

/// <summary>Fila devuelta por <c>f_inventario_6</c>.</summary>
public class ProductosStockColoresRow
{
    public string? NombreProducto { get; set; }
    public long? VariantesColor { get; set; }
    public decimal? InventarioTotal { get; set; }
}

/// <summary>Fila devuelta por <c>f_inventario_7</c>.</summary>
public class VentasAnuladasRow
{
    public int? IdVenta { get; set; }
    public DateTime? Fecha { get; set; }
    public string? Estado { get; set; }
    public string? MedioPago { get; set; }
    public string? CodigoTransferencia { get; set; }
}

/// <summary>Fila devuelta por <c>f_inventario_8</c>.</summary>
public class ConversionListaDeseosRow
{
    public int? IdProducto { get; set; }
    public string? NombreProducto { get; set; }
    public long? VecesGuardado { get; set; }
    public long? VentasRealizadas { get; set; }
    public decimal? TasaConversion { get; set; }
}

/// <summary>Fila devuelta por <c>f_validacion_1</c>.</summary>
public class EdadClientesRow
{
    public string? RutUsuario { get; set; }
    public string? NombreUsuario { get; set; }
    public string? TipoUsuario { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public int? EdadAnios { get; set; }
}

/// <summary>Fila devuelta por <c>f_validacion_3</c>.</summary>
public class GruposEtariosRow
{
    public int? GrupoEtario { get; set; }
    public long? CantidadClientes { get; set; }
}

/// <summary>Fila devuelta por <c>f_validacion_5</c>.</summary>
public class EmprendedoresEmpresaRow
{
    public string? RutEmprendedor { get; set; }
    public string? NombreEmpendedor { get; set; }
    public string? RutEmpresa { get; set; }
    public string? NombreEmpresa { get; set; }
    public string? PaginaWeb { get; set; }
}

/// <summary>Fila devuelta por <c>f_validacion_6</c>.</summary>
public class DireccionesDespachoRow
{
    public int? Id { get; set; }
    public int? Numero { get; set; }
    public string? Calle { get; set; }
    public string? Descripcion { get; set; }
    public string? Pasaje { get; set; }
    public string? Sector { get; set; }
    public int? IdComuna { get; set; }
}

/// <summary>Fila devuelta por <c>f_validacion_7</c>.</summary>
public class EmprendedoresMayores60Row
{
    public string? Rut { get; set; }
    public string? Nombre { get; set; }
    public decimal? EdadAnios { get; set; }
    public string? Servicio { get; set; }
    public string? Modalidad { get; set; }
    public string? Categoria { get; set; }
}

/// <summary>Fila devuelta por <c>f_validacion_8</c>.</summary>
public class MediosPagoRow
{
    public int? Id { get; set; }
    public string? MedioPago { get; set; }
    public int? Ult4DigitosTarjeta { get; set; }
    public int? CodigoTransferencia { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_1</c>.</summary>
public class FacturaRow
{
    public int? FolioFactura { get; set; }
    public DateOnly? FechaEmision { get; set; }
    public string? RutCliente { get; set; }
    public string? NombreCliente { get; set; }
    public int? ValorNeto { get; set; }
    public decimal? TasaIva { get; set; }
    public decimal? MontoIva { get; set; }
    public decimal? MontoDescuento { get; set; }
    public decimal? RecargoEnvio { get; set; }
    public decimal? TotalAPagar { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_3</c>.</summary>
public class RendimientoVendedorRow
{
    public string? IdVendedor { get; set; }
    public double? Anio { get; set; }
    public double? Trimestre { get; set; }
    public decimal? FacturacionAcumulada { get; set; }
    public string? CategoriaRendimiento { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_4</c>.</summary>
public class LtvClientesRow
{
    public string? RutCliente { get; set; }
    public string? NombreCliente { get; set; }
    public long? TotalTransacciones { get; set; }
    public decimal? Ltv { get; set; }
    public decimal? TicketPromedio { get; set; }
    public DateOnly? PrimeraCompra { get; set; }
    public DateOnly? UltimaCompra { get; set; }
    public int? AntiguedadDias { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_5</c>.</summary>
public class JerarquiaCategoriasRow
{
    public int? IdCat { get; set; }
    public string? NombreCat { get; set; }
    public int? IdCatPadre { get; set; }
    public int? Nivel { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_6</c>.</summary>
public class UtilidadProyectadaRow
{
    public decimal? UtilidadProyectada { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_7</c>.</summary>
public class EmpresasPorGiroRow
{
    public string? GiroEmpresa { get; set; }
    public long? CantidadEmpresas { get; set; }
    public long? CantidadComunas { get; set; }
    public decimal? SuperficieTotalKm2 { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_8</c>.</summary>
public class PromedioNuevosClientesRow
{
    public decimal? PromedioDiarioNuevosClientes { get; set; }
}

/// <summary>Fila devuelta por <c>f_logicas_10</c>.</summary>
public class CatalogoUnificadoRow
{
    public string? TipoBien { get; set; }
    public int? IdBien { get; set; }
    public string? NombreBien { get; set; }
    public int? RestriccionEdad { get; set; }
    public string? CategoriasBien { get; set; }
    public int? IdOfertaBien { get; set; }
    public DateOnly? FechaInicioBien { get; set; }
    public DateOnly? FechaFinBien { get; set; }
    public long? StockDisponible { get; set; }
    public string? DisponibilidadBien { get; set; }
}

/// <summary>Cuerpo para <c>f_dml</c> (INSERT / UPDATE / DELETE genérico).</summary>
public class DmlRequestDto
{
    public string Tabla { get; set; } = "";
    /// <summary>INSERT | UPDATE | DELETE (o INSERTAR | ACTUALIZAR | ELIMINAR).</summary>
    public string Operacion { get; set; } = "";
    /// <summary>Objeto JSON { "columna": valor, ... }.</summary>
    public System.Text.Json.JsonElement? Datos { get; set; }
    /// <summary>Objeto JSON opcional para identificar filas en UPDATE/DELETE.</summary>
    public System.Text.Json.JsonElement? Filtro { get; set; }
}
