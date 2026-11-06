import { useState } from "react";

// Preguntas públicas de las fichas de producto. La usan los dos roles ("rol"):
//   - "vendedor": ve las preguntas de sus productos, con alerta roja si llevan más de 48 horas
//                 sin respuesta, y las responde desde aquí.
//   - "cliente":  ve las preguntas que hizo y si ya le respondieron (solo lectura).
//
// Una pregunta es: { id, producto, productoId, persona, texto, fecha, respuesta: null | { texto, fecha } }
// "fecha" es ISO con hora (la tabla Preguntas guarda fecha y hora). Una pregunta solo se responde una vez
// y la respuesta no se edita ni se borra (permisos del rol Emprendedor).
//
//   ahora                       -> hora actual en milisegundos (la pantalla la fija una sola vez)
//   onResponder(id, texto)      -> el vendedor publicó su respuesta
//   onVerProducto(productoId)   -> botón opcional "Ver producto"

const LIMITE_HORAS = 48; // pasado este plazo sin respuesta, la pregunta se marca con alerta
const MAX_CARACTERES = 200; // largo máximo de Preguntas.Respuesta en la base de datos

const horasDesde = (iso, ahora) => (ahora - new Date(iso).getTime()) / 3600000;

const hace = (horas) => {
  if (horas < 1) return "hace unos minutos";
  if (horas < 24) return `hace ${Math.floor(horas)} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
};

const fechaHora = (iso) =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const QuestionsPanel = ({ preguntas, rol, ahora, onResponder, onVerProducto }) => {
  const esVendedor = rol === "vendedor";
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [borradores, setBorradores] = useState({}); // respuesta a medio escribir, por pregunta

  const conAlerta = (p) => !p.respuesta && horasDesde(p.fecha, ahora) > LIMITE_HORAS;

  const buscado = busqueda.trim().toLowerCase();
  const lista = preguntas
    .filter((p) => {
      if (filtro === "sin" && p.respuesta) return false;
      if (filtro === "alerta" && !conAlerta(p)) return false;
      if (filtro === "resp" && !p.respuesta) return false;
      if (!buscado) return true;
      return (
        p.producto.toLowerCase().includes(buscado) ||
        p.texto.toLowerCase().includes(buscado) ||
        (p.persona ?? "").toLowerCase().includes(buscado)
      );
    })
    .sort((a, b) => {
      const fa = new Date(a.fecha).getTime();
      const fb = new Date(b.fecha).getTime();
      // Vendedor: primero lo pendiente, lo más antiguo arriba (es lo más urgente). Cliente: lo más reciente.
      if (esVendedor) {
        if (!!a.respuesta !== !!b.respuesta) return a.respuesta ? 1 : -1;
        return a.respuesta ? fb - fa : fa - fb;
      }
      return fb - fa;
    });

  const publicar = (e, pregunta) => {
    e.preventDefault();
    const texto = (borradores[pregunta.id] ?? "").trim();
    if (!texto) return;
    onResponder?.(pregunta.id, texto);
    setBorradores((anterior) => ({ ...anterior, [pregunta.id]: "" }));
  };

  return (
    <div className="msg-preguntas">
      <div className="msg-preguntas-barra">
        <input
          type="search"
          className="msg-buscar"
          placeholder={esVendedor ? "Buscar producto, cliente o texto..." : "Buscar producto o texto..."}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar preguntas"
        />
        <select
          className="inv-select"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar preguntas"
        >
          <option value="">Todas</option>
          {esVendedor ? (
            <>
              <option value="sin">Sin responder</option>
              <option value="alerta">Con alerta (+48 h)</option>
              <option value="resp">Respondidas</option>
            </>
          ) : (
            <>
              <option value="resp">Con respuesta</option>
              <option value="sin">Sin respuesta</option>
            </>
          )}
        </select>
      </div>

      {lista.length === 0 && (
        <div className="msg-vacio">
          {preguntas.length === 0
            ? esVendedor
              ? "Todavía no te han hecho preguntas."
              : "Todavía no has hecho preguntas. Puedes hacerlas desde la ficha de cualquier producto."
            : "No hay resultados."}
        </div>
      )}

      {lista.map((p) => {
        const alerta = conAlerta(p);
        const horas = horasDesde(p.fecha, ahora);
        const borrador = borradores[p.id] ?? "";

        let estado = { clase: "ok", texto: "Respondida" };
        if (!p.respuesta) {
          estado =
            esVendedor && alerta
              ? { clase: "alerta", texto: "Sin responder · +48 h" }
              : { clase: "pendiente", texto: esVendedor ? "Sin responder" : "Esperando respuesta" };
        }

        return (
          <article key={p.id} className={`msg-pregunta ${esVendedor && alerta ? "alerta" : ""}`}>
            <div className="msg-pregunta-cab">
              <div>
                <div className="msg-pregunta-producto">{p.producto}</div>
                <div className="msg-pregunta-meta">
                  {esVendedor ? `${p.persona} · ` : "Preguntaste "}
                  {hace(horas)} · {fechaHora(p.fecha)}
                </div>
              </div>
              <span className={`msg-estado ${estado.clase}`}>{estado.texto}</span>
            </div>

            <p className="msg-pregunta-texto">{p.texto}</p>

            {p.respuesta ? (
              <div className="msg-respuesta">
                <div className="msg-respuesta-cab">
                  <strong>{esVendedor ? "Tu respuesta" : "Respuesta del vendedor"}</strong>
                  <span>{fechaHora(p.respuesta.fecha)}</span>
                </div>
                <p>{p.respuesta.texto}</p>
              </div>
            ) : esVendedor ? (
              <form className="msg-responder" onSubmit={(e) => publicar(e, p)}>
                <textarea
                  className="msg-input"
                  rows={2}
                  maxLength={MAX_CARACTERES}
                  placeholder="Escribe tu respuesta pública..."
                  value={borrador}
                  onChange={(e) => setBorradores((anterior) => ({ ...anterior, [p.id]: e.target.value }))}
                  aria-label={`Respuesta a la pregunta de ${p.persona}`}
                />
                <div className="msg-responder-pie">
                  <span className="msg-contador">
                    {borrador.length}/{MAX_CARACTERES} · La respuesta es pública y no se puede editar ni borrar.
                  </span>
                  <button type="submit" className="msg-enviar" disabled={!borrador.trim()}>
                    Publicar respuesta
                  </button>
                </div>
              </form>
            ) : (
              <div className="msg-espera">El vendedor todavía no responde. Te avisaremos cuando lo haga.</div>
            )}

            {onVerProducto && (
              <button type="button" className="msg-link" onClick={() => onVerProducto(p.productoId)}>
                Ver producto
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default QuestionsPanel;
