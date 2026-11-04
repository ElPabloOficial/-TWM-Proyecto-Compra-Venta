import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Rating from "@mui/material/Rating";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { authService } from "../../services/authService";
import { reviewService } from "../../services/reviewService";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";

import "../../styles/MyReviews.css";

// Reseñas que escribió el cliente (las que recibe un vendedor están en /resenas)

const FILTROS = [
  { id: "todas", etiqueta: "Todas" },
  { id: "producto", etiqueta: "Productos" },
  { id: "servicio", etiqueta: "Servicios" },
];

// 2026-10-31T00:00:00 -> 31/10/2026
const formatoFecha = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = String(iso).slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

const MyReviewsScreen = () => {
  const navigate = useNavigate();
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const sesion = Boolean(authService.getCurrentUser());

  const cargar = () => {
    setCargando(true);
    setError("");
    reviewService
      .obtenerMisResenias()
      .then(setResenas)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (sesion) cargar();
  }, [sesion]);

  if (!sesion) return <Navigate to="/login" replace />;

  const visibles = resenas.filter((r) => filtro === "todas" || r.tipo === filtro);
  const promedio = resenas.length
    ? resenas.reduce((suma, r) => suma + r.calificacion, 0) / resenas.length
    : 0;

  return (
    <>
      <Header />

      <main className="mr-page">
        <CustomButton
          variant="secondary"
          size="medium"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            border: "none",
            backgroundColor: "transparent",
            padding: "8px 0",
            marginBottom: "20px",
            justifyContent: "flex-start",
            textTransform: "none",
            "&:hover": { backgroundColor: "transparent", color: "#EC3333" },
          }}
        >
          Volver
        </CustomButton>

        <section className="mr-cabecera">
          <div>
            <h1>Mis reseñas</h1>
            <p className="mr-subtitulo">Las opiniones que has escrito sobre los productos y servicios que compraste.</p>
          </div>

          {!cargando && !error && resenas.length > 0 && (
            <div className="mr-resumen">
              <span className="mr-resumen-num">{resenas.length}</span>
              <span>{resenas.length === 1 ? "reseña" : "reseñas"}</span>
              <span className="mr-resumen-sep" />
              <StarIcon fontSize="small" className="mr-resumen-estrella" />
              <span className="mr-resumen-num">{promedio.toFixed(1).replace(".", ",")}</span>
              <span>promedio</span>
            </div>
          )}
        </section>

        {cargando && <p className="mr-mensaje">Cargando tus reseñas...</p>}

        {error && (
          <div className="mr-mensaje mr-error">
            {error}{" "}
            <button type="button" className="mr-reintentar" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && resenas.length === 0 && (
          <section className="mr-vacio">
            <StarIcon className="mr-vacio-icono" />
            <h2>Todavía no has escrito reseñas</h2>
            <p>Después de recibir una compra puedes calificarla desde Mis compras.</p>
            <CustomButton variant="primary" size="medium" onClick={() => navigate("/historial")} sx={{ textTransform: "none" }}>
              Ir a Mis compras
            </CustomButton>
          </section>
        )}

        {!cargando && !error && resenas.length > 0 && (
          <>
            <div className="mr-filtros" role="tablist" aria-label="Filtrar reseñas">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filtro === f.id}
                  className={`mr-filtro ${filtro === f.id ? "activo" : ""}`}
                  onClick={() => setFiltro(f.id)}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>

            {visibles.length === 0 ? (
              <p className="mr-mensaje">No tienes reseñas en esta categoría.</p>
            ) : (
              <ul className="mr-lista">
                {visibles.map((r) => (
                  <li key={`${r.tipo}-${r.id}`}>
                    <article className="mr-tarjeta">
                      <div className="mr-tarjeta-cabecera">
                        <div>
                          <Link to={`/${r.tipo}/${r.id_item}`} className="mr-item">
                            {r.item}
                          </Link>
                          <div className="mr-meta">
                            <span className={`mr-etiqueta ${r.tipo}`}>{r.tipo === "producto" ? "Producto" : "Servicio"}</span>
                            <span>{formatoFecha(r.fecha)}</span>
                          </div>
                        </div>

                        <Rating value={r.calificacion} readOnly size="small" sx={{ color: "#EC3333" }} />
                      </div>

                      {r.comentario ? (
                        <p className="mr-comentario">{r.comentario}</p>
                      ) : (
                        <p className="mr-comentario mr-sin-comentario">Calificaste sin escribir un comentario.</p>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default MyReviewsScreen;
