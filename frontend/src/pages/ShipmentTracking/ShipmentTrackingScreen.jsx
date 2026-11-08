import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import ShipmentAdvanceDialog from "../../components/organisms/ShipmentAdvanceDialog/ShipmentAdvanceDialog";
import {
  listarDespachosVendedor,
  avanzarDespacho,
  ETAPAS_DESPACHO,
  ETIQUETA_ESTADO,
} from "../../services/shipmentService";
import { useToast } from "../../context/ToastContext";

import "../../styles/Inventory.css";
import "../../styles/ShipmentTracking.css";

/*
 * Seguimiento de despachos (vendedor): ve el estado de los envíos de sus ventas y los avanza a la
 * etapa siguiente (En preparación -> Despachado -> En reparto -> Entregado).
 * El cliente ve el mismo avance en su pantalla de seguimiento del pedido.
 */

const FILTROS = ["Todos", ...ETAPAS_DESPACHO];

// Texto del botón que avanza cada estado
const ACCION = {
  "En Preparación": "Marcar como despachado",
  Despachado: "Marcar en reparto",
  "En reparto": "Marcar como entregado",
};

const aFecha = (iso) => new Date(String(iso).length === 10 ? `${iso}T12:00:00` : iso);
const fechaCorta = (iso) => aFecha(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });

const clase = (estado) => ETAPAS_DESPACHO.indexOf(estado);

const ShipmentTrackingScreen = () => {
  const { mostrarToast } = useToast();
  const [despachos, setDespachos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [avanzando, setAvanzando] = useState(null); // despacho que se está avanzando

  const cargar = () => {
    setCargando(true);
    setError("");
    listarDespachosVendedor()
      .then(setDespachos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const cuenta = (estado) => despachos.filter((d) => d.estado === estado).length;
  const visibles = despachos
    .filter((d) => filtro === "Todos" || d.estado === filtro)
    // Primero lo que falta por enviar, y lo entregado al final
    .sort((a, b) => clase(a.estado) - clase(b.estado) || a.idVenta - b.idVenta);

  const confirmarAvance = async (datos) => {
    const actualizado = await avanzarDespacho(avanzando.idVenta, datos); // si falla, la ventana muestra el error
    setDespachos((actuales) => actuales.map((d) => (d.idVenta === actualizado.idVenta ? actualizado : d)));
    setAvanzando(null);
    mostrarToast(`Pedido #${actualizado.idVenta} marcado como ${ETIQUETA_ESTADO[actualizado.estado].toLowerCase()}`);
  };

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Seguimiento de despachos</h1>
          <div className="inv-subtitle">
            Revisa el estado de los envíos de tus ventas y avanza cada uno a la etapa siguiente.
          </div>
        </div>
      </div>

      <div className="inv-stats">
        {ETAPAS_DESPACHO.map((etapa) => (
          <StatCard key={etapa} titulo={ETIQUETA_ESTADO[etapa]} valor={cuenta(etapa)} />
        ))}
      </div>

      {error && <ErrorState detalle={error} onReintentar={cargar} />}
      {cargando && !error && <p className="st-mensaje">Cargando despachos...</p>}

      {!cargando && !error && (
        <>
          <div className="st-filtros" role="tablist" aria-label="Filtrar por estado">
            {FILTROS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filtro === f}
                className={`st-filtro ${filtro === f ? "activo" : ""}`}
                onClick={() => setFiltro(f)}
              >
                {f === "Todos" ? `Todos (${despachos.length})` : `${ETIQUETA_ESTADO[f]} (${cuenta(f)})`}
              </button>
            ))}
          </div>

          <div className="st-tabla-scroll">
            <table className="st-tabla">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente y destino</th>
                  <th>Transportista</th>
                  <th>N.º de seguimiento</th>
                  <th>Estado</th>
                  <th>Costo de envío</th>
                  <th>Entrega</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((d) => (
                  <tr key={d.idVenta}>
                    <td>
                      <Link to={`/seguimiento/${d.idVenta}`} className="st-pedido">
                        #{d.idVenta}
                      </Link>
                    </td>
                    <td>
                      <span className="st-cliente">{d.cliente}</span>
                      <span className="st-destino">
                        {d.direccion.calle} {d.direccion.numero}, {d.direccion.comuna}
                      </span>
                    </td>
                    <td>{d.transportista ?? "—"}</td>
                    <td>{d.seguimiento ?? "Pendiente"}</td>
                    <td>
                      <span className={`st-estado st-estado-${clase(d.estado)}`}>{ETIQUETA_ESTADO[d.estado]}</span>
                    </td>
                    <td>{d.costoEnvio != null ? `$${d.costoEnvio.toLocaleString("es-CL")}` : "—"}</td>
                    <td>
                      {d.estado === "Entregado"
                        ? `Entregado el ${fechaCorta(d.eventos[0].fecha)}`
                        : `Llega el ${fechaCorta(d.fechaEstimada)}`}
                    </td>
                    <td>
                      {ACCION[d.estado] ? (
                        <button type="button" className="st-accion" onClick={() => setAvanzando(d)}>
                          {ACCION[d.estado]}
                        </button>
                      ) : (
                        <span className="st-sin-accion">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="st-vacio">
                      No hay despachos en este estado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ShipmentAdvanceDialog despacho={avanzando} onClose={() => setAvanzando(null)} onConfirmar={confirmarAvance} />
    </SellerTemplate>
  );
};

export default ShipmentTrackingScreen;
