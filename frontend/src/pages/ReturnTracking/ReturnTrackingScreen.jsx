import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { authService } from "../../services/authService";
import {
  listarMisDevolucionesSeguimiento,
  EN_REVISION,
  APROBADA,
  RECHAZADA,
} from "../../services/returnTrackingService";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import "../../styles/ReturnTracking.css";

/*
 * Seguimiento de devoluciones, para el cliente: cada devolución que pidió, en qué etapa va
 * (solicitud enviada -> en revisión -> aprobada o rechazada) y su detalle.
 * Datos: GET /devoluciones/mias.
 */

const FILTROS = [
  { nombre: "Todas", estado: null },
  { nombre: "En revisión", estado: EN_REVISION },
  { nombre: "Aprobadas", estado: APROBADA },
  { nombre: "Rechazadas", estado: RECHAZADA },
];

// "2026-11-20" -> mediodía local, para que la zona horaria no cambie el día
const aFecha = (iso) => new Date(`${iso}T12:00:00`);

const fechaLarga = (iso) =>
  aFecha(iso).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });

const fechaCorta = (iso) =>
  aFecha(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });

const formatoCLP = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

// "hoy", "ayer", "hace 3 días"
const haceCuanto = (iso) => {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const dias = Math.round((inicioHoy - new Date(`${iso}T00:00:00`)) / 86400000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
};

// La frase de cada tarjeta, según en qué etapa va
const titular = (d) => {
  if (d.estado === APROBADA) {
    return {
      titulo: "Devolución aprobada",
      detalle:
        d.tipo === "Cambio"
          ? "Coordina el cambio del producto con el vendedor por mensajes."
          : d.montoReintegrado > 0
            ? `Te reintegraremos ${formatoCLP(d.montoReintegrado)}.`
            : "Tu reembolso fue aprobado.",
    };
  }
  if (d.estado === RECHAZADA) {
    return {
      titulo: "Devolución rechazada",
      detalle: "Si tienes dudas, escríbele al vendedor para conocer el motivo.",
    };
  }
  return {
    titulo: "Estamos revisando tu solicitud",
    detalle: `La pediste ${haceCuanto(d.fechaSolicitud)}. El vendedor la revisará y verás aquí su respuesta.`,
  };
};

const ReturnTrackingScreen = () => {
  const navigate = useNavigate();
  const sesion = authService.getCurrentUser();

  const [devoluciones, setDevoluciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [filtro, setFiltro] = useState("Todas");

  useEffect(() => {
    if (!sesion) return;
    let activo = true;

    setCargando(true);
    setError("");
    listarMisDevolucionesSeguimiento()
      .then((datos) => {
        if (activo) setDevoluciones(datos);
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
  }, [sesion?.rut, recarga]);

  const visibles = useMemo(() => {
    const { estado } = FILTROS.find((f) => f.nombre === filtro) ?? FILTROS[0];
    return estado ? devoluciones.filter((d) => d.estado === estado) : devoluciones;
  }, [devoluciones, filtro]);

  if (!sesion) return <Navigate to="/login" replace />;

  const contar = (estado) => (estado ? devoluciones.filter((d) => d.estado === estado).length : devoluciones.length);

  const etapas = (d) => {
    const resuelta = d.estado !== EN_REVISION;
    const actual = resuelta ? 2 : 1;
    const UltimoIcono = d.estado === RECHAZADA ? HighlightOffOutlinedIcon : CheckCircleOutlineIcon;
    return [
      { nombre: "Solicitud enviada", fecha: fechaCorta(d.fechaSolicitud), Icono: SendOutlinedIcon },
      { nombre: "En revisión", fecha: null, Icono: SearchOutlinedIcon },
      {
        nombre: resuelta ? d.estado : "Resolución",
        fecha: resuelta && d.fechaResolucion ? fechaCorta(d.fechaResolucion) : null,
        Icono: UltimoIcono,
      },
    ].map((etapa, i) => ({
      ...etapa,
      completada: i < actual || (i === actual && resuelta),
      actual: i === actual && !resuelta,
      rechazada: i === 2 && d.estado === RECHAZADA,
    }));
  };

  const tarjeta = (d) => {
    const { titulo, detalle } = titular(d);
    const claseEstado = d.estado === APROBADA ? "aprobada" : d.estado === RECHAZADA ? "rechazada" : "revision";

    return (
      <li key={d.id} className="rt-tarjeta">
        <div className="rt-cabecera">
          <div className="rt-imagen">
            {d.imagenProducto && <img src={d.imagenProducto} alt="" />}
          </div>

          <div className="rt-producto">
            <h2 className="rt-nombre">{d.producto}</h2>
            <p className="rt-meta">
              {d.cantidad} {d.cantidad === 1 ? "unidad" : "unidades"} · Compra #{d.idVenta} · Vendedor: {d.vendedor}
            </p>
            <p className="rt-meta">Devolución #{d.id}</p>
          </div>

          <span className={`rt-estado ${claseEstado}`}>{d.estado}</span>
        </div>

        <h3 className={`rt-titular ${claseEstado}`}>{titulo}</h3>
        <p className="rt-detalle">{detalle}</p>

        <ol className="rt-etapas" aria-label="Etapas de la devolución">
          {etapas(d).map(({ nombre, fecha, Icono, completada, actual, rechazada }) => (
            <li
              key={nombre}
              className={`rt-etapa ${completada ? "completada" : ""} ${actual ? "actual" : ""} ${rechazada ? "rechazada" : ""}`}
              aria-current={actual ? "step" : undefined}
            >
              <span className="rt-etapa-circulo">
                <Icono fontSize="small" aria-hidden="true" />
              </span>
              <span className="rt-etapa-nombre">{nombre}</span>
              <span className="rt-etapa-fecha">{fecha ?? "\u00a0"}</span>
            </li>
          ))}
        </ol>

        <dl className="rt-datos">
          <div>
            <dt>Tipo</dt>
            <dd>{d.tipo}</dd>
          </div>
          <div>
            <dt>Solicitada el</dt>
            <dd>{fechaLarga(d.fechaSolicitud)}</dd>
          </div>
          {d.fechaResolucion && (
            <div>
              <dt>Resuelta el</dt>
              <dd>{fechaLarga(d.fechaResolucion)}</dd>
            </div>
          )}
          {d.estado === APROBADA && d.tipo !== "Cambio" && d.montoReintegrado > 0 && (
            <div>
              <dt>Monto a reintegrar</dt>
              <dd>{formatoCLP(d.montoReintegrado)}</dd>
            </div>
          )}
          <div className="rt-dato-ancho">
            <dt>Motivo</dt>
            <dd>{d.motivo}</dd>
          </div>
        </dl>

        <div className="rt-acciones">
          {d.imagenEvidencia && (
            <a className="rt-enlace" href={d.imagenEvidencia} target="_blank" rel="noreferrer">
              Ver la foto que adjuntaste
            </a>
          )}
          <button type="button" className="rt-enlace" onClick={() => navigate(`/seguimiento/${d.idVenta}`)}>
            Ver el pedido
          </button>
          <button type="button" className="rt-enlace" onClick={() => navigate("/mensajes/cliente")}>
            Escribir al vendedor
          </button>
        </div>
      </li>
    );
  };

  return (
    <>
      <Header />

      <main className="rt-page">
        <CustomButton
          variant="secondary"
          size="medium"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/historial")}
          sx={{
            border: "none",
            backgroundColor: "transparent",
            padding: "8px 0",
            marginBottom: "16px",
            justifyContent: "flex-start",
            textTransform: "none",
            "&:hover": { backgroundColor: "transparent", color: "#EC3333" },
          }}
        >
          Volver a Mis compras
        </CustomButton>

        <h1 className="rt-titulo">Seguimiento de devoluciones</h1>
        <p className="rt-subtitulo">Revisa en qué etapa va cada devolución que solicitaste.</p>

        {cargando ? (
          <p className="rt-mensaje" role="status">
            Cargando tus devoluciones...
          </p>
        ) : error ? (
          <ErrorState titulo="No pudimos cargar tus devoluciones" detalle={error} onReintentar={() => setRecarga((n) => n + 1)} />
        ) : devoluciones.length === 0 ? (
          <div className="rt-vacio">
            <p className="rt-vacio-titulo">Aún no has solicitado devoluciones</p>
            <p className="rt-mensaje">Cuando pidas una desde Mis compras, podrás seguirla aquí.</p>
            <CustomButton
              variant="primary"
              size="medium"
              onClick={() => navigate("/historial")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Ir a Mis compras
            </CustomButton>
          </div>
        ) : (
          <>
            <div className="rt-filtros" role="group" aria-label="Filtrar por estado">
              {FILTROS.map(({ nombre, estado }) => (
                <button
                  key={nombre}
                  type="button"
                  className={`rt-filtro ${filtro === nombre ? "activo" : ""}`}
                  aria-pressed={filtro === nombre}
                  onClick={() => setFiltro(nombre)}
                >
                  {nombre} ({contar(estado)})
                </button>
              ))}
            </div>

            {visibles.length === 0 ? (
              <p className="rt-mensaje">No tienes devoluciones en este estado.</p>
            ) : (
              <ul className="rt-lista">{visibles.map(tarjeta)}</ul>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default ReturnTrackingScreen;