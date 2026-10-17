import { useState, useEffect } from "react";
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
import "../../styles/Inventory.css";
import "../../styles/Orders.css";

const POR_PAGINA = 6;

// TEMPORAL: estos pedidos son de ejemplo. Los clientes los generan al comprar en la tienda;
// cuando se conecte el backend se cargan desde la API (solo los de los productos del vendedor).
const pedidosIniciales = [
  {
    id: 8,
    numero: "PED-1008",
    cliente: "Camila Rojas",
    direccion: "Mackenna 850, Osorno",
    fecha: "2026-10-12",
    estado: "pendiente",
    seguimiento: "",
    items: [{ nombre: "Notebook Lenovo", cantidad: 1, precio: 549990 }],
  },
  {
    id: 7,
    numero: "PED-1007",
    cliente: "Matías Pérez",
    direccion: "Av. Buschmann 1450, Osorno",
    fecha: "2026-10-11",
    estado: "preparacion",
    seguimiento: "",
    items: [
      { nombre: "Audífonos Bluetooth", cantidad: 2, precio: 24990 },
      { nombre: "Hervidor eléctrico", cantidad: 1, precio: 19990 },
    ],
  },
  {
    id: 6,
    numero: "PED-1006",
    cliente: "Francisca Soto",
    direccion: "Bilbao 320, Puerto Montt",
    fecha: "2026-10-10",
    estado: "enviado",
    seguimiento: "CH-4821763",
    items: [{ nombre: "Hervidor eléctrico", cantidad: 1, precio: 19990 }],
  },
  {
    id: 5,
    numero: "PED-1005",
    cliente: "Diego Álvarez",
    direccion: "Los Leones 1200, Providencia",
    fecha: "2026-10-08",
    estado: "entregado",
    seguimiento: "CH-4790021",
    items: [{ nombre: "Notebook Lenovo", cantidad: 1, precio: 549990 }],
  },
  {
    id: 4,
    numero: "PED-1004",
    cliente: "Valentina Muñoz",
    direccion: "Ramírez 215, Osorno",
    fecha: "2026-10-07",
    estado: "entregado",
    seguimiento: "CH-4768834",
    items: [{ nombre: "Audífonos Bluetooth", cantidad: 1, precio: 24990 }],
  },
  {
    id: 3,
    numero: "PED-1003",
    cliente: "Joaquín Vera",
    direccion: "Av. Providencia 2300, Santiago",
    fecha: "2026-10-05",
    estado: "cancelado",
    seguimiento: "",
    items: [{ nombre: "Hervidor eléctrico", cantidad: 2, precio: 19990 }],
  },
  {
    id: 2,
    numero: "PED-1002",
    cliente: "Sofía Contreras",
    direccion: "Errázuriz 640, Valdivia",
    fecha: "2026-10-03",
    estado: "enviado",
    seguimiento: "CH-3390412",
    items: [
      { nombre: "Audífonos Bluetooth", cantidad: 1, precio: 24990 },
      { nombre: "Hervidor eléctrico", cantidad: 1, precio: 19990 },
    ],
  },
  {
    id: 1,
    numero: "PED-1001",
    cliente: "Tomás Herrera",
    direccion: "Arturo Prat 77, Osorno",
    fecha: "2026-10-02",
    estado: "entregado",
    seguimiento: "CH-3301177",
    items: [{ nombre: "Notebook Lenovo", cantidad: 1, precio: 549990 }],
  },
];

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

// TEMPORAL: el total se calcula en el frontend. Con la base de datos
// será SUM(cantidad * precio) sobre el detalle del pedido.
function totalPedido(pedido) {
  return pedido.items.reduce((acc, i) => acc + i.cantidad * i.precio, 0);
}

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

// 2026-10-31 -> 31/10/2026
const formatoFecha = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

// Pastilla de color con el estado del pedido (colores en Orders.css)
const EstadoPedido = ({ estado }) => (
  <span className={`ord-estado ord-estado-${estado}`}>{estados[estado].texto}</span>
);

// ---------- Diálogo: detalle del pedido y cambio de estado ----------
const OrderDialog = ({ open, pedido, onClose, onGuardar }) => {
  const [estado, setEstado] = useState("pendiente");
  const [seguimiento, setSeguimiento] = useState("");
  const [error, setError] = useState("");

  // Cada vez que se abre: carga el estado y el seguimiento actuales del pedido
  useEffect(() => {
    setEstado(pedido?.estado ?? "pendiente");
    setSeguimiento(pedido?.seguimiento ?? "");
    setError("");
  }, [pedido, open]);

  const muestraSeguimiento = estado === "enviado" || estado === "entregado";

  const handleGuardar = () => {
    if (estado === "enviado" && !seguimiento.trim()) {
      setError("Indica el código de seguimiento para marcar el pedido como enviado.");
      return;
    }

    const datos = {
      id: pedido.id,
      estado,
      seguimiento: muestraSeguimiento ? seguimiento.trim() : "",
    };

    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados.
    // Con el backend esto se reemplaza por la llamada a la API (PUT del pedido).
    console.log("[Pedidos] Actualizar pedido:", datos);

    onGuardar(datos);
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

            {pedido.items.map((i) => (
              <div key={i.nombre} className="ord-item">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatoPrecio(i.cantidad * i.precio)}</span>
              </div>
            ))}

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
          {estadosEditables.map((e) => (
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
  // TEMPORAL: los pedidos viven solo en memoria (se pierden al recargar la página).
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  const [orden, setOrden] = useState("recientes");
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  // ---------- Acciones ----------
  // TEMPORAL: actualizar y cancelar solo modifican el estado local.
  // Con el backend pasan a ser llamadas a la API (PUT del pedido).
  const guardarCambios = ({ id, estado, seguimiento }) => {
    setPedidos(pedidos.map((p) => (p.id === id ? { ...p, estado, seguimiento } : p)));
    setPedidoEditando(null);
  };

  const confirmarCancelar = () => {
    // SIMULACIÓN (solo frontend): con el backend pasa a ser una llamada a la API
    console.log("[Pedidos] Cancelar pedido:", pedidoACancelar);
    setPedidos(
      pedidos.map((p) => (p.id === pedidoACancelar.id ? { ...p, estado: "cancelado" } : p))
    );
    setPedidoACancelar(null);
  };

  // ---------- Filtro, orden y paginación ----------
  // TEMPORAL: se hacen aquí sobre todos los pedidos en memoria.
  // Con el backend pasan a ser WHERE, ORDER BY y LIMIT/OFFSET en la consulta.
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
  // TEMPORAL: se calculan en el frontend. Con la base de datos pasan a ser
  // consultas agregadas: COUNT(*), COUNT por estado y SUM del total (sin cancelados).
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