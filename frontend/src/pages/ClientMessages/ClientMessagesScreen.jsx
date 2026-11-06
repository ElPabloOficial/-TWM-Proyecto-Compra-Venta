import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import MessageTabs from "../../components/molecules/MessageTabs/MessageTabs";
import ConversationPanel from "../../components/organisms/ConversationPanel/ConversationPanel";
import QuestionsPanel from "../../components/organisms/QuestionsPanel/QuestionsPanel";
import { authService } from "../../services/authService";

import "../../styles/Inventory.css"; // estilo del selector de filtro (inv-select)
import "../../styles/Messages.css";
import "../../styles/ClientMessages.css";

// "Mis mensajes" del cliente, en dos pestañas:
//   - Conversaciones: mensajes privados con el vendedor de cada compra (una conversación por compra;
//     solo se puede escribir sobre algo que ya compró).
//   - Mis preguntas: las preguntas públicas que hizo en las fichas de producto y si ya le respondieron.
// (El vendedor tiene su bandeja en /mensajes/vendedor.)

// TEMPORAL: conversaciones de ejemplo. Con el backend se cargan desde la API (solo las del cliente).
// La cuarta es una compra a la que todavía no le ha escrito al vendedor.
const conversacionesIniciales = [
  {
    id: 1,
    contraparte: "Tecnomarket Osorno",
    asunto: "Compra #1042 · Notebook Lenovo",
    fecha: "2026-10-10",
    mensajes: [
      { id: 1, autor: "cliente", texto: "Hola, ¿el notebook viene con garantía?", fecha: "2026-10-13", hora: "10:15", leido: true },
      { id: 2, autor: "vendedor", texto: "¡Hola! Sí, tiene 12 meses de garantía directa con nosotros.", fecha: "2026-10-13", hora: "10:22", leido: false },
    ],
  },
  {
    id: 2,
    contraparte: "Sonido Sur",
    asunto: "Compra #1038 · Audífonos Bluetooth",
    fecha: "2026-10-08",
    mensajes: [
      { id: 3, autor: "cliente", texto: "Compré los audífonos y no conectan con mi celular.", fecha: "2026-10-12", hora: "18:40", leido: true },
      { id: 4, autor: "vendedor", texto: "Mantén presionado el botón 10 segundos para reiniciarlos y vuelve a emparejarlos.", fecha: "2026-10-12", hora: "19:05", leido: false },
    ],
  },
  {
    id: 3,
    contraparte: "Casa Hogar Chile",
    asunto: "Compra #1031 · Hervidor eléctrico",
    fecha: "2026-10-05",
    mensajes: [
      { id: 5, autor: "cliente", texto: "¿Cuándo llega mi pedido?", fecha: "2026-10-11", hora: "09:05", leido: true },
    ],
  },
  {
    id: 4,
    contraparte: "Papelería El Roble",
    asunto: "Compra #1027 · Mouse inalámbrico",
    fecha: "2026-10-01",
    mensajes: [],
  },
];

// TEMPORAL: preguntas de ejemplo. Las horas son relativas a "ahora".
const haceHoras = (horas) => new Date(Date.now() - horas * 3600000).toISOString();

const preguntasIniciales = [
  { id: 1, producto: "Hervidor eléctrico", productoId: 3, texto: "¿Lo tienen en color negro?", fecha: haceHoras(6), respuesta: null },
  {
    id: 2,
    producto: "Notebook Lenovo",
    productoId: 1,
    texto: "¿Incluye el cargador original?",
    fecha: haceHoras(72),
    respuesta: { texto: "Sí, viene con su cargador original de 65 W.", fecha: haceHoras(60) },
  },
  {
    id: 3,
    producto: "Audífonos Bluetooth",
    productoId: 2,
    texto: "¿Cuánto dura la batería con carga completa?",
    fecha: haceHoras(120),
    respuesta: { texto: "Unas 20 horas de reproducción continua.", fecha: haceHoras(100) },
  },
];

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC)
const hoyLocal = () => new Date().toLocaleDateString("sv-SE");

const horaActual = () =>
  new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });

const ClientMessagesScreen = () => {
  const navigate = useNavigate();
  const [vista, setVista] = useState("conversaciones");
  // TEMPORAL: todo vive solo en memoria (se pierde al recargar la página).
  const [conversaciones, setConversaciones] = useState(conversacionesIniciales);
  const [preguntas] = useState(preguntasIniciales);
  const [ahora] = useState(() => Date.now());

  if (!authService.getCurrentUser()) return <Navigate to="/login" replace />;

  // ---------- Acciones ----------
  // TEMPORAL: solo modifican el estado local. Con el backend pasan a ser llamadas a la API
  // (PUT de leído y POST del mensaje).
  const abrirConversacion = (id) => {
    // Al abrirla, las respuestas del vendedor quedan como leídas
    setConversaciones((actuales) =>
      actuales.map((c) =>
        c.id === id ? { ...c, mensajes: c.mensajes.map((m) => ({ ...m, leido: true })) } : c
      )
    );
  };

  const enviarMensaje = (id, texto) => {
    console.log("[Mensajes] Enviar mensaje:", { conversacionId: id, autor: "cliente", texto });

    setConversaciones((actuales) =>
      actuales.map((c) =>
        c.id === id
          ? {
              ...c,
              mensajes: [
                ...c.mensajes,
                // TEMPORAL: el id, la fecha y la hora los pondrá la base de datos
                { id: Date.now(), autor: "cliente", texto, fecha: hoyLocal(), hora: horaActual(), leido: true },
              ],
            }
          : c
      )
    );
  };

  // Lo que el cliente todavía no ha leído de los vendedores
  const respuestasNuevas = conversaciones.reduce(
    (acc, c) => acc + c.mensajes.filter((m) => m.autor === "vendedor" && !m.leido).length,
    0
  );
  const preguntasConRespuesta = preguntas.filter((p) => p.respuesta).length;

  const tabs = [
    { id: "conversaciones", etiqueta: "Conversaciones", contador: respuestasNuevas },
    { id: "preguntas", etiqueta: "Mis preguntas", contador: 0 },
  ];

  return (
    <>
      <Header />

      <main className="cm-page">
        <div className="cm-cabecera">
          <h1>Mis mensajes</h1>
          <p className="cm-subtitulo">
            Escríbele al vendedor de tus compras y revisa las respuestas a tus preguntas.
          </p>
        </div>

        <MessageTabs tabs={tabs} activa={vista} onCambiar={setVista} />

        {vista === "conversaciones" ? (
          <>
            <div className="cm-nota">
              Aquí hay una conversación por cada compra que hiciste. Si quieres consultar algo antes de comprar,
              usa la sección de preguntas en la ficha del producto.
            </div>

            <ConversationPanel
              conversaciones={conversaciones}
              rol="cliente"
              onAbrir={abrirConversacion}
              onEnviar={enviarMensaje}
              placeholderBusqueda="Buscar vendedor o compra..."
              placeholderMensaje="Escríbele al vendedor..."
              accionHilo={() => (
                <button type="button" className="msg-link" onClick={() => navigate("/historial")}>
                  Ver mis compras
                </button>
              )}
              vacio={
                <div className="cm-vacio-accion">
                  <span>Todavía no tienes conversaciones. Aparecerán cuando hagas una compra.</span>
                  <button type="button" onClick={() => navigate("/catalogo")}>
                    Ir al catálogo
                  </button>
                </div>
              }
            />
          </>
        ) : (
          <>
            <div className="cm-nota">
              Estas son las preguntas públicas que hiciste en las fichas de producto
              ({preguntasConRespuesta} de {preguntas.length} ya tienen respuesta).
            </div>

            <QuestionsPanel
              preguntas={preguntas}
              rol="cliente"
              ahora={ahora}
              onVerProducto={(productoId) => navigate(`/producto/${productoId}`)}
            />
          </>
        )}
      </main>
    </>
  );
};

export default ClientMessagesScreen;
