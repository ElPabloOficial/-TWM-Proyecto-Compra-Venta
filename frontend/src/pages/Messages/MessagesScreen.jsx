import { useEffect, useState } from "react";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import MessageTabs from "../../components/molecules/MessageTabs/MessageTabs";
import ConversationPanel from "../../components/organisms/ConversationPanel/ConversationPanel";
import QuestionsPanel from "../../components/organisms/QuestionsPanel/QuestionsPanel";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { messageService } from "../../services/messageService";
import "../../styles/Inventory.css";
import "../../styles/Messages.css";

// Bandeja del vendedor, en dos pestañas:
//   - Mensajes privados: las conversaciones con los clientes que le compraron (una por venta).
//   - Preguntas públicas: las preguntas de las fichas de sus productos; las que llevan más de
//     48 horas sin respuesta se marcan en rojo.
// (El cliente tiene su propia versión en /mensajes/cliente; el administrador supervisa todo en /mensajes.)
//
// Datos desde la API:
//   GET  /mensajes/mias?rol=vendedor  -> conversaciones (una por venta) con sus mensajes
//   PUT  /mensajes/venta/{id}/leer    -> al abrir una conversación
//   POST /mensajes                    -> enviar un mensaje
//   GET  /preguntas/vendedor          -> preguntas públicas de sus productos y servicios
//   PUT  /preguntas/responder         -> responder una pregunta

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC)
const hoyLocal = () => new Date().toLocaleDateString("sv-SE");

const MessagesScreen = () => {
  const [vista, setVista] = useState("privados");
  const [conversaciones, setConversaciones] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [ahora] = useState(() => Date.now()); // "ahora" se fija al abrir la pantalla
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [recarga, setRecarga] = useState(0);

  // Carga las conversaciones y las preguntas del vendedor
  useEffect(() => {
    let activo = true;

    setCargando(true);
    setError("");
    Promise.all([messageService.obtenerConversaciones("vendedor"), messageService.obtenerPreguntasVendedor()])
      .then(([convs, pregs]) => {
        if (!activo) return;
        setConversaciones(convs);
        setPreguntas(pregs);
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
  }, [recarga]);

  // ---------- Acciones ----------
  // El emprendedor no puede borrar las preguntas de los clientes (permisos del rol Emprendedor).
  const abrirConversacion = (id) => {
    const conversacion = conversaciones.find((c) => c.id === id);
    const hayPendientes = conversacion?.mensajes.some((m) => m.autor === "cliente" && !m.leido);
    if (!hayPendientes) return;

    // Al abrirla, los mensajes del cliente quedan como leídos
    setConversaciones((actuales) =>
      actuales.map((c) =>
        c.id === id ? { ...c, mensajes: c.mensajes.map((m) => ({ ...m, leido: true })) } : c
      )
    );
    messageService.marcarLeida(id).catch(() => {
      // Si falla, se vuelve a mostrar como sin leer
      setRecarga((n) => n + 1);
    });
  };

  const enviarMensaje = async (id, texto) => {
    console.log("[Mensajes] Enviar mensaje:", { conversacionId: id, autor: "vendedor", texto });
    setErrorAccion("");

    try {
      const creado = await messageService.enviarMensaje(id, texto);
      setConversaciones((actuales) =>
        actuales.map((c) =>
          c.id === id
            ? {
                ...c,
                mensajes: [
                  ...c.mensajes,
                  { id: creado?.id ?? Date.now(), autor: "vendedor", texto, fecha: hoyLocal(), hora: "", leido: true },
                ],
              }
            : c
        )
      );
    } catch (e) {
      setErrorAccion(`No se pudo enviar el mensaje: ${e.message}`);
    }
  };

  const responderPregunta = async (id, texto) => {
    console.log("[Preguntas] Responder:", { preguntaId: id, texto });
    setErrorAccion("");

    try {
      await messageService.responderPregunta(id, texto);
      setPreguntas((actuales) =>
        actuales.map((p) => (p.id === id ? { ...p, respuesta: { texto, fecha: new Date().toISOString() } } : p))
      );
    } catch (e) {
      setErrorAccion(`No se pudo guardar la respuesta: ${e.message}`);
    }
  };

  // ---------- Tarjetas de totales ----------
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

      {errorAccion && (
        <div className="msg-error" role="alert" style={{ color: "#d32f2f", margin: "8px 0" }}>
          {errorAccion}
        </div>
      )}

      {cargando ? (
        <p role="status">Cargando tus mensajes...</p>
      ) : error ? (
        <ErrorState titulo="No pudimos cargar tus mensajes" detalle={error} onReintentar={() => setRecarga((n) => n + 1)} />
      ) : vista === "privados" ? (
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
