import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { listarMisCotizaciones } from "../../services/quoteService";
import { authService } from "../../services/authService";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import "../../styles/Quotes.css"; // colores de los estados (quote-status-*)
import "../../styles/MyQuotes.css";

// Cotizaciones que pidió el cliente: si ya las respondieron, cuál es su estado y pedir una nueva.
// (La pantalla del vendedor está en /cotizaciones, dentro de su menú de gestión.)

const FILTROS = ["Todas", "Solicitada", "Respondida", "Aceptada", "Comprada", "Expirada"];

// Lo que el cliente debe saber de cada estado
const MENSAJES = {
  Solicitada: "Esperando respuesta del emprendedor",
  Respondida: "¡Ya te respondieron! Revisa el valor: puedes aceptarla y comprar de una vez",
  Aceptada: "Aceptada: ya puedes comprar con ella",
  Comprada: "Ya compraste con esta cotización",
  Expirada: "Venció: pide una nueva",
  Rechazada: "El emprendedor rechazó esta cotización",
};

const formatoFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
};

const formatoPrecio = (monto) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(monto);

const total = (cotizacion) => cotizacion.items.reduce((suma, it) => suma + it.unitPrice * it.quantity, 0);

const diasRestantes = (vence) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${vence}T00:00:00`) - hoy) / 86400000);
};

// Una cotización vencida se muestra como "Expirada" aunque no se haya actualizado
const estadoReal = (c) =>
  c.status !== "Aceptada" && c.status !== "Comprada" && c.status !== "Expirada" && diasRestantes(c.expirationDate) < 0 ? "Expirada" : c.status;

const MyQuotesScreen = () => {
  const navigate = useNavigate();
  const usuario = authService.getCurrentUser();
  const [quotes, setQuotes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [filtro, setFiltro] = useState("Todas");

  // GET /cotizaciones/mias
  useEffect(() => {
    if (!usuario) return;
    let activo = true;

    setCargando(true);
    setError("");
    listarMisCotizaciones()
      .then((datos) => {
        if (activo) setQuotes(datos);
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
  }, [usuario?.rut, recarga]);

  if (!usuario) return <Navigate to="/login" replace />;

  const cotizaciones = quotes.map((c) => ({ ...c, estado: estadoReal(c) }));
  const cuenta = (estado) => cotizaciones.filter((c) => c.estado === estado).length;
  const visibles = cotizaciones.filter((c) => filtro === "Todas" || c.estado === filtro);
  const porResponder = cuenta("Respondida");

  return (
    <>
      <Header />

      <main className="mq-page">
        <CustomButton
          variant="secondary"
          size="medium"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            border: "none",
            backgroundColor: "transparent",
            padding: "8px 0",
            marginBottom: "20px",
            justifyContent: "flex-start",
            textTransform: "none",
            "&:hover": { backgroundColor: "transparent", color: "#EC3333" },
          }}
        >
          Volver
        </CustomButton>

        <section className="mq-cabecera">
          <div>
            <h1>Mis cotizaciones</h1>
            <p className="mq-subtitulo">Revisa si te respondieron, el estado de cada una y pide una nueva.</p>
          </div>
          <CustomButton
            variant="primary"
            size="medium"
            onClick={() => navigate("/cotizaciones/nueva")}
            sx={{ border: "2px solid #EC3333", textTransform: "none" }}
          >
            + Nueva cotización
          </CustomButton>
        </section>

        {cargando ? (
          <p className="mq-mensaje" role="status">
            Cargando tus cotizaciones...
          </p>
        ) : error ? (
          <ErrorState titulo="No pudimos cargar tus cotizaciones" detalle={error} onReintentar={() => setRecarga((n) => n + 1)} />
        ) : (
          <>
        {porResponder > 0 && (
          <div className="mq-aviso" role="status">
            <strong>
              {porResponder === 1 ? "Tienes 1 cotización respondida" : `Tienes ${porResponder} cotizaciones respondidas`}
            </strong>
            <span>Revisa el valor y acéptala antes de que venza.</span>
            <button type="button" onClick={() => setFiltro("Respondida")}>
              Verlas
            </button>
          </div>
        )}

        <div className="mq-filtros" role="tablist" aria-label="Filtrar por estado">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filtro === f}
              className={`mq-filtro ${filtro === f ? "activo" : ""}`}
              onClick={() => setFiltro(f)}
            >
              {f === "Todas" ? `Todas (${cotizaciones.length})` : `${f} (${cuenta(f)})`}
            </button>
          ))}
        </div>

        {cotizaciones.length === 0 ? (
          <section className="mq-vacio">
            <ReceiptLongIcon className="mq-vacio-icono" />
            <h2>Aún no has pedido cotizaciones</h2>
            <p>Pide el valor de varios productos o servicios y un emprendedor te responderá.</p>
            <CustomButton variant="primary" size="medium" onClick={() => navigate("/cotizaciones/nueva")} sx={{ textTransform: "none" }}>
              Pedir mi primera cotización
            </CustomButton>
          </section>
        ) : visibles.length === 0 ? (
          <p className="mq-mensaje">No tienes cotizaciones en este estado.</p>
        ) : (
          <ul className="mq-lista">
            {visibles.map((c) => {
              const dias = diasRestantes(c.expirationDate);
              const vigente = c.estado === "Solicitada" || c.estado === "Respondida";
              return (
                <li key={c.id}>
                  <article className={`mq-tarjeta ${c.estado === "Respondida" ? "destacada" : ""}`}>
                    <div className="mq-tarjeta-cabecera">
                      <div>
                        <div className="mq-numero">Cotización #{c.id}</div>
                        <div className="mq-meta">
                          Pedida el {formatoFecha(c.issueDate)} · {c.seller.name}
                        </div>
                      </div>
                      <span className={`quote-status quote-status-${c.estado.toLowerCase()}`}>
                        {c.estado === "Aceptada" ? "Aceptada por el cliente" : c.estado}
                      </span>
                    </div>

                    <p className="mq-items">
                      {c.items.map((it) => `${it.name}${it.quantity > 1 ? ` x${it.quantity}` : ""}`).join(", ")}
                    </p>

                    <p className={`mq-estado-texto ${c.estado === "Respondida" ? "resaltado" : ""}`}>{MENSAJES[c.estado]}</p>

                    <div className="mq-pie">
                      <div>
                        <span className="mq-total">{total(c) > 0 ? formatoPrecio(total(c)) : "Por cotizar"}</span>
                        {vigente && dias >= 0 && (
                          <span className={`mq-vigencia ${dias <= 1 ? "urgente" : ""}`}>
                            {dias === 0 ? "Vence hoy" : `${dias} ${dias === 1 ? "día restante" : "días restantes"}`}
                          </span>
                        )}
                      </div>
                      <Link to={`/cotizaciones/${c.id}`} state={{ volverA: "/mis-cotizaciones" }} className="mq-detalle">
                        {c.estado === "Respondida" ? "Ver y aceptar >" : "Ver detalle >"}
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
          </>
        )}
      </main>
    </>
  );
};

export default MyQuotesScreen;