import { useState, useEffect } from "react";
import Rating from "@mui/material/Rating";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { reviewService } from "../../services/reviewService";
import "../../styles/Inventory.css";
import "../../styles/Reviews.css";

// Reseñas que recibieron los productos y servicios del vendedor.
//   GET /resenias/vendedor -> lista (solo lectura)
// El vendedor todavía no puede responder: la tabla Calificacion no tiene dónde guardar la respuesta.

const POR_PAGINA = 8;

const comparadores = {
  recientes: (a, b) => b.fecha.localeCompare(a.fecha),
  mejor: (a, b) => b.calificacion - a.calificacion,
  peor: (a, b) => a.calificacion - b.calificacion,
};

// 2026-10-31T14:30:00 -> 31/10/2026
const formatoFecha = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

// Lo que devuelve la API -> lo que usa la pantalla
const aResena = (r) => ({
  id: r.id,
  tipo: r.tipo, // "producto" | "servicio"
  producto: r.item,
  cliente: r.cliente,
  calificacion: Number(r.calificacion) || 0,
  fecha: String(r.fecha ?? ""),
  comentario: r.comentario ?? "",
});

// ---------- Tarjeta de una reseña ----------
const ReviewCard = ({ resena }) => (
  <article className="rev-card">
    <div className="rev-card-head">
      <div>
        <div className="rev-producto">{resena.producto}</div>
        <div className="rev-cliente">
          {resena.tipo === "servicio" ? "Servicio" : "Producto"} · {resena.cliente} · {formatoFecha(resena.fecha)}
        </div>
      </div>

      <div className="rev-valoracion">
        <Rating value={resena.calificacion} readOnly size="small" className="rev-rating" />
      </div>
    </div>

    <p className="rev-comentario">
      {resena.comentario || <em>El cliente no dejó un comentario.</em>}
    </p>
  </article>
);

// ---------- Pantalla ----------
const ReviewsScreen = () => {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [orden, setOrden] = useState("recientes");
  const [filtroEstrellas, setFiltroEstrellas] = useState("");
  const [pagina, setPagina] = useState(1);

  // Carga las reseñas desde la API
  useEffect(() => {
    let activo = true;

    setCargando(true);
    setErrorCarga("");
    reviewService
      .obtenerReseniasDeMisPublicaciones()
      .then((lista) => {
        if (activo) setResenas(lista.map(aResena));
      })
      .catch((e) => {
        if (activo) setErrorCarga(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [recarga]);

  // Al cambiar el filtro o el orden se vuelve a la primera página
  useEffect(() => {
    setPagina(1);
  }, [orden, filtroEstrellas]);

  const verTodas = () => {
    setOrden("recientes");
    setFiltroEstrellas("");
  };

  // ---------- Filtro, orden y paginación ----------
  const filtradas = resenas.filter((r) => !filtroEstrellas || r.calificacion === Number(filtroEstrellas));
  const ordenadas = [...filtradas].sort(comparadores[orden]);

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenadas.slice(inicio, inicio + POR_PAGINA);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const desde = ordenadas.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  // ---------- Tarjetas de totales (sobre todas las reseñas) ----------
  const total = resenas.length;
  const promedio =
    total === 0
      ? "-"
      : (resenas.reduce((acc, r) => acc + r.calificacion, 0) / total)
          .toFixed(1)
          .replace(".", ",");

  return (
    <SellerTemplate activo="resenas">
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Gestión de Reseñas</h1>
          <div className="inv-subtitle">
            Revisa lo que opinan tus clientes sobre tus productos y servicios.
          </div>
        </div>
      </div>

      {cargando ? (
        <p role="status">Cargando reseñas...</p>
      ) : errorCarga ? (
        <ErrorState
          titulo="No pudimos cargar las reseñas"
          detalle={errorCarga}
          onReintentar={() => setRecarga((n) => n + 1)}
        />
      ) : (
        <>
          <div className="inv-stats">
            <StatCard titulo="Total de Reseñas" valor={total} />
            <StatCard titulo="Calificación Promedio" valor={promedio} />
          </div>

          <div className="inv-panel">
            <div className="inv-toolbar">
              <div>
                <strong>Reseñas</strong>
                <span className="inv-toolbar-count">{ordenadas.length} reseñas</span>
              </div>

              <div className="inv-toolbar-actions">
                <button type="button" className="inv-link-red" onClick={verTodas}>
                  Ver Todas
                </button>

                <select
                  className="inv-select"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  aria-label="Ordenar reseñas"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="mejor">Mejor calificadas</option>
                  <option value="peor">Peor calificadas</option>
                </select>

                <select
                  className="inv-select"
                  value={filtroEstrellas}
                  onChange={(e) => setFiltroEstrellas(e.target.value)}
                  aria-label="Filtrar por calificación"
                >
                  <option value="">Todas las estrellas</option>
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </select>
              </div>
            </div>

            <div className="rev-list">
              {visibles.length === 0 ? (
                <div className="rev-vacio">
                  {total === 0
                    ? "Tus productos y servicios todavía no tienen reseñas."
                    : "No hay reseñas para mostrar."}
                </div>
              ) : (
                visibles.map((r) => <ReviewCard key={r.id} resena={r} />)
              )}
            </div>

            {ordenadas.length > POR_PAGINA && (
              <div className="inv-footer">
                <div>
                  Mostrando {desde}-{hasta} de {ordenadas.length} reseñas
                </div>

                <div className="inv-pagination">
                  <button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>
                    ‹
                  </button>
                  {paginas.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n === paginaActual ? "activa" : ""}
                      onClick={() => setPagina(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPagina(paginaActual + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </SellerTemplate>
  );
};

export default ReviewsScreen;
