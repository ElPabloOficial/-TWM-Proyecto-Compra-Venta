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
  const mesActual = ingresos.at(-1);

  const indicadores = datos && [
    { titulo: "Ingresos del mes", valor: formatoMoneda(mesActual?.monto ?? 0) },
    { titulo: "Ventas completadas", valor: datos.ventasCompletadas.toLocaleString("es-CL") },
    { titulo: "Tiempo entrega prom.", valor: `${formatoDecimal(datos.tiempoEntregaDias)} días` },
    { titulo: "Calificación prom.", valor: `${formatoDecimal(datos.calificacionPromedio)} / 5` },
  ];

  const calidad = datos && [
    { titulo: "Preguntas sin responder >48h", valor: datos.calidad.preguntasSinResponder48h },
    { titulo: "Reseñas nuevas esta semana", valor: datos.calidad.resenasNuevasSemana },
    { titulo: "Tasa de devoluciones", valor: `${formatoDecimal(datos.calidad.tasaDevoluciones)}%` },
    { titulo: "Emprendedores calif. <3", valor: datos.calidad.emprendedoresBajo3 },
  ];

  return (
    <SellerTemplate>
      <h1 className="inv-title">Panel de control estadístico</h1>
      <p className="adm-subtitulo">
        Análisis comercial, operativo y de calidad de toda la plataforma · último mes
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
                <LineAreaChart
                  titulo="Evolución de ingresos por mes"
                  etiquetas={ingresos.map((i) => i.mes)}
                  valores={ingresos.map((i) => i.monto)}
                  formato={(v) => `$${v / 1000000}M`}
                />
              </section>

              <section className="adm-tarjeta">
                <h2 className="adm-tarjeta-titulo">Análisis operativo · envíos por empresa de transporte</h2>
                <BarsChart
                  titulo="Envíos por empresa de transporte"
                  etiquetas={datos.enviosPorEmpresa.map((e) => e.empresa)}
                  valores={datos.enviosPorEmpresa.map((e) => e.cantidad)}
                />
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
            </aside>
          </div>
        </>
      )}
    </SellerTemplate>
  );
};

export default AdminScreen;
