import { useState, useEffect, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { listarMisPedidos, actualizarEstadoPedido } from "../../services/pedidoService";
import "../../styles/Inventory.css";
import "../../styles/Orders.css";

const POR_PAGINA = 6;

const estados = {
  pendiente: { texto: "Pendiente" },
  preparacion: { texto: "En preparación" },
  enviado: { texto: "Enviado" },
  entregado: { texto: "Entregado" },
  cancelado: { texto: "Cancelado" },
};

// Estados entre los que el vendedor puede mover un pedido (cancelar tiene su propio botón)
const estadosEditables = ["pendiente", "preparacion", "enviado", "entregado"];

const comparadores = {
  recientes: (a, b) => b.fecha.localeCompare(a.fecha),
  antiguos: (a, b) => a.fecha.localeCompare(b.fecha),
  totalDesc: (a, b) => totalPedido(b) - totalPedido(a),
  totalAsc: (a, b) => totalPedido(a) - totalPedido(b),
};

// El total (neto + IVA) lo calcula la API a partir de la venta
const totalPedido = (pedido) => pedido.total;

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

// 2026-10-31 -> 31/10/2026
const formatoFecha = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

// Pastilla de color con el estado del pedido (colores en Orders.css)
const EstadoPedido = ({ estado }) => (
  <span className={`ord-estado ord-estado-${estado}`}>{estados[estado]?.texto ?? estado}</span>
);

// ---------- Diálogo: detalle del pedido y cambio de estado ----------
const OrderDialog = ({ open, pedido, onClose, onGuardar }) => {
  const [estado, setEstado] = useState("pendiente");
  const [seguimiento, setSeguimiento] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Cada vez que se abre: carga el estado y el seguimiento actuales del pedido
  useEffect(() => {
    setEstado(pedido?.estado ?? "pendiente");
    setSeguimiento(pedido?.seguimiento ?? "");
    setError("");
    setGuardando(false);
  }, [pedido, open]);

  const muestraSeguimiento = estado === "enviado" || estado === "entregado";

  // Un pedido sin despacho (servicios, retiro) no pasa por "en preparación" ni "enviado"
  const opciones = pedido?.requiereDespacho === false ? ["pendiente", "entregado"] : estadosEditables;

  const handleGuardar = async () => {
    if (guardando) return;

    if (estado === "enviado" && !seguimiento.trim()) {
      setError("Indica el código de seguimiento para marcar el pedido como enviado.");
      return;
    }

    const datos = {
      id: pedido.id,
      estado,
      seguimiento: muestraSeguimiento ? seguimiento.trim() : "",
    };

    setGuardando(true);
    try {
      await onGuardar(datos);
    } catch (e) {
      // Si la API rechaza el cambio, el mensaje se muestra dentro del diálogo
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Pedido {pedido?.numero}</DialogTitle>
      <DialogContent className="ord-dialog-content">
        {pedido && (
          <div className="ord-resumen">
            <div className="ord-cliente">{pedido.cliente}</div>
            <div className="ord-direccion">
              {pedido.direccion} · {formatoFecha(pedido.fecha)}
            </div>

            {pedido.items.map((i, n) => (
              <div key={`${i.nombre}-${n}`} className="ord-item">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatoPrecio(i.subtotal)}</span>
              </div>
            ))}

            <div className="ord-item">
              <span>IVA</span>
              <span>{formatoPrecio(pedido.total - pedido.neto)}</span>
            </div>

            <div className="ord-total">
              <span>Total</span>
              <span>{formatoPrecio(totalPedido(pedido))}</span>
            </div>
          </div>
        )}

        <TextField
          select
          label="Estado del pedido"
          size="small"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          {opciones.map((e) => (
            <MenuItem key={e} value={e}>
              {estados[e].texto}
            </MenuItem>
          ))}
        </TextField>

        {muestraSeguimiento && (
          <TextField
            label="Código de seguimiento"
            size="small"
            value={seguimiento}
            onChange={(e) => setSeguimiento(e.target.value)}
          />
        )}

        {error && <span className="ord-error">{error}</span>}
      </DialogContent>
      <DialogActions className="ord-dialog-actions">
        <CustomButton variant="secondary" size="small" onClick={onClose}>
          Cancelar
        </CustomButton>
        <CustomButton
          variant="primary"
          size="small"
          disabled={guardando}
          onClick={handleGuardar}
          sx={{ border: "2px solid #EC3333" }}
        >
          Guardar
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

// ---------- Pantalla ----------
const OrdersScreen = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  const [orden, setOrden] = useState("recientes");
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  // ---------- Datos (API) ----------
  // Con { silencioso: true } no muestra "cargando" (se usa después de guardar un cambio)
  const recargar = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setCargando(true);
    setError("");
    try {
      setPedidos(await listarMisPedidos());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // ---------- Acciones ----------
  // Si la API rechaza el cambio lanza un Error: el diálogo lo muestra y queda abierto.
  const guardarCambios = async ({ id, estado, seguimiento }) => {
    await actualizarEstadoPedido({ id, estado, seguimiento });
    setPedidoEditando(null);
    await recargar({ silencioso: true });
  };

  const confirmarCancelar = async () => {
    try {
      await actualizarEstadoPedido({ id: pedidoACancelar.id, estado: "cancelado" });
      await recargar({ silencioso: true });
    } catch (e) {
      alert(e.message);
    }
    setPedidoACancelar(null);
  };

  // ---------- Filtro, orden y paginación ----------
  // Se hacen aquí sobre todos los pedidos del vendedor que entrega la API.
  const cambiarOrden = (valor) => {
    setOrden(valor);
    setPagina(1);
  };

  const cambiarFiltro = (valor) => {
    setFiltro(valor);
    setPagina(1);
  };

  const verTodos = () => {
    setOrden("recientes");
    setFiltro("");
    setPagina(1);
  };

  const filtrados = pedidos.filter((p) => !filtro || p.estado === filtro);
  const ordenados = [...filtrados].sort(comparadores[orden]);

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  // ---------- Tarjetas de totales (sobre todos los pedidos) ----------
  // Se calculan aquí con los pedidos cargados; "Ventas totales" no cuenta los cancelados.
  const pendientes = pedidos.filter(
    (p) => p.estado === "pendiente" || p.estado === "preparacion"
  ).length;
  const enCamino = pedidos.filter((p) => p.estado === "enviado").length;
  const ventasTotales = pedidos
    .filter((p) => p.estado !== "cancelado")
    .reduce((acc, p) => acc + totalPedido(p), 0);

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Gestión de Pedidos</h1>
          <div className="inv-subtitle">
            Revisa las compras de tus clientes y actualiza el estado de cada envío.
          </div>
        </div>
      </div>

      {error && <div style={{ color: "#EF4444", fontSize: 13, marginTop: 12 }}>{error}</div>}
      {cargando && <div style={{ fontSize: 13, marginTop: 12 }}>Cargando pedidos...</div>}

      <div className="inv-stats">
        <StatCard titulo="Total de Pedidos" valor={pedidos.length} />
        <StatCard titulo="Por despachar" valor={pendientes} />
        <StatCard titulo="En camino" valor={enCamino} />
        <StatCard titulo="Ventas totales" valor={`$ ${ventasTotales.toLocaleString("es-CL")}`} />
      </div>

      <div className="inv-panel">
        <div className="inv-toolbar">
          <div>
            <strong>Pedidos</strong>
            <span className="inv-toolbar-count">{ordenados.length} pedidos</span>
          </div>

          <div className="inv-toolbar-actions">
            <button type="button" className="inv-link-red" onClick={verTodos}>
              Ver Todos
            </button>

            <select
              className="inv-select"
              value={orden}
              onChange={(e) => cambiarOrden(e.target.value)}
              aria-label="Ordenar pedidos"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="totalDesc">Mayor total</option>
              <option value="totalAsc">Menor total</option>
            </select>

            <select
              className="inv-select"
              value={filtro}
              onChange={(e) => cambiarFiltro(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              {Object.entries(estados).map(([id, { texto }]) => (
                <option key={id} value={id}>
                  {texto}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>N° Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={7} className="inv-empty">
                    No hay pedidos para mostrar.
                  </td>
                </tr>
              )}

              {visibles.map((p) => {
                const puedeActualizar = ["pendiente", "preparacion", "enviado"].includes(p.estado);
                const puedeCancelar = ["pendiente", "preparacion"].includes(p.estado);
                const unidades = p.items.reduce((acc, i) => acc + i.cantidad, 0);

                return (
                  <tr key={p.id}>
                    <td>{p.numero}</td>
                    <td>{p.cliente}</td>
                    <td>{formatoFecha(p.fecha)}</td>
                    <td>
                      {unidades} {unidades === 1 ? "producto" : "productos"}
                    </td>
                    <td>{formatoPrecio(totalPedido(p))}</td>
                    <td>
                      <EstadoPedido estado={p.estado} />
                    </td>
                    <td>
                      {puedeActualizar && (
                        <button
                          type="button"
                          className="inv-icon-btn"
                          onClick={() => setPedidoEditando(p)}
                          aria-label="Ver y actualizar pedido"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                      )}
                      {puedeCancelar && (
                        <button
                          type="button"
                          className="inv-icon-btn"
                          onClick={() => setPedidoACancelar(p)}
                          aria-label="Cancelar pedido"
                        >
                          <CancelIcon fontSize="small" />
                        </button>
                      )}
                      {!puedeActualizar && !puedeCancelar && "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="inv-footer">
          <div>
            Mostrando {desde}-{hasta} de {ordenados.length} pedidos
          </div>

          <div className="inv-pagination">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPagina(paginaActual - 1)}
            >
              ‹
            </button>
            {paginas.map((n) => (
              <button
                key={n}
                type="button"
                className={n === paginaActual ? "activa" : ""}
                onClick={() => setPagina(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPagina(paginaActual + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <OrderDialog
        open={Boolean(pedidoEditando)}
        pedido={pedidoEditando}
        onClose={() => setPedidoEditando(null)}
        onGuardar={guardarCambios}
      />

      <ConfirmDialog
        open={Boolean(pedidoACancelar)}
        titulo="Cancelar pedido"
        mensaje={`¿Seguro que quieres cancelar el pedido ${pedidoACancelar?.numero ?? ""} de ${pedidoACancelar?.cliente ?? ""}? Esta acción no se puede deshacer.`}
        textoConfirmar="Cancelar pedido"
        textoCancelar="Volver"
        onConfirmar={confirmarCancelar}
        onCancelar={() => setPedidoACancelar(null)}
      />
    </SellerTemplate>
  );
};

export default OrdersScreen;