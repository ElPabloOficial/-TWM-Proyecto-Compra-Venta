import { useState } from "react";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import MessageToolbar from "../../components/molecules/MessageToolbar/MessageToolbar";
import MessageModerationTable from "../../components/organisms/MessageModerationTable/MessageModerationTable";

const POR_PAGINA = 6;

//mensajes de prueba
const mensajesIniciales = [
  { id: 215, cliente: "Pedrito Peres", tipo: "Mensaje", mensaje: "no me gusto", fecha: "2024-12-12", estado: "pendiente" },
  { id: 367, cliente: "Pedrito Peres", tipo: "Reseña", mensaje: "muchas palabras", fecha: "2024-12-12", estado: "pendiente" },
  { id: 451, cliente: "Pedrito Peres", tipo: "Mensaje", mensaje: "muchas mas palabras: mensaje de prueba largo para probar como se muestra en la pantalla sin cortarse.", fecha: "2026-12-12", estado: "pendiente" },
  { id: 610, cliente: "Alita Gomes", tipo: "Reseña", mensaje: "esta increible", fecha: "2025-12-12", estado: "pendiente" },
  { id: 789, cliente: "Pedrito Peres", tipo: "Mensaje", mensaje: "esta en otros colores?", fecha: "2024-11-12", estado: "pendiente" },
];

const MessageModerationScreen = ()=> {
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [filtro, setFiltro] = useState("pendiente"); //muestra pendientes
  const [orden, setOrden] = useState("");
  const [pagina, setPagina] = useState(1);

  //CRUD
  const aprobarMensaje = (mensaje) => {
    setMensajes(mensajes.map((m) =>
      m.id === mensaje.id ? { ...m, estado: "aprobado" } : m
    )); //estado de mensaje aprobado x
  };

  const eliminarMensaje = (mensaje) => {
    if (window.confirm("¿Eliminar este mensaje?")) {
      setMensajes(mensajes.map((m) =>
        m.id === mensaje.id ? { ...m, estado: "eliminado" } : m
      ));
      // Estado eliminado x
    }
  };

  const verTodos = () => {
    setFiltro("");
    setPagina(1);
  };

  // filtros
  const filtrados = mensajes.filter((m) => {
    if (filtro === "pendiente") return m.estado === "pendiente";
    if (filtro === "aprobado") return m.estado === "aprobado";
    if (filtro === "eliminado") return m.estado === "eliminado";
    return true;
  });

  const comparadores = {
    fechaAsc: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    fechaDesc: (a, b) => new Date(b.fecha) - new Date(a.fecha),
    cliente: (a, b) => a.cliente.localeCompare(b.cliente),
  };
  const ordenados = orden ? [...filtrados].sort(comparadores[orden]) : filtrados;

  //pagina
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  //Stats sobre el total
  const pendientes = mensajes.filter((m) => m.estado === "pendiente").length;
  const aprobados = mensajes.filter((m) => m.estado === "aprobado").length;
  const eliminados = mensajes.filter((m) => m.estado === "eliminado").length;

  return (
    <AdminTemplate>
      <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
        Moderación de Mensajes
      </Box>
      <Box sx={{ fontSize: 13, marginTop: 0.5, color: "#666" }}>
        Revisa y gestiona los mensajes de usuario
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", marginY: 3 }}>
        <StatCard titulo="Total de Mensajes" valor={mensajes.length} />
        <StatCard titulo="Pendiente de revisión" valor={pendientes} />
        <StatCard titulo="Aprobado" valor={aprobados} />
        <StatCard titulo="Eliminados" valor={eliminados} />
      </Box>

      <Box sx={{ backgroundColor: "#fff", borderRadius: 1, padding: 2 }}>
        <MessageToolbar
          titulo={
            filtro === "pendiente"
              ? "Mensajes Pendientes de revisión"
              : "Mensajes"
          }
          total={ordenados.length}
          orden={orden}
          onOrden={(v) => { setOrden(v); setPagina(1); }}
          onVerTodos={verTodos}
        />

        <MessageModerationTable
          mensajes={visibles}
          onAprobar={aprobarMensaje}
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
    </AdminTemplate>
  );
};

export default MessageModerationScreen;