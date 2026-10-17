import { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import "../../styles/Inventory.css";
import "../../styles/Messages.css";

// TEMPORAL: estas conversaciones son de ejemplo. Los clientes escriben desde la tienda;
// cuando se conecte el backend se cargan desde la API (solo las del vendedor).
const conversacionesIniciales = [
  {
    id: 1,
    cliente: "Camila Rojas",
    asunto: "Notebook Lenovo",
    mensajes: [
      { id: 1, autor: "cliente", texto: "Hola, ¿el notebook viene con garantía?", fecha: "2026-10-13", hora: "10:15", leido: true },
      { id: 2, autor: "vendedor", texto: "¡Hola Camila! Sí, tiene 12 meses de garantía directa.", fecha: "2026-10-13", hora: "10:22", leido: true },
      { id: 3, autor: "cliente", texto: "Perfecto, ¿y hacen despacho a Osorno?", fecha: "2026-10-13", hora: "10:30", leido: false },
    ],
  },
  {
    id: 2,
    cliente: "Matías Pérez",
    asunto: "Audífonos Bluetooth",
    mensajes: [
      { id: 4, autor: "cliente", texto: "Compré los audífonos y no conectan con mi celular.", fecha: "2026-10-12", hora: "18:40", leido: false },
      { id: 5, autor: "cliente", texto: "¿Me pueden ayudar?", fecha: "2026-10-12", hora: "18:41", leido: false },
    ],
  },
  {
    id: 3,
    cliente: "Francisca Soto",
    asunto: "Pedido PED-1006",
    mensajes: [
      { id: 6, autor: "cliente", texto: "¿Cuándo llega mi pedido?", fecha: "2026-10-11", hora: "09:05", leido: true },
      { id: 7, autor: "vendedor", texto: "Ya fue despachado, tu código de seguimiento es CH-4821763.", fecha: "2026-10-11", hora: "09:20", leido: true },
      { id: 8, autor: "cliente", texto: "¡Gracias!", fecha: "2026-10-11", hora: "09:25", leido: true },
    ],
  },
  {
    id: 4,
    cliente: "Diego Álvarez",
    asunto: "Hervidor eléctrico",
    mensajes: [
      { id: 9, autor: "cliente", texto: "¿Tienen stock del hervidor en color negro?", fecha: "2026-10-09", hora: "16:10", leido: true },
      { id: 10, autor: "vendedor", texto: "Por ahora solo en blanco, lo siento.", fecha: "2026-10-09", hora: "16:30", leido: true },
    ],
  },
  {
    id: 5,
    cliente: "Valentina Muñoz",
    asunto: "Cotización de mouse",
    mensajes: [
      { id: 11, autor: "cliente", texto: "Necesito una cotización por 10 mouse inalámbricos.", fecha: "2026-10-08", hora: "12:00", leido: false },
    ],
  },
];

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC)
const hoyLocal = () => new Date().toLocaleDateString("sv-SE");

const horaActual = () =>
  new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });

// 2026-10-13 -> 13/10
const fechaCorta = (iso) => {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
};

const ultimoMensaje = (c) => c.mensajes[c.mensajes.length - 1];

const mensajesSinLeer = (c) => c.mensajes.filter((m) => m.autor === "cliente" && !m.leido).length;

const MessagesScreen = () => {
  // TEMPORAL: las conversaciones viven solo en memoria (se pierden al recargar la página).
  const [conversaciones, setConversaciones] = useState(conversacionesIniciales);
  const [seleccionadaId, setSeleccionadaId] = useState(null);
  const [conversacionAEliminar, setConversacionAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [texto, setTexto] = useState("");
  const hiloRef = useRef(null);

  const seleccionada = conversaciones.find((c) => c.id === seleccionadaId) ?? null;

  // Al abrir un mensaje nuevo, baja hasta el final de la conversación
  useEffect(() => {
    if (hiloRef.current) hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
  }, [seleccionadaId, seleccionada?.mensajes.length]);

  // ---------- Acciones ----------
  // TEMPORAL: abrir, enviar y eliminar solo modifican el estado local.
  // Con el backend pasan a ser llamadas a la API (PUT de leído, POST del mensaje, DELETE).
  const abrirConversacion = (id) => {
    setSeleccionadaId(id);
    setTexto("");
    // Al abrirla, los mensajes del cliente quedan como leídos
    setConversaciones(
      conversaciones.map((c) =>
        c.id === id ? { ...c, mensajes: c.mensajes.map((m) => ({ ...m, leido: true })) } : c
      )
    );
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje) return;

    const datos = { conversacionId: seleccionada.id, autor: "vendedor", texto: mensaje };

    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados.
    // Con el backend esto se reemplaza por la llamada a la API (POST del mensaje).
    console.log("[Mensajes] Enviar mensaje:", datos);

    setConversaciones(
      conversaciones.map((c) =>
        c.id === seleccionada.id
          ? {
              ...c,
              mensajes: [
                ...c.mensajes,
                // TEMPORAL: el id, la fecha y la hora los pondrá la base de datos
                { id: Date.now(), autor: "vendedor", texto: mensaje, fecha: hoyLocal(), hora: horaActual(), leido: true },
              ],
            }
          : c
      )
    );
    setTexto("");
  };

  // Enter envía el mensaje; Shift + Enter agrega un salto de línea
  const teclaEnTexto = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form.requestSubmit();
    }
  };

  const confirmarEliminar = () => {
    // SIMULACIÓN (solo frontend): con el backend pasa a ser una llamada DELETE
    console.log("[Mensajes] Eliminar conversación:", conversacionAEliminar);
    setConversaciones(conversaciones.filter((c) => c.id !== conversacionAEliminar.id));
    if (seleccionadaId === conversacionAEliminar.id) setSeleccionadaId(null);
    setConversacionAEliminar(null);
  };

  // ---------- Búsqueda, filtro y orden de la lista ----------
  // TEMPORAL: se hacen aquí sobre todas las conversaciones en memoria.
  // Con el backend pasan a ser parámetros de la consulta (WHERE, ORDER BY).
  const texto_busqueda = busqueda.trim().toLowerCase();
  const lista = conversaciones
    .filter((c) => {
      if (filtro === "sin" && mensajesSinLeer(c) === 0) return false;
      if (!texto_busqueda) return true;
      return (
        c.cliente.toLowerCase().includes(texto_busqueda) ||
        c.asunto.toLowerCase().includes(texto_busqueda)
      );
    })
    .sort((a, b) => {
      const ua = ultimoMensaje(a);
      const ub = ultimoMensaje(b);
      return `${ub.fecha} ${ub.hora}`.localeCompare(`${ua.fecha} ${ua.hora}`);
    });

  // ---------- Tarjetas de totales ----------
  // TEMPORAL: se calculan en el frontend. Con la base de datos pasan a ser
  // consultas agregadas (COUNT de conversaciones y de mensajes no leídos).
  const totalSinLeer = conversaciones.reduce((acc, c) => acc + mensajesSinLeer(c), 0);
  const sinResponder = conversaciones.filter((c) => ultimoMensaje(c).autor === "cliente").length;

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Mensajes</h1>
          <div className="inv-subtitle">
            Responde las consultas de tus clientes sobre productos, pedidos y cotizaciones.
          </div>
        </div>
      </div>

      <div className="inv-stats">
        <StatCard titulo="Conversaciones" valor={conversaciones.length} />
        <StatCard titulo="Mensajes sin leer" valor={totalSinLeer} />
        <StatCard titulo="Esperando tu respuesta" valor={sinResponder} />
      </div>

      <div className="msg-panel">
        {/* ---------- Lista de conversaciones ---------- */}
        <div className="msg-lista">
          <div className="msg-filtros">
            <input
              type="search"
              className="msg-buscar"
              placeholder="Buscar cliente o asunto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar conversaciones"
            />
            <select
              className="inv-select"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              aria-label="Filtrar conversaciones"
            >
              <option value="">Todas</option>
              <option value="sin">Sin leer</option>
            </select>
          </div>

          <div className="msg-items">
            {lista.length === 0 && <div className="msg-vacio">No hay conversaciones.</div>}

            {lista.map((c) => {
              const ultimo = ultimoMensaje(c);
              const sinLeer = mensajesSinLeer(c);

              return (
                <button
                  key={c.id}
                  type="button"
                  className={`msg-item ${c.id === seleccionadaId ? "activa" : ""}`}
                  onClick={() => abrirConversacion(c.id)}
                >
                  <div className="msg-item-top">
                    <span className="msg-cliente">{c.cliente}</span>
                    <span className="msg-hora">{fechaCorta(ultimo.fecha)}</span>
                  </div>
                  <div className="msg-asunto">{c.asunto}</div>
                  <div className="msg-preview">
                    <span className="msg-preview-texto">
                      {ultimo.autor === "vendedor" ? "Tú: " : ""}
                      {ultimo.texto}
                    </span>
                    {sinLeer > 0 && <span className="msg-badge">{sinLeer}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Conversación abierta ---------- */}
        <div className="msg-hilo">
          {!seleccionada ? (
            <div className="msg-vacio">Selecciona una conversación para ver los mensajes.</div>
          ) : (
            <>
              <div className="msg-hilo-head">
                <div>
                  <div className="msg-cliente">{seleccionada.cliente}</div>
                  <div className="msg-asunto">{seleccionada.asunto}</div>
                </div>
                <button
                  type="button"
                  className="inv-icon-btn"
                  onClick={() => setConversacionAEliminar(seleccionada)}
                  aria-label="Eliminar conversación"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>

              <div className="msg-mensajes" ref={hiloRef}>
                {seleccionada.mensajes.map((m) => (
                  <div key={m.id} className={`msg-burbuja ${m.autor}`}>
                    {m.texto}
                    <span className="msg-burbuja-hora">
                      {fechaCorta(m.fecha)} {m.hora}
                    </span>
                  </div>
                ))}
              </div>

              <form className="msg-form" onSubmit={enviarMensaje}>
                <textarea
                  className="msg-input"
                  rows={2}
                  placeholder="Escribe tu respuesta..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={teclaEnTexto}
                  aria-label="Mensaje"
                />
                <button type="submit" className="msg-enviar" disabled={!texto.trim()}>
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(conversacionAEliminar)}
        titulo="Eliminar conversación"
        mensaje={`¿Seguro que quieres eliminar la conversación con ${conversacionAEliminar?.cliente ?? ""}? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setConversacionAEliminar(null)}
      />
    </SellerTemplate>
  );
};

export default MessagesScreen;
