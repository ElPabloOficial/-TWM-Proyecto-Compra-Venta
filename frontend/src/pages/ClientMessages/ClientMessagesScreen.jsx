import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import MessageTabs from "../../components/molecules/MessageTabs/MessageTabs";
import ConversationPanel from "../../components/organisms/ConversationPanel/ConversationPanel";
import QuestionsPanel from "../../components/organisms/QuestionsPanel/QuestionsPanel";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { messageService } from "../../services/messageService";
import { authService } from "../../services/authService";

import "../../styles/Inventory.css"; // estilo del selector de filtro (inv-select)
import "../../styles/Messages.css";
import "../../styles/ClientMessages.css";

// "Mis mensajes" del cliente, en dos pestañas:
//   - Conversaciones: mensajes privados con el vendedor de cada compra (una conversación por compra;
//     solo se puede escribir sobre algo que ya compró).
//   - Mis preguntas: las preguntas públicas que hizo en las fichas de producto y si ya le respondieron.
// (El vendedor tiene su bandeja en /mensajes/vendedor.)
//
// Datos desde la API:
//   GET  /mensajes/mias?rol=cliente   -> conversaciones (una por compra) con sus mensajes
//   PUT  /mensajes/venta/{id}/leer    -> al abrir una conversación
//   POST /mensajes                    -> enviar un mensaje
//   GET  /preguntas/mias              -> las preguntas públicas del cliente

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC)
const hoyLocal = () => new Date().toLocaleDateString("sv-SE");

const ClientMessagesScreen = () => {
  const navigate = useNavigate();
  const usuario = authService.getCurrentUser();
  const [vista, setVista] = useState("conversaciones");
  const [conversaciones, setConversaciones] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [ahora] = useState(() => Date.now());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");
  const [recarga, setRecarga] = useState(0);

  // Carga las conversaciones y las preguntas del cliente
  useEffect(() => {
    if (!usuario) return;
    let activo = true;

    setCargando(true);
    setError("");
    Promise.all([messageService.obtenerConversaciones("cliente"), messageService.obtenerMisPreguntas()])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recarga]);

  if (!usuario) return <Navigate to="/login" replace />;

  // ---------- Acciones ----------
  const abrirConversacion = (id) => {
    const conversacion = conversaciones.find((c) => c.id === id);
    const hayPendientes = conversacion?.mensajes.some((m) => m.autor === "vendedor" && !m.leido);
    if (!hayPendientes) return;

    // Al abrirla, las respuestas del vendedor quedan como leídas
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
    // console.log("[Mensajes] Enviar mensaje:", { conversacionId: id, autor: "cliente", texto });
    setErrorEnvio("");

    try {
      const creado = await messageService.enviarMensaje(id, texto);
      setConversaciones((actuales) =>
        actuales.map((c) =>
          c.id === id
            ? {
                ...c,
                mensajes: [
                  ...c.mensajes,
                  { id: creado?.id ?? Date.now(), autor: "cliente", texto, fecha: hoyLocal(), hora: "", leido: true },
                ],
              }
            : c
        )
      );
    } catch (e) {
      setErrorEnvio(e.message);
    }
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

        {cargando ? (
          <p className="cm-nota" role="status">Cargando tus mensajes...</p>
        ) : error ? (
          <ErrorState titulo="No pudimos cargar tus mensajes" detalle={error} onReintentar={() => setRecarga((n) => n + 1)} />
        ) : vista === "conversaciones" ? (
          <>
            <div className="cm-nota">
              Aquí hay una conversación por cada compra que hiciste. Si quieres consultar algo antes de comprar,
              usa la sección de preguntas en la ficha del producto.
            </div>

            {errorEnvio && (
              <div className="cm-nota" role="alert">
                No se pudo enviar el mensaje: {errorEnvio}
              </div>
            )}

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
              onVerProducto={(itemId, pregunta) => navigate(`/${pregunta?.tipo === "servicio" ? "servicio" : "producto"}/${itemId}`)}
            />
          </>
        )}
      </main>
    </>
  );
};

export default ClientMessagesScreen;
