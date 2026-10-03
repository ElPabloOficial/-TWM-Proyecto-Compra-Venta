import { useState } from "react";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ProductToolbar from "../../components/molecules/ProductToolbar/ProductToolbar";
import ProductTable from "../../components/organisms/ProductTable/ProductTable";
import ProductFormDialog from "../../components/organisms/ProductFormDialog/ProductFormDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";

const POR_PAGINA = 6;

// TEMPORAL: estas categorías vendrán de la base de datos
const categorias = [
  { id: 1, nombre: "Computación" },
  { id: 2, nombre: "Electrónica" },
  { id: 3, nombre: "Hogar" },
];

const comparadores = {
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  precioAsc: (a, b) => a.precio - b.precio,
  precioDesc: (a, b) => b.precio - a.precio,
  stockAsc: (a, b) => a.stock - b.stock,
  stockDesc: (a, b) => b.stock - a.stock,
};

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC)
const hoyLocal = () => new Date().toLocaleDateString("sv-SE");

// TEMPORAL: al conectar la base de datos esto puede venir
const calcularEstadoOferta = (p) => {
  if (!(p.oferta > 0) || !p.ofertaInicio || !p.ofertaFin) return "";
  const hoy = hoyLocal();
  if (hoy < p.ofertaInicio) return "programada";
  if (hoy > p.ofertaFin) return "vencida";
  return "vigente";
};

const InventoryScreen = () => {
  const [productos, setProductos] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [orden, setOrden] = useState("");
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  // CRUD 
  // TEMPORAL: crear, editar y eliminar solo modifican el estado local.
  const abrirCrear = () => {
    setProductoEditando(null);
    setDialogAbierto(true);
  };

  const abrirEditar = (producto) => {
    setProductoEditando(producto);
    setDialogAbierto(true);
  };

  const guardarProducto = (datos) => {
    const { estadoOferta, ...limpio } = datos;

    // TEMPORAL
    const skuRepetido = productos.some(
      (p) => p.sku === limpio.sku && p.id !== limpio.id
    );
    if (skuRepetido) {
      alert("Ya existe un producto con ese SKU.");
      return;
    }

    if (limpio.id) {
      setProductos(productos.map((p) => (p.id === limpio.id ? limpio : p)));
    } else {
      // TEMPORAL: el id lo genera la base de datos 
      setProductos([...productos, { ...limpio, id: Date.now() }]);
    }
    setDialogAbierto(false);
  };

  const eliminarProducto = (producto) => {
    if (window.confirm(`¿Eliminar "${producto.nombre}"?`)) {
      setProductos(productos.filter((p) => p.id !== producto.id));
    }
  };

  //Filtro, orden y paginación
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

  // TEMPORAL: filtro, orden y paginación se hacen aquí sobre todos los productos en memoria.
  const productosConEstado = productos.map((p) => ({
    ...p,
    estadoOferta: calcularEstadoOferta(p),
  }));

  const filtrados = productosConEstado.filter((p) => {
    if (filtro === "oferta") return p.estadoOferta === "vigente";
    if (filtro === "bajo") return p.stock > 0 && p.stock <= 3;
    if (filtro === "sin") return p.stock === 0;
    return true;
  });

  const ordenados = orden ? [...filtrados].sort(comparadores[orden]) : filtrados;

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);

  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  // TEMPORAL: se calculan en el frontend con los productos en memoria.
  const stockTotal = productosConEstado.reduce((acc, p) => acc + p.stock, 0);
  const valorTotal = productosConEstado.reduce((acc, p) => acc + p.stock * p.precio, 0);
  const enOferta = productosConEstado.filter((p) => p.estadoOferta === "vigente").length;

  return (
    <AdminTemplate>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
            Gestión de Inventario
          </Box>
          <Box sx={{ fontSize: 13, marginTop: 0.5 }}>
            Monitorea existencias, alertas de stock y pedidos en tiempo real.
          </Box>
        </Box>

        <CustomButton
          variant="primary"
          onClick={abrirCrear}
          sx={{ border: "2px solid #EC3333" }}
        >
          + Nuevo Producto
        </CustomButton>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", marginY: 3 }}>
        <StatCard titulo="Total de Productos" valor={productos.length} />
        <StatCard titulo="Stock Total" valor={stockTotal} />
        <StatCard
          titulo="Valor Total del Inventario"
          valor={`$ ${valorTotal.toLocaleString("es-CL")}`}
        />
        <StatCard titulo="Productos en oferta" valor={enOferta} />
      </Box>

      <Box sx={{ backgroundColor: "#fff", borderRadius: 1, padding: 2 }}>
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
          onEliminar={eliminarProducto}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 2,
            fontSize: 12,
          }}
        >
          <Box>
            Mostrando {desde}-{hasta} de {ordenados.length} productos
          </Box>
          <Pagination
            count={totalPaginas}
            page={paginaActual}
            onChange={(_, valor) => setPagina(valor)}
            size="small"
            shape="rounded"
            sx={{
              "& .Mui-selected": {
                backgroundColor: "#EC3333 !important",
                color: "#fff",
              },
            }}
          />
        </Box>
      </Box>

      <ProductFormDialog
        open={dialogAbierto}
        producto={productoEditando}
        categorias={categorias}
        onClose={() => setDialogAbierto(false)}
        onGuardar={guardarProducto}
      />
    </AdminTemplate>
  );
};

export default InventoryScreen;