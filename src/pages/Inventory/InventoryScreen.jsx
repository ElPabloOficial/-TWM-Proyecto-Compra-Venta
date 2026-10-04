import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ProductToolbar from "../../components/molecules/ProductToolbar/ProductToolbar";
import ProductTable from "../../components/organisms/ProductTable/ProductTable";
import ProductFormDialog from "../../components/organisms/ProductFormDialog/ProductFormDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { useProductos } from "../../context/ProductContext";
import "../../styles/Inventory.css";

const POR_PAGINA = 6;

const comparadores = {
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  precioAsc: (a, b) => a.precio - b.precio,
  precioDesc: (a, b) => b.precio - a.precio,
  stockAsc: (a, b) => a.stock - b.stock,
  stockDesc: (a, b) => b.stock - a.stock,
};

const InventoryScreen = () => {
  const navigate = useNavigate();
  const { productos, categorias, actualizarProducto, eliminarProducto } = useProductos();

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [orden, setOrden] = useState("");
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  // CRUD 
  const abrirEditar = (producto) => {
    setProductoEditando(producto);
    setDialogAbierto(true);
  };

  const guardarEdicion = (datos) => {
    actualizarProducto(datos);
    setDialogAbierto(false);
  };

  const confirmarEliminar = (producto) => {
    if (window.confirm(`¿Eliminar "${producto.nombre}"?`)) {
      eliminarProducto(producto.id);
    }
  };

  //  Filtro, orden y paginación 
  const cambiarOrden = (valor) => {
    setOrden(valor);
    setPagina(1);
  };

  const cambiarFiltro = (valor) => {
    setFiltro(valor);
    setPagina(1);
  };

  const verTodos = () => {
    setOrden("");
    setFiltro("");
    setPagina(1);
  };

  const filtrados = productos.filter((p) => {
    if (filtro === "oferta") return p.estadoOferta === "vigente";
    if (filtro === "bajo") return p.stock <= 3;
    if (filtro === "sin") return p.stock === 0;
    return true;
  });

  const ordenados = orden ? [...filtrados].sort(comparadores[orden]) : filtrados;

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  //  Tarjetas de totales 
  const stockTotal = productos.reduce((acc, p) => acc + p.stock, 0);
  const valorTotal = productos.reduce((acc, p) => acc + p.stock * p.precio, 0);
  const enOferta = productos.filter((p) => p.estadoOferta === "vigente").length;

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Gestión de Inventario</h1>
          <div className="inv-subtitle">
            Monitorea existencias, alertas de stock y pedidos en tiempo real.
          </div>
        </div>

        <CustomButton
          variant="primary"
          onClick={() => navigate("/inventario/nuevo")}
          sx={{ border: "2px solid #EC3333" }}
        >
          + Nuevo Producto
        </CustomButton>
      </div>

      <div className="inv-stats">
        <StatCard titulo="Total de Productos" valor={productos.length} />
        <StatCard titulo="Stock Total" valor={stockTotal} />
        <StatCard
          titulo="Valor Total del Inventario"
          valor={`$ ${valorTotal.toLocaleString("es-CL")}`}
        />
        <StatCard titulo="Productos en oferta" valor={enOferta} />
      </div>

      <div className="inv-panel">
        <ProductToolbar
          total={ordenados.length}
          orden={orden}
          onOrden={cambiarOrden}
          filtro={filtro}
          onFiltro={cambiarFiltro}
          onVerTodos={verTodos}
        />

        <ProductTable
          productos={visibles}
          categorias={categorias}
          onEditar={abrirEditar}
          onEliminar={confirmarEliminar}
        />

        <div className="inv-footer">
          <div>
            Mostrando {desde}-{hasta} de {ordenados.length} productos
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

      <ProductFormDialog
        open={dialogAbierto}
        producto={productoEditando}
        categorias={categorias}
        onClose={() => setDialogAbierto(false)}
        onGuardar={guardarEdicion}
      />
    </SellerTemplate>
  );
};

export default InventoryScreen;