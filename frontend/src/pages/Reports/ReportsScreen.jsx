import { useEffect, useState } from "react";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import CustomButton from "../../components/atoms/Button/CustomButton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { listarVentasDelPeriodo } from "../../services/reportService";
import "../../styles/Inventory.css";
import "../../styles/Reports.css";

// Fecha en formato YYYY-MM-DD usando la hora local (no UTC)
const aISO = (fecha) => fecha.toLocaleDateString("sv-SE");

// Fecha de hace N días (0 = hoy)
const fechaHace = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return aISO(fecha);
};

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

// 2026-10-31 -> 31/10/2026
const formatoFecha = (iso) => {
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

// La API entrega una fila por producto o servicio vendido; aquí se suman por producto o por categoría
const agrupar = (ventas, clave) => {
  const mapa = {};
  ventas.forEach((v) => {
    const nombre = v[clave];
    if (!mapa[nombre]) mapa[nombre] = { nombre, unidades: 0, ingresos: 0 };
    mapa[nombre].unidades += v.cantidad;
    mapa[nombre].ingresos += v.total;
  });
  return Object.values(mapa).sort((a, b) => b.ingresos - a.ingresos);
};

const ReportsScreen = () => {
  const [ventas, setVentas] = useState([]);
  const [dias, setDias] = useState(30);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  // ---------- Período seleccionado ----------
  const hoy = fechaHace(0);
  const desde = fechaHace(dias - 1);

  // GET /reportes/ventas: las ventas del vendedor en el período (se pide de nuevo al cambiar el período)
  useEffect(() => {
    let activo = true;

    setCargando(true);
    setError("");
    listarVentasDelPeriodo(fechaHace(dias - 1), fechaHace(0))
      .then((datos) => {
        if (activo) setVentas(datos);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [dias, recarga]);

  // ---------- Tarjetas de totales ----------
  const ingresos = ventas.reduce((acc, v) => acc + v.total, 0);
  const unidades = ventas.reduce((acc, v) => acc + v.cantidad, 0);
  // Ticket promedio: ingresos por venta (una venta puede tener varios productos)
  const cantidadVentas = new Set(ventas.map((v) => v.idVenta)).size;
  const ticketPromedio = cantidadVentas === 0 ? 0 : Math.round(ingresos / cantidadVentas);

  const porProducto = agrupar(ventas, "producto");
  const porCategoria = agrupar(ventas, "categoria");
  const masVendido =
    [...porProducto].sort((a, b) => b.unidades - a.unidades)[0]?.nombre ?? "-";
  const topProductos = porProducto.slice(0, 5);

  // ---------- Ventas por día (gráfico de barras) ----------
  const serieDiaria = Array.from({ length: dias }, (_, i) => {
    const fecha = fechaHace(dias - 1 - i);
    const total = ventas
      .filter((v) => v.fecha === fecha)
      .reduce((acc, v) => acc + v.total, 0);
    return { fecha, total };
  });
  const maxDia = Math.max(...serieDiaria.map((d) => d.total), 1);
  // Para que no se amontonen las fechas, se muestra una de cada N
  const cadaN = dias <= 7 ? 1 : dias <= 15 ? 2 : 5;

  const porcentaje = (monto) => (ingresos === 0 ? 0 : Math.round((monto / ingresos) * 100));

  // ---------- Exportar a CSV ----------
  const exportarCSV = () => {
    const encabezado = ["Fecha", "N.º de venta", "Tipo", "Producto o servicio", "Categoría", "Cantidad", "Precio unitario", "Total"];
    const filas = ventas.map((v) => [
      formatoFecha(v.fecha),
      v.idVenta,
      v.tipo === "servicio" ? "Servicio" : "Producto",
      v.producto,
      v.categoria,
      v.cantidad,
      v.precio,
      v.total,
    ]);

    const csv = [encabezado, ...filas]
      .map((fila) => fila.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    // El "\uFEFF" hace que Excel lea bien las tildes
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `reporte-ventas-${hoy}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Reportes de Ventas</h1>
          <div className="inv-subtitle">
            Revisa cómo van tus ventas: ingresos, productos estrella y categorías.
          </div>
        </div>

        <div className="rep-acciones">
          <select
            className="rep-periodo"
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            aria-label="Período del reporte"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={15}>Últimos 15 días</option>
            <option value={30}>Últimos 30 días</option>
          </select>

          <CustomButton
            variant="primary"
            onClick={exportarCSV}
            disabled={cargando || Boolean(error) || ventas.length === 0}
            sx={{ border: "2px solid #EC3333" }}
          >
            Exportar CSV
          </CustomButton>
        </div>
      </div>

      {cargando ? ( //caso 1 cuando carga
        <div className="inv-panel">
          <div className="rep-vacio" role="status">
            Cargando el reporte...
          </div>
        </div>
      ) : error ? (
        <ErrorState titulo="No pudimos cargar tu reporte de ventas" detalle={error} onReintentar={() => setRecarga((n) => n + 1)} /> //caso 2 error
      ) : (
        //caso 3 cuando cargan los datos
        <>
      <div className="inv-stats">
        <StatCard titulo="Ingresos netos del período" valor={formatoPrecio(ingresos)} />
        <StatCard titulo="Unidades vendidas" valor={unidades} />
        <StatCard titulo="Ticket promedio" valor={formatoPrecio(ticketPromedio)} />
        <StatCard titulo="Producto más vendido" valor={masVendido} />
      </div>

      {/* ---------- Ventas por día ---------- */}
      <div className="inv-panel">
        <div className="rep-titulo">Ventas por día</div>
        <div className="rep-subtitulo">
          {formatoFecha(desde)} al {formatoFecha(hoy)}
        </div>

        {ventas.length === 0 ? (
          <div className="rep-vacio">No hay ventas en este período.</div>
        ) : (
          <>
            <div className="rep-chart">
              {serieDiaria.map((d) => (
                <div
                  key={d.fecha}
                  className="rep-col"
                  title={`${formatoFecha(d.fecha)}: ${formatoPrecio(d.total)}`}
                >
                  <div
                    className={`rep-bar ${d.total === 0 ? "vacia" : ""}`}
                    style={{ height: `${(d.total / maxDia) * 100}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="rep-labels">
              {serieDiaria.map((d, i) => (
                <div key={d.fecha} className="rep-label">
                  {i % cadaN === 0 ? formatoFecha(d.fecha).slice(0, 5) : ""}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rep-grid">
        {/* ---------- Productos más vendidos ---------- */}
        <div className="inv-panel">
          <div className="rep-titulo">Productos más vendidos</div>

          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades</th>
                  <th>Ingresos</th>
                  <th>% del total</th>
                </tr>
              </thead>
              <tbody>
                {topProductos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="inv-empty">
                      No hay ventas en este período.
                    </td>
                  </tr>
                )}

                {topProductos.map((p) => (
                  <tr key={p.nombre}>
                    <td>{p.nombre}</td>
                    <td>{p.unidades}</td>
                    <td>{formatoPrecio(p.ingresos)}</td>
                    <td>{porcentaje(p.ingresos)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- Ventas por categoría ---------- */}
        <div className="inv-panel">
          <div className="rep-titulo">Ventas por categoría</div>

          {porCategoria.length === 0 ? (
            <div className="rep-vacio">No hay ventas en este período.</div>
          ) : (
            porCategoria.map((c) => (
              <div key={c.nombre} className="rep-fila">
                <span>{c.nombre}</span>
                <div className="rep-pista">
                  <div className="rep-relleno" style={{ width: `${porcentaje(c.ingresos)}%` }} />
                </div>
                <span className="rep-monto">{formatoPrecio(c.ingresos)}</span>
              </div>
            ))
          )}
        </div>
      </div>
        </>
      )}
    </SellerTemplate>
  );
};

export default ReportsScreen;