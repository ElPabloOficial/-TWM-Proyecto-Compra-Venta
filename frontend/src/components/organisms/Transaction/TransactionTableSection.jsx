// TransactionTableSection.jsx
//
// Tabla de transacciones (ventas) del panel de administración, con búsqueda,
// orden, paginación y un diálogo con el detalle de cada venta.
import { useState } from "react";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CustomButton from "../../atoms/Button/CustomButton";

const POR_PAGINA = 8;

const CLASE_ESTADO = { completada: "completed", anulada: "cancelled", pendiente: "pending" };

// texto en minúsculas y sin tildes, para buscar sin que importen las mayúsculas ni los acentos
const normalizar = (texto) =>
  String(texto ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;
const formatoFecha = (f) => (f ? new Date(f).toLocaleDateString("es-CL") : "—");
const marcaDeTiempo = (f) => (f ? new Date(f).getTime() : 0);

const ORDENES = {
  "fecha-desc": (a, b) => marcaDeTiempo(b.fecha) - marcaDeTiempo(a.fecha) || b.id - a.id,
  "fecha-asc": (a, b) => marcaDeTiempo(a.fecha) - marcaDeTiempo(b.fecha) || a.id - b.id,
  "monto-desc": (a, b) => b.total - a.total,
  "monto-asc": (a, b) => a.total - b.total,
  "codigo-asc": (a, b) => a.id - b.id,
  "codigo-desc": (a, b) => b.id - a.id,
};

export function TransactionTableSection({ title = "Transacciones", transactions = [] }) {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("fecha-desc");
  const [pagina, setPagina] = useState(1);
  const [seleccionada, setSeleccionada] = useState(null);

  const termino = normalizar(busqueda.trim());
  const filtradas = transactions.filter((tx) =>
    !termino ||
    [tx.codigo, tx.cliente, tx.rutCliente, tx.vendedor, tx.rutVendedor, tx.estado]
      .some((campo) => normalizar(campo).includes(termino))
  );
  const ordenadas = [...filtradas].sort(ORDENES[orden]);

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = ordenadas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const iva = seleccionada ? seleccionada.total - seleccionada.neto : 0;

  return (
    <section className="transaction-section">
      <div className="table-header-controls">
        <h2>{title}</h2>

        <div className="controls-group">
          <input
            type="text"
            placeholder="Buscar N°, cliente, vendedor o estado"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            className="search-input"
            style={{ width: 280 }}
          />

          <select className="sort-dropdown" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="fecha-desc">Fecha: más reciente</option>
            <option value="fecha-asc">Fecha: menos reciente</option>
            <option value="monto-desc">Monto: mayor a menor</option>
            <option value="monto-asc">Monto: menor a mayor</option>
            <option value="codigo-asc">Transacción: menor a mayor</option>
            <option value="codigo-desc">Transacción: mayor a menor</option>
          </select>
        </div>
      </div>

      <div className="tx-scroll">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Transacción</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th className="num">Monto</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length > 0 ? (
              visibles.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-mono">{tx.codigo}</td>
                  <td>{formatoFecha(tx.fecha)}</td>
                  <td>{tx.cliente}</td>
                  <td>{tx.vendedor}</td>
                  <td className="num">{formatoPrecio(tx.total)}</td>
                  <td>
                    <span className={`status-badge ${CLASE_ESTADO[tx.tipoEstado]}`}>{tx.estado}</span>
                  </td>
                  <td>
                    <button type="button" className="row-action-btn" onClick={() => setSeleccionada(tx)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  {transactions.length === 0 ? "Todavía no hay ventas registradas." : "No se encontraron transacciones."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tx-pie">
        <span>
          {ordenadas.length} {ordenadas.length === 1 ? "transacción" : "transacciones"}
        </span>
        {totalPaginas > 1 && (
          <Pagination count={totalPaginas} page={paginaActual} onChange={(_, p) => setPagina(p)} size="small" />
        )}
      </div>

      <Dialog open={Boolean(seleccionada)} onClose={() => setSeleccionada(null)} fullWidth maxWidth="sm">
        {seleccionada && (
          <>
            <DialogTitle>Transacción {seleccionada.codigo}</DialogTitle>
            <DialogContent>
              <dl className="tx-detalle">
                <div>
                  <dt>Fecha</dt>
                  <dd>{formatoFecha(seleccionada.fecha)}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{seleccionada.estado}</dd>
                </div>
                <div>
                  <dt>Cliente</dt>
                  <dd>
                    {seleccionada.cliente} ({seleccionada.rutCliente})
                  </dd>
                </div>
                <div>
                  <dt>Vendedor</dt>
                  <dd>
                    {seleccionada.vendedor} ({seleccionada.rutVendedor})
                  </dd>
                </div>
                <div>
                  <dt>Despacho</dt>
                  <dd>{seleccionada.requiereDespacho ? "Con despacho" : "Sin despacho"}</dd>
                </div>
                {seleccionada.nota && (
                  <div>
                    <dt>Nota</dt>
                    <dd>{seleccionada.nota}</dd>
                  </div>
                )}
              </dl>

              <div className="tx-scroll">
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Detalle</th>
                      <th className="num">Cant.</th>
                      <th className="num">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seleccionada.items.length > 0 ? (
                      seleccionada.items.map((item, i) => (
                        <tr key={i}>
                          <td>
                            {item.nombre} <span style={{ color: "#6b7280" }}>({item.tipo})</span>
                          </td>
                          <td className="num">{item.cantidad}</td>
                          <td className="num">{formatoPrecio(item.subtotal)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-results">
                          Esta venta no tiene artículos asociados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="tx-totales">
                <div>
                  <span>Neto</span>
                  <span>{formatoPrecio(seleccionada.neto)}</span>
                </div>
                <div>
                  <span>IVA</span>
                  <span>{formatoPrecio(iva)}</span>
                </div>
                <div className="total">
                  <span>Total</span>
                  <span>{formatoPrecio(seleccionada.total)}</span>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <CustomButton variant="secondary" onClick={() => setSeleccionada(null)}>
                Cerrar
              </CustomButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </section>
  );
}
