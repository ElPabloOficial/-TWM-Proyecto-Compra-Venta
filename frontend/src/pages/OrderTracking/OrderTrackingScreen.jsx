import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { authService } from "../../services/authService";
import { obtenerDespacho, ETAPAS_DESPACHO, ETIQUETA_ESTADO } from "../../services/despachoService";
import { useToast } from "../../context/ToastContext";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import "../../styles/OrderTracking.css";

/*
 * Seguimiento de un pedido, para el cliente (estilo MercadoLibre):
 *   - una frase grande con cuándo llega
 *   - las 4 etapas del despacho
 *   - el historial de eventos, del más reciente al más antiguo
 *   - los datos del envío y los productos
 */

const ICONOS = [Inventory2OutlinedIcon, LocalShippingOutlinedIcon, RouteOutlinedIcon, HomeOutlinedIcon];

// "2026-11-08" -> mediodía local, para que la zona horaria no cambie el día
const aFecha = (iso) => new Date(String(iso).length === 10 ? `${iso}T12:00:00` : iso);

const fechaLarga = (iso) =>
  aFecha(iso).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

const fechaHora = (iso) =>
  aFecha(iso).toLocaleString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });

const esHoy = (iso) => aFecha(iso).toDateString() === new Date().toDateString();

// La frase grande de arriba, según el estado del despacho
const titular = (d) => {
  switch (d.estado) {
    case "En Preparación":
      return { titulo: "Estamos preparando tu pedido", detalle: `Llegará aproximadamente el ${fechaLarga(d.fechaEstimada)}.` };
    case "Despachado":
      return { titulo: `Llegará el ${fechaLarga(d.fechaEstimada)}`, detalle: `Tu pedido ya salió con ${d.transportista}.` };
    case "En reparto":
      return {
        titulo: esHoy(d.fechaEstimada) ? "Llega hoy" : `Llegará el ${fechaLarga(d.fechaEstimada)}`,
        detalle: "Tu pedido está en reparto.",
      };
    default:
      return { titulo: `Entregado el ${fechaLarga(d.eventos[0].fecha)}`, detalle: "Esperamos que disfrutes tu compra." };
  }
};

const OrderTrackingScreen = () => {
  const { idVenta } = useParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [despacho, setDespacho] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const sesion = Boolean(authService.getCurrentUser());

  useEffect(() => {
    if (!sesion) return;
    obtenerDespacho(idVenta)
      .then(setDespacho)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [idVenta, sesion]);

  if (!sesion) return <Navigate to="/login" replace />;

  const copiarSeguimiento = () => {
    navigator.clipboard?.writeText(despacho.seguimiento).then(() => mostrarToast("Número de seguimiento copiado"));
  };

  const indice = despacho ? ETAPAS_DESPACHO.indexOf(despacho.estado) : 0;
  const entregado = despacho?.estado === "Entregado";
  const { titulo, detalle } = despacho ? titular(despacho) : {};
  const dir = despacho?.direccion;

  return (
    <>
      <Header />

      <main className="ot-page">
        <CustomButton
          variant="secondary"
          size="medium"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/historial")}
          sx={{
            border: "none",
            backgroundColor: "transparent",
            padding: "8px 0",
            marginBottom: "16px",
            justifyContent: "flex-start",
            textTransform: "none",
            "&:hover": { backgroundColor: "transparent", color: "#EC3333" },
          }}
        >
          Volver a Mis compras
        </CustomButton>

        {cargando && <p className="ot-mensaje">Cargando el seguimiento...</p>}
        {error && <p className="ot-mensaje ot-error">{error}</p>}

        {despacho && (
          <div className="ot-layout">
            {/* ---------- Columna principal ---------- */}
            <div className="ot-principal">
              <section className="ot-tarjeta">
                <p className="ot-pedido">Pedido #{despacho.idVenta}</p>
                <h1 className={`ot-titular ${entregado ? "entregado" : ""}`}>{titulo}</h1>
                <p className="ot-detalle">{detalle}</p>

                <ol className="ot-etapas" aria-label="Etapas del despacho">
                  {ETAPAS_DESPACHO.map((etapa, i) => {
                    const Icono = ICONOS[i];
                    const completada = i < indice || entregado;
                    const actual = i === indice && !entregado;
                    return (
                      <li
                        key={etapa}
                        className={`ot-etapa ${completada ? "completada" : ""} ${actual ? "actual" : ""}`}
                        aria-current={actual ? "step" : undefined}
                      >
                        <span className="ot-etapa-circulo">
                          <Icono fontSize="small" aria-hidden="true" />
                        </span>
                        <span className="ot-etapa-nombre">{ETIQUETA_ESTADO[etapa]}</span>
                      </li>
                    );
                  })}
                </ol>
              </section>

              <section className="ot-tarjeta">
                <h2 className="ot-subtitulo">Historial del envío</h2>
                <ol className="ot-historial">
                  {despacho.eventos.map((evento, i) => (
                    <li key={`${evento.estado}-${evento.fecha}`} className={`ot-evento ${i === 0 ? "reciente" : ""}`}>
                      <span className="ot-evento-punto" aria-hidden="true" />
                      <div>
                        <div className="ot-evento-titulo">{ETIQUETA_ESTADO[evento.estado]}</div>
                        <div className="ot-evento-detalle">{evento.detalle}</div>
                        <div className="ot-evento-fecha">{fechaHora(evento.fecha)}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* ---------- Columna lateral ---------- */}
            <aside className="ot-lateral">
              <section className="ot-tarjeta">
                <h2 className="ot-subtitulo">Datos del envío</h2>

                <dl className="ot-datos">
                  <div>
                    <dt>Transportista</dt>
                    <dd>{despacho.transportista ?? "Se asignará al despachar"}</dd>
                  </div>
                  <div>
                    <dt>N.º de seguimiento</dt>
                    <dd>
                      {despacho.seguimiento ? (
                        <>
                          <span className="ot-seguimiento">{despacho.seguimiento}</span>
                          <button type="button" className="ot-copiar" onClick={copiarSeguimiento}>
                            Copiar
                          </button>
                        </>
                      ) : (
                        "Aún sin asignar"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Dirección de entrega</dt>
                    <dd>
                      {[`${dir.calle} ${dir.numero}`.trim(), dir.comuna].filter(Boolean).join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt>Recibe</dt>
                    <dd>{despacho.cliente}</dd>
                  </div>
                </dl>
              </section>

              {despacho.productos.length > 0 && (
                <section className="ot-tarjeta">
                  <h2 className="ot-subtitulo">Productos</h2>
                  <ul className="ot-productos">
                    {despacho.productos.map((p) => (
                      <li key={p.nombre}>
                        <span>{p.nombre}</span>
                        <span className="ot-cantidad">x{p.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        )}
      </main>
    </>
  );
};

export default OrderTrackingScreen;
