import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import MessageToolbar from "../../components/molecules/MessageToolbar/MessageToolbar";
import MessageModerationTable from "../../components/organisms/MessageModerationTable/MessageModerationTable";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { listarContenidoModeracion, eliminarContenido } from "../../services/adminService";

const POR_PAGINA = 6;

const MessageModerationScreen = ()=> {
  const { mostrarToast } = useToast();
  const [mensajes, setMensajes] = useState([]);
  const [revisados, setRevisados] = useState(0); // total de mensajes y reseñas analizados
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [ocupado, setOcupado] = useState(null); // clave del mensaje que se está procesando
  const [orden, setOrden] = useState("");
  const [pagina, setPagina] = useState(1);
  const [mensajeAEliminar, setMensajeAEliminar] = useState(null); // mensaje pendiente de confirmar

  // Carga los mensajes y reseñas desde la API
  useEffect(() => {
    let activo = true;

    setCargando(true);
    setErrorCarga("");
    listarContenidoModeracion()
      .then(({ revisados: total, items }) => {
        if (activo) {
          setMensajes(items);
          setRevisados(total);
        }
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

  //CRUD
  // El botón solo abre el diálogo de confirmación
  const eliminarMensaje = (mensaje) => setMensajeAEliminar(mensaje);

  const confirmarEliminar = async () => {
    const mensaje = mensajeAEliminar;
    if (!mensaje) return;
    setMensajeAEliminar(null);
    console.log("[Moderación] Eliminar:", { tipo: mensaje.tipo, id: mensaje.id });
    setOcupado(mensaje.clave);
    try {
      await eliminarContenido(mensaje);
      setMensajes((actuales) => actuales.filter((m) => m.clave !== mensaje.clave));
      mostrarToast(mensaje.tipo === "Reseña" ? "Reseña eliminada correctamente" : "Mensaje eliminado correctamente");
    } catch (e) {
      mostrarToast(e.message, "error");
    } finally {
      setOcupado(null);
    }
  };

  const comparadores = {
    fechaAsc: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    fechaDesc: (a, b) => new Date(b.fecha) - new Date(a.fecha),
    cliente: (a, b) => a.cliente.localeCompare(b.cliente),
  };
  const ordenados = orden ? [...mensajes].sort(comparadores[orden]) : mensajes;

  //pagina
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  //Stats sobre el total
  const totalMensajes = mensajes.filter((m) => m.tipo === "Mensaje").length;
  const totalResenas = mensajes.filter((m) => m.tipo === "Reseña").length;

  return (
    <AdminTemplate>
      <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
        Moderación de Mensajes
      </Box>
      <Box sx={{ fontSize: 13, marginTop: 0.5, color: "#666" }}>
        Aquí aparecen los mensajes y reseñas que contienen palabras ofensivas o amenazas.
        {!cargando && !errorCarga && ` Se analizaron ${revisados.toLocaleString("es-CL")} mensajes y reseñas.`}
      </Box>

      {cargando ? (
        <Box role="status" sx={{ marginY: 3 }}>Cargando mensajes...</Box>
      ) : errorCarga ? (
        <ErrorState
          titulo="No pudimos cargar los mensajes"
          detalle={errorCarga}
          onReintentar={() => setRecarga((n) => n + 1)}
        />
      ) : (
        <>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", marginY: 3 }}>
        <StatCard titulo="Detectados" valor={mensajes.length} />
        <StatCard titulo="Mensajes" valor={totalMensajes} />
        <StatCard titulo="Reseñas" valor={totalResenas} />
      </Box>

      <Box sx={{ backgroundColor: "#fff", borderRadius: 1, padding: 2 }}>
        <MessageToolbar
          titulo="Mensajes y reseñas detectados"
          total={ordenados.length}
          orden={orden}
          onOrden={(v) => { setOrden(v); setPagina(1); }}
        />

        <MessageModerationTable
          mensajes={visibles}
          ocupado={ocupado}
          onEliminar={eliminarMensaje}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2, fontSize: 12 }}>
          <Box>Mostrando {desde}-{hasta} de {ordenados.length} mensaje{ordenados.length !== 1 ? "s" : ""}</Box>
          <Pagination
            count={totalPaginas}
            page={paginaActual}
            onChange={(_, valor) => setPagina(valor)}
            size="small"
            shape="rounded"
            sx={{ "& .Mui-selected": { backgroundColor: "#EC3333 !important", color: "#fff" } }}
          />
        </Box>
      </Box>

        </>
      )}

      <ConfirmDialog
        open={Boolean(mensajeAEliminar)}
        titulo="Eliminar mensaje"
        mensaje={`¿Eliminar ${mensajeAEliminar?.tipo === "Reseña" ? "esta reseña" : "este mensaje"}? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setMensajeAEliminar(null)}
      />
    </AdminTemplate>
  );
};

export default MessageModerationScreen;