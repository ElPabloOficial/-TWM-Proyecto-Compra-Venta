import { useState } from "react";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import MessageTabs from "../../components/molecules/MessageTabs/MessageTabs";
import ConversationPanel from "../../components/organisms/ConversationPanel/ConversationPanel";
import QuestionsPanel from "../../components/organisms/QuestionsPanel/QuestionsPanel";
import "../../styles/Inventory.css";
import "../../styles/Messages.css";

// Bandeja del vendedor, en dos pestañas:
//   - Mensajes privados: las conversaciones con los clientes que le compraron (una por venta).
//   - Preguntas públicas: las preguntas de las fichas de sus productos; las que llevan más de
//     48 horas sin respuesta se marcan en rojo.
// (El cliente tiene su propia versión en /mensajes/cliente; el administrador supervisa todo en /mensajes.)

// TEMPORAL: estas conversaciones son de ejemplo. Los clientes escriben desde la tienda;
// cuando se conecte el backend se cargan desde la API (solo las del vendedor).
const conversacionesIniciales = [
  {
    id: 1,
    contraparte: "Camila Rojas",
    asunto: "Notebook Lenovo",
    mensajes: [
      { id: 1, autor: "cliente", texto: "Hola, ¿el notebook viene con garantía?", fecha: "2026-10-13", hora: "10:15", leido: true },
      { id: 2, autor: "vendedor", texto: "¡Hola Camila! Sí, tiene 12 meses de garantía directa.", fecha: "2026-10-13", hora: "10:22", leido: true },
      { id: 3, autor: "cliente", texto: "Perfecto, ¿y hacen despacho a Osorno?", fecha: "2026-10-13", hora: "10:30", leido: false },
    ],
  },
  {
    id: 2,
    contraparte: "Matías Pérez",
    asunto: "Audífonos Bluetooth",
    mensajes: [
      { id: 4, autor: "cliente", texto: "Compré los audífonos y no conectan con mi celular.", fecha: "2026-10-12", hora: "18:40", leido: false },
      { id: 5, autor: "cliente", texto: "¿Me pueden ayudar?", fecha: "2026-10-12", hora: "18:41", leido: false },
    ],
  },
  {
    id: 3,
    contraparte: "Francisca Soto",
    asunto: "Pedido PED-1006",
    mensajes: [
      { id: 6, autor: "cliente", texto: "¿Cuándo llega mi pedido?", fecha: "2026-10-11", hora: "09:05", leido: true },
      { id: 7, autor: "vendedor", texto: "Ya fue despachado, tu código de seguimiento es CH-4821763.", fecha: "2026-10-11", hora: "09:20", leido: true },
      { id: 8, autor: "cliente", texto: "¡Gracias!", fecha: "2026-10-11", hora: "09:25", leido: true },
    ],
  },
  {
    id: 4,
    contraparte: "Diego Álvarez",
    asunto: "Hervidor eléctrico",
    mensajes: [
      { id: 9, autor: "cliente", texto: "¿Tienen stock del hervidor en color negro?", fecha: "2026-10-09", hora: "16:10", leido: true },
      { id: 10, autor: "vendedor", texto: "Por ahora solo en blanco, lo siento.", fecha: "2026-10-09", hora: "16:30", leido: true },
    ],
  },
  {
    id: 5,
    contraparte: "Valentina Muñoz",
    asunto: "Cotización de mouse",
    mensajes: [
      { id: 11, autor: "cliente", texto: "Necesito una cotización por 10 mouse inalámbricos.", fecha: "2026-10-08", hora: "12:00", leido: false },
    ],
  },
];

// TEMPORAL: preguntas de ejemplo. Las horas son relativas a "ahora" para que siempre
// haya algunas con alerta (+48 h) y otras recientes.
const haceHoras = (horas) => new Date(Date.now() - horas * 3600000).toISOString();

const preguntasIniciales = [
  { id: 1, producto: "Notebook Lenovo", productoId: 1, persona: "Camila Rojas", texto: "¿Incluye el cargador original y viene con Windows instalado?", fecha: haceHoras(60), respuesta: null },
  { id: 2, producto: "Mouse inalámbrico", productoId: 4, persona: "Valentina Muñoz", texto: "¿El receptor es USB-A o USB-C? Mi notebook solo tiene USB-C.", fecha: haceHoras(75), respuesta: null },
  { id: 3, producto: "Audífonos Bluetooth", productoId: 2, persona: "Matías Pérez", texto: "¿Son compatibles con iPhone?", fecha: haceHoras(30), respuesta: null },
  { id: 4, producto: "Hervidor eléctrico", productoId: 3, persona: "Diego Álvarez", texto: "¿Cuál es la capacidad en litros?", fecha: haceHoras(5), respuesta: null },
  {
    id: 5,
    producto: "Notebook Lenovo",
    productoId: 1,
    persona: "Francisca Soto",
    texto: "¿Cuánto demora el despacho a Osorno?",
    fecha: haceHoras(96),
    respuesta: { texto: "Entre 2 y 3 días hábiles con Chilexpress.", fecha: haceHoras(90) },
  },
];

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC)
const hoyLocal = () => new Date().toLocaleDateString("sv-SE");

const horaActual = () =>
  new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });

const MessagesScreen = () => {
  // TEMPORAL: todo vive solo en memoria (se pierde al recargar la página).
  const [vista, setVista] = useState("privados");
  const [conversaciones, setConversaciones] = useState(conversacionesIniciales);
  const [preguntas, setPreguntas] = useState(preguntasIniciales);
  const [ahora] = useState(() => Date.now()); // "ahora" se fija al abrir la pantalla

  // ---------- Acciones ----------
  // TEMPORAL: solo modifican el estado local. Con el backend pasan a ser llamadas a la API
  // (PUT de leído, POST del mensaje, PUT de la respuesta de la pregunta).
  // El emprendedor no puede borrar las preguntas de los clientes (permisos del rol Emprendedor).
  const abrirConversacion = (id) => {
    // Al abrirla, los mensajes del cliente quedan como leídos
    setConversaciones((actuales) =>
      actuales.map((c) =>
        c.id === id ? { ...c, mensajes: c.mensajes.map((m) => ({ ...m, leido: true })) } : c
      )
    );
  };

  const enviarMensaje = (id, texto) => {
    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados.
    console.log("[Mensajes] Enviar mensaje:", { conversacionId: id, autor: "vendedor", texto });

    setConversaciones((actuales) =>
      actuales.map((c) =>
        c.id === id
          ? {
              ...c,
              mensajes: [
                ...c.mensajes,
                // TEMPORAL: el id, la fecha y la hora los pondrá la base de datos
                { id: Date.now(), autor: "vendedor", texto, fecha: hoyLocal(), hora: horaActual(), leido: true },
              ],
            }
          : c
      )
    );
  };

  const responderPregunta = (id, texto) => {
    console.log("[Preguntas] Responder:", { preguntaId: id, texto });

    setPreguntas((actuales) =>
      actuales.map((p) => (p.id === id ? { ...p, respuesta: { texto, fecha: new Date().toISOString() } } : p))
    );
  };

  // ---------- Tarjetas de totales ----------
  // TEMPORAL: se calculan en el frontend. Con la base de datos pasan a ser consultas agregadas.
  const sinLeerDeCliente = (c) => c.mensajes.filter((m) => m.autor === "cliente" && !m.leido).length;
  const totalSinLeer = conversaciones.reduce((acc, c) => acc + sinLeerDeCliente(c), 0);
  const esperandoRespuesta = conversaciones.filter((c) => c.mensajes.at(-1)?.autor === "cliente").length;

  const sinResponder = preguntas.filter((p) => !p.respuesta);
  const conAlerta = sinResponder.filter((p) => (ahora - new Date(p.fecha).getTime()) / 3600000 > 48);

  const tabs = [
    { id: "privados", etiqueta: "Mensajes privados", contador: totalSinLeer },
    { id: "preguntas", etiqueta: "Preguntas públicas", contador: sinResponder.length },
  ];

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Mensajes</h1>
          <div className="inv-subtitle">
            Responde a tus clientes: mensajes sobre sus compras y preguntas públicas de tus productos.
          </div>
        </div>
      </div>

      <MessageTabs tabs={tabs} activa={vista} onCambiar={setVista} />

      {vista === "privados" ? (
        <>
          <div className="inv-stats">
            <StatCard titulo="Conversaciones" valor={conversaciones.length} />
            <StatCard titulo="Mensajes sin leer" valor={totalSinLeer} />
            <StatCard titulo="Esperando tu respuesta" valor={esperandoRespuesta} />
          </div>

          <ConversationPanel
            conversaciones={conversaciones}
            rol="vendedor"
            onAbrir={abrirConversacion}
            onEnviar={enviarMensaje}
            placeholderBusqueda="Buscar cliente o asunto..."
            placeholderMensaje="Escribe tu respuesta..."
            vacio="Todavía no tienes conversaciones. Cuando un cliente te escriba por una compra, aparecerá aquí."
          />
        </>
      ) : (
        <>
          <div className="inv-stats">
            <StatCard titulo="Sin responder" valor={sinResponder.length} />
            <StatCard titulo="Con alerta (+48 h)" valor={conAlerta.length} />
            <StatCard titulo="Respondidas" valor={preguntas.length - sinResponder.length} />
          </div>

          <QuestionsPanel preguntas={preguntas} rol="vendedor" ahora={ahora} onResponder={responderPregunta} />
        </>
      )}
    </SellerTemplate>
  );
};

export default MessagesScreen;
