import { useState, useEffect } from "react";
import Rating from "@mui/material/Rating";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import "../../styles/Inventory.css";
import "../../styles/Reviews.css";

const MAX_CARACTERES = 300;

// TEMPORAL: estas reseñas son de ejemplo. Los clientes las escriben desde la tienda;
// cuando se conecte el backend se cargan desde la API (solo las de los productos del vendedor).
const resenasIniciales = [
  {
    id: 1,
    producto: "Notebook Lenovo",
    cliente: "Camila Rojas",
    calificacion: 5,
    fecha: "2026-10-09",
    comentario: "Llegó rápido y funciona perfecto. Muy buena relación precio-calidad.",
    respuesta: "¡Gracias por tu compra, Camila! Nos alegra que te guste.",
    fechaRespuesta: "2026-10-10",
  },
  {
    id: 2,
    producto: "Audífonos Bluetooth",
    cliente: "Matías Pérez",
    calificacion: 3,
    fecha: "2026-10-08",
    comentario: "El sonido es bueno, pero la batería dura menos de lo que esperaba.",
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: 3,
    producto: "Hervidor eléctrico",
    cliente: "Francisca Soto",
    calificacion: 1,
    fecha: "2026-10-07",
    comentario: "Llegó con la tapa dañada y no calienta parejo.",
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: 4,
    producto: "Notebook Lenovo",
    cliente: "Diego Álvarez",
    calificacion: 4,
    fecha: "2026-10-05",
    comentario: "Buen equipo, aunque el embalaje podría ser mejor.",
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: 5,
    producto: "Audífonos Bluetooth",
    cliente: "Valentina Muñoz",
    calificacion: 5,
    fecha: "2026-10-03",
    comentario: "Excelentes, se conectan al tiro y son muy cómodos.",
    respuesta: "Gracias Valentina, ¡que los disfrutes!",
    fechaRespuesta: "2026-10-04",
  },
  {
    id: 6,
    producto: "Hervidor eléctrico",
    cliente: "Joaquín Vera",
    calificacion: 2,
    fecha: "2026-10-02",
    comentario: "Tarda mucho en hervir y hace bastante ruido.",
    respuesta: "",
    fechaRespuesta: "",
  },
];

const comparadores = {
  recientes: (a, b) => b.fecha.localeCompare(a.fecha),
  mejor: (a, b) => b.calificacion - a.calificacion,
  peor: (a, b) => a.calificacion - b.calificacion,
};

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC)
const hoyLocal = () => new Date().toLocaleDateString("sv-SE");

// 2026-10-31 -> 31/10/2026
const formatoFecha = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

// ---------- Tarjeta de una reseña ----------
const ReviewCard = ({ resena, onResponder, onEliminarRespuesta }) => {
  const respondida = Boolean(resena.respuesta);

  return (
    <article className="rev-card">
      <div className="rev-card-head">
        <div>
          <div className="rev-producto">{resena.producto}</div>
          <div className="rev-cliente">
            {resena.cliente} · {formatoFecha(resena.fecha)}
          </div>
        </div>

        <div className="rev-valoracion">
          <Rating value={resena.calificacion} readOnly size="small" className="rev-rating" />
          {!respondida && <span className="rev-pendiente">Sin responder</span>}
        </div>
      </div>

      <p className="rev-comentario">{resena.comentario}</p>

      {respondida ? (
        <div className="rev-respuesta">
          <div className="rev-respuesta-titulo">
            Tu respuesta · {formatoFecha(resena.fechaRespuesta)}
          </div>
          <p>{resena.respuesta}</p>

          <div className="rev-acciones">
            <button
              type="button"
              className="inv-icon-btn"
              onClick={() => onResponder(resena)}
              aria-label="Editar respuesta"
            >
              <EditIcon fontSize="small" />
            </button>
            <button
              type="button"
              className="inv-icon-btn"
              onClick={() => onEliminarRespuesta(resena)}
              aria-label="Eliminar respuesta"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rev-acciones">
          <CustomButton
            variant="primary"
            size="small"
            onClick={() => onResponder(resena)}
            sx={{ border: "2px solid #EC3333" }}
          >
            Responder
          </CustomButton>
        </div>
      )}
    </article>
  );
};

// ---------- Diálogo para responder o editar la respuesta ----------
const ReviewReplyDialog = ({ open, resena, onClose, onGuardar }) => {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");

  // Si la reseña ya tiene respuesta, se está editando; si no, se responde por primera vez
  const editando = Boolean(resena?.respuesta);

  // Cada vez que se abre: carga la respuesta existente o deja el campo vacío
  useEffect(() => {
    setTexto(resena?.respuesta ?? "");
    setError("");
  }, [resena, open]);

  const handleGuardar = () => {
    const respuesta = texto.trim();

    if (!respuesta) {
      setError("Escribe una respuesta antes de guardar.");
      return;
    }
    if (respuesta.length > MAX_CARACTERES) {
      setError(`La respuesta no puede superar los ${MAX_CARACTERES} caracteres.`);
      return;
    }

    const datos = { id: resena.id, respuesta };

    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados.
    // Con el backend esto se reemplaza por la llamada a la API (POST al responder, PUT al editar).
    console.log(
      editando ? "[Reseñas] Actualizar respuesta:" : "[Reseñas] Responder reseña:",
      datos
    );

    onGuardar(datos);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editando ? "Editar respuesta" : "Responder reseña"}</DialogTitle>
      <DialogContent className="rev-dialog-content">
        {resena && (
          <div className="rev-cita">
            <div className="rev-cita-titulo">
              {resena.producto} · {resena.cliente}
            </div>
            <div>{resena.comentario}</div>
          </div>
        )}

        <TextField
          label="Tu respuesta"
          size="small"
          multiline
          minRows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          helperText={`${texto.length}/${MAX_CARACTERES}`}
        />

        {error && <span className="rev-error">{error}</span>}
      </DialogContent>
      <DialogActions className="rev-dialog-actions">
        <CustomButton variant="secondary" size="small" onClick={onClose}>
          Cancelar
        </CustomButton>
        <CustomButton
          variant="primary"
          size="small"
          onClick={handleGuardar}
          sx={{ border: "2px solid #EC3333" }}
        >
          Guardar
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

// ---------- Pantalla ----------
const ReviewsScreen = () => {
  // TEMPORAL: las reseñas viven solo en memoria (se pierden al recargar la página).
  const [resenas, setResenas] = useState(resenasIniciales);
  const [resenaRespondiendo, setResenaRespondiendo] = useState(null);
  const [resenaAEliminar, setResenaAEliminar] = useState(null);
  const [orden, setOrden] = useState("recientes");
  const [filtroEstrellas, setFiltroEstrellas] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // ---------- Acciones ----------
  // TEMPORAL: responder, editar y eliminar la respuesta solo modifican el estado local.
  // Con el backend pasan a ser llamadas a la API (POST / PUT / DELETE de la respuesta).
  const guardarRespuesta = ({ id, respuesta }) => {
    setResenas(
      resenas.map((r) =>
        // TEMPORAL: la fecha de la respuesta la pondrá la base de datos
        r.id === id ? { ...r, respuesta, fechaRespuesta: hoyLocal() } : r
      )
    );
    setResenaRespondiendo(null);
  };

  const confirmarEliminarRespuesta = () => {
    // SIMULACIÓN (solo frontend): con el backend pasa a ser una llamada DELETE
    console.log("[Reseñas] Eliminar respuesta:", resenaAEliminar);
    setResenas(
      resenas.map((r) =>
        r.id === resenaAEliminar.id ? { ...r, respuesta: "", fechaRespuesta: "" } : r
      )
    );
    setResenaAEliminar(null);
  };

  const verTodas = () => {
    setOrden("recientes");
    setFiltroEstrellas("");
    setFiltroEstado("");
  };

  // ---------- Filtro y orden ----------
  // TEMPORAL: se hacen aquí sobre todas las reseñas en memoria.
  // Con el backend pasan a ser parámetros de la consulta (WHERE, ORDER BY).
  const filtradas = resenas.filter((r) => {
    if (filtroEstrellas && r.calificacion !== Number(filtroEstrellas)) return false;
    if (filtroEstado === "sin") return !r.respuesta;
    if (filtroEstado === "respondidas") return Boolean(r.respuesta);
    return true;
  });

  const ordenadas = [...filtradas].sort(comparadores[orden]);

  // ---------- Tarjetas de totales (sobre todas las reseñas) ----------
  // TEMPORAL: se calculan en el frontend. Con la base de datos pasan a ser
  // consultas agregadas: COUNT(*), AVG(calificacion) y COUNT donde respuesta es NULL.
  const total = resenas.length;
  const promedio =
    total === 0
      ? "-"
      : (resenas.reduce((acc, r) => acc + r.calificacion, 0) / total)
          .toFixed(1)
          .replace(".", ",");
  const sinResponder = resenas.filter((r) => !r.respuesta).length;

  return (
    <SellerTemplate activo="resenas">
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Gestión de Reseñas</h1>
          <div className="inv-subtitle">
            Revisa lo que opinan tus clientes y responde sus comentarios.
          </div>
        </div>
      </div>

      <div className="inv-stats">
        <StatCard titulo="Total de Reseñas" valor={total} />
        <StatCard titulo="Calificación Promedio" valor={promedio} />
        <StatCard titulo="Sin responder" valor={sinResponder} />
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

            <select
              className="inv-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="">Todas</option>
              <option value="sin">Sin responder</option>
              <option value="respondidas">Respondidas</option>
            </select>
          </div>
        </div>

        <div className="rev-list">
          {ordenadas.length === 0 ? (
            <div className="rev-vacio">No hay reseñas para mostrar.</div>
          ) : (
            ordenadas.map((r) => (
              <ReviewCard
                key={r.id}
                resena={r}
                onResponder={setResenaRespondiendo}
                onEliminarRespuesta={setResenaAEliminar}
              />
            ))
          )}
        </div>
      </div>

      <ReviewReplyDialog
        open={Boolean(resenaRespondiendo)}
        resena={resenaRespondiendo}
        onClose={() => setResenaRespondiendo(null)}
        onGuardar={guardarRespuesta}
      />

      <ConfirmDialog
        open={Boolean(resenaAEliminar)}
        titulo="Eliminar respuesta"
        mensaje={`¿Seguro que quieres eliminar tu respuesta a ${resenaAEliminar?.cliente ?? ""}? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminarRespuesta}
        onCancelar={() => setResenaAEliminar(null)}
      />
    </SellerTemplate>
  );
};

export default ReviewsScreen;