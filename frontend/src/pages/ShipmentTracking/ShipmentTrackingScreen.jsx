import { useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Header from "../../components/organisms/Header/Header";
import "../../styles/ShipmentTracking.css";

const etapas = [
  { nombre: "Pedido confirmado", Icono: CheckCircleIcon },
  { nombre: "En preparación", Icono: Inventory2OutlinedIcon },
  { nombre: "Despachado", Icono: LocalShippingOutlinedIcon },
  { nombre: "En camino", Icono: RouteOutlinedIcon },
  { nombre: "Entregado", Icono: HomeOutlinedIcon },
];

const despachos = [
  {
    pedido: "PED-1006",
    destinatario: "Francisca Soto",
    destino: "Bilbao 320, Puerto Montt",
    transportista: "Chilexpress",
    seguimiento: "CH-4821763",
    estado: "En camino",
    etapaActual: 3,
    fecha: "2026-10-27",
  },
  {
    pedido: "PED-1002",
    destinatario: "Sofía Contreras",
    destino: "Errázuriz 640, Valdivia",
    transportista: "Starken",
    seguimiento: "ST-3390412",
    estado: "Despachado",
    etapaActual: 2,
    fecha: "2026-10-28",
  },
  {
    pedido: "PED-1007",
    destinatario: "Matías Pérez",
    destino: "Av. Buschmann 1450, Osorno",
    transportista: "Blue Express",
    seguimiento: "Pendiente",
    estado: "En preparación",
    etapaActual: 1,
    fecha: "2026-10-29",
  },
  {
    pedido: "PED-1008",
    destinatario: "Camila Rojas",
    destino: "Mackenna 850, Osorno",
    transportista: "Chilexpress",
    seguimiento: "Pendiente",
    estado: "Pedido confirmado",
    etapaActual: 0,
    fecha: "2026-10-30",
  },
  {
    pedido: "PED-1005",
    destinatario: "Diego Álvarez",
    destino: "Los Leones 1200, Providencia",
    transportista: "Chilexpress",
    seguimiento: "CH-4790021",
    estado: "Entregado",
    etapaActual: 4,
    fecha: "2026-10-24",
  },
];

const formatearFecha = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
  });

const ShipmentTrackingScreen = () => {
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(despachos[0]);

  return (
    <div className="seguimiento-pagina">
      <Header />
      <main className="seguimiento-contenido">
        <div className="seguimiento-encabezado">
          <div>
            <h1>Seguimiento de despacho</h1>
            <p className="seguimiento-pedido">Pedido {despachoSeleccionado.pedido}</p>
          </div>
          <p>
            {despachoSeleccionado.estado === "Entregado"
              ? `Entregado el ${formatearFecha(despachoSeleccionado.fecha)}`
              : `Entrega estimada: ${formatearFecha(despachoSeleccionado.fecha)}`}
          </p>
        </div>

        <ol className="seguimiento-etapas" aria-label="Estado del despacho">
          {etapas.map(({ nombre, Icono }, index) => {
            const completada = index < despachoSeleccionado.etapaActual;
            const actual = index === despachoSeleccionado.etapaActual;

            return (
              <li
                className={`seguimiento-etapa${completada ? " seguimiento-etapa-completada" : ""}${actual ? " seguimiento-etapa-actual" : ""}`}
                aria-current={actual ? "step" : undefined}
                key={nombre}
              >
                <div className="seguimiento-etapa-circulo">
                  <Icono aria-hidden="true" />
                </div>
                <span>{nombre}</span>
                {index < etapas.length - 1 && (
                  <span
                    className={`seguimiento-conector${completada ? " seguimiento-conector-completado" : ""}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        <section className="seguimiento-listado" aria-labelledby="despachos-titulo">
          <div className="seguimiento-listado-encabezado">
            <div>
              <h2 id="despachos-titulo">Lista de Despachos</h2>
              <p>Selecciona un pedido para consultar su avance.</p>
            </div>
            <span>{despachos.length} pedidos</span>
          </div>

          <div className="seguimiento-tabla-contenedor">
            <table className="seguimiento-tabla">
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Destinatario y destino</th>
                  <th scope="col">Transportista</th>
                  <th scope="col">N.º de seguimiento</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Entrega</th>
                </tr>
              </thead>
              <tbody>
                {despachos.map((despacho) => {
                  const seleccionado = despacho.pedido === despachoSeleccionado.pedido;

                  return (
                    <tr
                      className={seleccionado ? "seguimiento-fila-seleccionada" : ""}
                      key={despacho.pedido}
                    >
                      <td>
                        <button
                          className="seguimiento-pedido-boton"
                          type="button"
                          aria-pressed={seleccionado}
                          onClick={() => setDespachoSeleccionado(despacho)}
                        >
                          {despacho.pedido}
                        </button>
                      </td>
                      <td>
                        <span className="seguimiento-destinatario">{despacho.destinatario}</span>
                        <span className="seguimiento-destino">{despacho.destino}</span>
                      </td>
                      <td>{despacho.transportista}</td>
                      <td>{despacho.seguimiento}</td>
                      <td>
                        <span className={`seguimiento-estado seguimiento-estado-${despacho.etapaActual}`}>
                          {despacho.estado}
                        </span>
                      </td>
                      <td>{formatearFecha(despacho.fecha)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ShipmentTrackingScreen;
