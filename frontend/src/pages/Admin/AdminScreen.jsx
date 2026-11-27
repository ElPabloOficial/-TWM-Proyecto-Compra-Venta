import { useEffect, useState } from "react";

import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import { LineAreaChart, BarsChart } from "../../components/molecules/AdminCharts/AdminCharts";
import { obtenerEstadisticasAdmin } from "../../services/adminService";

import "../../styles/Admin.css";

const formatoMoneda = (n) => `$${n.toLocaleString("es-CL")}`;
const formatoDecimal = (n) => String(n).replace(".", ",");

const AdminScreen = () => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    obtenerEstadisticasAdmin()
      .then((d) => activo && setDatos(d))
      .catch((e) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, []);

  const ingresos = datos?.ingresosMensuales ?? [];
  const envios = datos?.enviosPorEmpresa ?? [];
  const regiones = datos?.volumenPorRegion ?? [];
  const etarios = datos?.gruposEtarios ?? [];
  const dias = datos?.finDeSemanaVsHabiles ?? [];
  const topLtv = datos?.topLtvClientes ?? [];
  const compradosJuntos = datos?.productosCompradosJuntos ?? [];

  const variacionTexto =
    datos?.variacionIngresos != null
      ? ` (${datos.variacionIngresos >= 0 ? "+" : ""}${formatoDecimal(datos.variacionIngresos)}%)`
      : "";

  const indicadores = datos && [
    { titulo: `Ingresos del mes${variacionTexto}`, valor: formatoMoneda(datos.ingresosMes) },
    { titulo: "Utilidad proyectada (5%)", valor: formatoMoneda(datos.utilidadProyectada) },
    { titulo: "Ventas completadas", valor: datos.ventasCompletadas.toLocaleString("es-CL") },
    { titulo: "Tiempo entrega prom.", valor: `${formatoDecimal(datos.tiempoEntregaDias)} días` },
    { titulo: "Calificación prom.", valor: `${formatoDecimal(datos.calificacionPromedio)} / 5` },
    { titulo: "Nuevos clientes / día (30d)", valor: formatoDecimal(datos.promedioNuevosClientes) },
  ];

  const calidad = datos && [
    { titulo: "Preguntas sin responder >48h", valor: datos.calidad.preguntasSinResponder48h },
    { titulo: "Mensajes sin responder >48h", valor: datos.calidad.mensajesSinResponder48h },
    { titulo: "Reseñas nuevas esta semana", valor: datos.calidad.resenasNuevasSemana },
    { titulo: "Tasa de devoluciones", valor: `${formatoDecimal(datos.calidad.tasaDevoluciones)}%` },
    { titulo: "Reintegrado devoluciones (año)", valor: formatoMoneda(datos.capitalReintegradoAnio) },
    { titulo: "Emprendedores calif. <3", valor: datos.calidad.emprendedoresBajo3 },
    { titulo: "Vendedores servicios sin reseñas (6m)", valor: datos.calidad.vendedoresServiciosSinResenas },
  ];

  return (
    <SellerTemplate>
      <h1 className="inv-title">Panel de control estadístico</h1>
      <p className="adm-subtitulo">
        Análisis comercial, operativo y de calidad de toda la plataforma
      </p>

      {error && <p className="adm-error">{error}</p>}
      {!datos && !error && <p className="adm-cargando">Cargando estadísticas...</p>}

      {datos && (
        <>
          <section className="adm-kpis">
            {indicadores.map((i) => (
              <StatCard key={i.titulo} titulo={i.titulo} valor={i.valor} />
            ))}
          </section>

          <div className="adm-layout">
            <div className="adm-columna">
              <section className="adm-tarjeta">
                <h2 className="adm-tarjeta-titulo">Análisis comercial · evolución de ingresos</h2>
                {ingresos.length ? (
                  <LineAreaChart
                    titulo="Evolución de ingresos por mes"
                    etiquetas={ingresos.map((i) => i.mes)}
                    valores={ingresos.map((i) => i.monto)}
                    formato={(v) => `$${v / 1000000}M`}
                  />
                ) : (
                  <p className="adm-cargando">Aún no hay ventas registradas.</p>
                )}
              </section>

              <section className="adm-tarjeta">
                <h2 className="adm-tarjeta-titulo">Análisis operativo · envíos por empresa de transporte</h2>
                {envios.length ? (
                  <BarsChart
                    titulo="Envíos por empresa de transporte"
                    etiquetas={envios.map((e) => e.empresa)}
                    valores={envios.map((e) => e.cantidad)}
                  />
                ) : (
                  <p className="adm-cargando">Aún no hay envíos registrados.</p>
                )}
              </section>

              <section className="adm-tarjeta">
                <h2 className="adm-tarjeta-titulo">Análisis logístico · despachos por región</h2>
                {regiones.length ? (
                  <BarsChart
                    titulo="Volumen de despachos por región"
                    etiquetas={regiones.map((r) => r.region)}
                    valores={regiones.map((r) => r.volumen)}
                  />
                ) : (
                  <p className="adm-cargando">Sin despachos con peso registrado por región.</p>
                )}
              </section>

              <section className="adm-tarjeta">
                <h2 className="adm-tarjeta-titulo">Demografía · clientes activos por grupo etario</h2>
                {etarios.length ? (
                  <BarsChart
                    titulo="Clientes por grupo etario"
                    etiquetas={etarios.map((g) => g.etiqueta)}
                    valores={etarios.map((g) => g.cantidad)}
                  />
                ) : (
                  <p className="adm-cargando">Aún no hay clientes con compras registradas.</p>
                )}
              </section>
            </div>

            <aside className="adm-tarjeta adm-calidad">
              <h2 className="adm-tarjeta-titulo adm-centrado">Análisis de calidad</h2>
              {calidad.map((c) => (
                <div key={c.titulo} className="adm-calidad-item">
                  <div className="adm-calidad-nombre">{c.titulo}</div>
                  <div className="adm-calidad-valor">{c.valor}</div>
                </div>
              ))}

              {dias.length > 0 && (
                <div className="adm-calidad-item">
                  <div className="adm-calidad-nombre">Fines de semana vs. días hábiles</div>
                  {dias.map((d) => (
                    <div key={d.tipoDia} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
                      <span>{d.tipoDia} ({d.totalVentas})</span>
                      <strong>{formatoMoneda(d.totalVendido)}</strong>
                    </div>
                  ))}
                </div>
              )}

              {topLtv.length > 0 && (
                <div className="adm-calidad-item">
                  <div className="adm-calidad-nombre">Top clientes por LTV</div>
                  {topLtv.map((c) => (
                    <div key={c.rut} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6, gap: 8 }}>
                      <span>{c.nombre} ({c.transacciones})</span>
                      <strong>{formatoMoneda(c.ltv)}</strong>
                    </div>
                  ))}
                </div>
              )}

              {compradosJuntos.length > 0 && (
                <div className="adm-calidad-item">
                  <div className="adm-calidad-nombre">Productos comprados juntos</div>
                  {compradosJuntos.map((p, idx) => (
                    <div key={idx} style={{ fontSize: 12, marginTop: 6 }}>
                      {p.productoA} + {p.productoB} <strong>({p.veces})</strong>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </SellerTemplate>
  );
};

export default AdminScreen;
