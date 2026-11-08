import { useEffect, useRef, useState } from "react";

// Mensajería privada: lista de conversaciones a la izquierda y el chat abierto a la derecha.
// La usan los dos roles; "rol" dice quién está mirando ("vendedor" o "cliente"):
//   - los mensajes de ese rol salen a la derecha, en rojo
//   - "sin leer" son los mensajes de la otra persona que todavía no se abrieron
//
// Una conversación es: { id, contraparte, asunto, fecha?, mensajes: [{ id, autor, texto, fecha, hora, leido }] }
// "autor" es "cliente" o "vendedor". Una conversación sin mensajes es válida: es una compra
// a la que todavía no se le ha escrito.
//
// Los datos viven en la pantalla que usa este panel (así calcula sus propios totales):
//   onAbrir(id)           -> el usuario abrió una conversación
//   onEnviar(id, texto)   -> el usuario envió un mensaje
//   accionHilo(c)         -> botón extra opcional en la cabecera del chat (p. ej. "Ver mi compra")

// 2026-10-13 -> 13/10
const fechaCorta = (iso) => {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
};

const ultimoMensaje = (c) => c.mensajes[c.mensajes.length - 1] ?? null;

const ConversationPanel = ({
  conversaciones,
  rol,
  onAbrir,
  onEnviar,
  accionHilo,
  placeholderBusqueda = "Buscar...",
  placeholderMensaje = "Escribe tu mensaje...",
  vacio = "No hay conversaciones.",
}) => {
  const [seleccionadaId, setSeleccionadaId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [texto, setTexto] = useState("");
  const hiloRef = useRef(null);

  const seleccionada = conversaciones.find((c) => c.id === seleccionadaId) ?? null;

  const sinLeer = (c) => c.mensajes.filter((m) => m.autor !== rol && !m.leido).length;

  // Al abrir una conversación o recibir un mensaje, baja hasta el final del chat
  useEffect(() => {
    if (hiloRef.current) hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
  }, [seleccionadaId, seleccionada?.mensajes.length]);

  const abrir = (id) => {
    setSeleccionadaId(id);
    setTexto("");
    onAbrir?.(id);
  };

  const enviar = (e) => {
    e.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje) return;
    console.log("[Mensajes] Enviar mensaje:", { conversacion: seleccionada.id, mensaje });
    onEnviar?.(seleccionada.id, mensaje);
    setTexto("");
  };

  // Enter envía el mensaje; Shift + Enter agrega un salto de línea
  const teclaEnTexto = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form.requestSubmit();
    }
  };

  // ---------- Búsqueda, filtro y orden de la lista ----------
  const buscado = busqueda.trim().toLowerCase();
  const claveOrden = (c) => {
    const ultimo = ultimoMensaje(c);
    return ultimo ? `${ultimo.fecha} ${ultimo.hora}` : `${c.fecha ?? ""} 00:00`;
  };

  const lista = conversaciones
    .filter((c) => {
      if (filtro === "sin" && sinLeer(c) === 0) return false;
      if (!buscado) return true;
      return c.contraparte.toLowerCase().includes(buscado) || c.asunto.toLowerCase().includes(buscado);
    })
    .sort((a, b) => claveOrden(b).localeCompare(claveOrden(a)));

  return (
    <div className="msg-panel">
      {/* ---------- Lista de conversaciones ---------- */}
      <div className="msg-lista">
        <div className="msg-filtros">
          <input
            type="search"
            className="msg-buscar"
            placeholder={placeholderBusqueda}
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
          {lista.length === 0 && (
            <div className="msg-vacio">{conversaciones.length === 0 ? vacio : "No hay resultados."}</div>
          )}

          {lista.map((c) => {
            const ultimo = ultimoMensaje(c);
            const pendientes = sinLeer(c);
            const fecha = ultimo?.fecha ?? c.fecha;

            return (
              <button
                key={c.id}
                type="button"
                className={`msg-item ${c.id === seleccionadaId ? "activa" : ""}`}
                onClick={() => abrir(c.id)}
              >
                <div className="msg-item-top">
                  <span className="msg-cliente">{c.contraparte}</span>
                  {fecha && <span className="msg-hora">{fechaCorta(fecha)}</span>}
                </div>
                <div className="msg-asunto">{c.asunto}</div>
                <div className="msg-preview">
                  <span className="msg-preview-texto">
                    {ultimo ? `${ultimo.autor === rol ? "Tú: " : ""}${ultimo.texto}` : "Sin mensajes todavía"}
                  </span>
                  {pendientes > 0 && <span className="msg-badge">{pendientes}</span>}
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
                <div className="msg-cliente">{seleccionada.contraparte}</div>
                <div className="msg-asunto">{seleccionada.asunto}</div>
              </div>
              {accionHilo?.(seleccionada)}
            </div>

            <div className="msg-mensajes" ref={hiloRef}>
              {seleccionada.mensajes.length === 0 && (
                <div className="msg-vacio">Aún no hay mensajes. Escribe el primero.</div>
              )}
              {seleccionada.mensajes.map((m) => (
                <div key={m.id} className={`msg-burbuja ${m.autor === rol ? "mia" : "otra"}`}>
                  {m.texto}
                  <span className="msg-burbuja-hora">
                    {fechaCorta(m.fecha)} {m.hora}
                  </span>
                </div>
              ))}
            </div>

            <form className="msg-form" onSubmit={enviar}>
              <textarea
                className="msg-input"
                rows={2}
                maxLength={200}
                placeholder={placeholderMensaje}
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
  );
};

export default ConversationPanel;
