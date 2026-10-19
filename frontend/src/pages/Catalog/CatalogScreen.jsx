import { useState } from "react";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import CatalogToolbar from "../../components/molecules/CatalogToolbar/CatalogToolbar";
import CatalogGrid from "../../components/organisms/CatalogGrid/CatalogGrid";

const POR_PAGINA = 12;

//Temporal para probar producto y servicio.
const productos = [
  { id: 1, nombre: "Almacenamiento industrial", descripcion: "Estanterías modulares para depósitos y bodegas.", precio: 45000, ubicacion: "Buenos Aires", etiqueta: "Oferta", categoria: "Equipamiento" },
  { id: 2, nombre: "Sillas ejecutivas", descripcion: "Conjunto de 12 unidades con respaldo alto y ruedas.", precio: 18500, ubicacion: "Córdoba", etiqueta: "Nuevo", categoria: "Mobiliario" },
  { id: 3, nombre: "Kit de limpieza", descripcion: "Equipos y productos para mantenimiento diario de oficinas.", precio: 12900, ubicacion: "Mendoza", etiqueta: "Destacado", categoria: "Limpieza" },
  { id: 4, nombre: "Cafetera automática", descripcion: "Equipo para break room con capacidad para 50 usuarios.", precio: 89000, ubicacion: "Rosario", etiqueta: "Oferta", categoria: "Equipamiento" },
  { id: 5, nombre: "Puestos de trabajo", descripcion: "Escritorios modulares con divisores para oficinas abiertas.", precio: 56000, ubicacion: "Tucumán", etiqueta: "Nuevo", categoria: "Mobiliario" },
  { id: 6, nombre: "Climatización de oficinas", descripcion: "Instalación de equipos split para espacios corporativos.", precio: 72000, ubicacion: "Santa Fe", etiqueta: "Destacado", categoria: "Servicios" },
  { id: 7, nombre: "Cámaras de seguridad", descripcion: "Kit de 4 cámaras con grabación y visión nocturna.", precio: 34900, ubicacion: "Neuquén", etiqueta: "Oferta", categoria: "Seguridad" },
  { id: 8, nombre: "Impresora multifuncional", descripcion: "Impresión, copia y escaneo para equipos de trabajo.", precio: 27500, ubicacion: "Salta", etiqueta: "Nuevo", categoria: "Tecnología" },
];

const rangosPrecio = [
  { id: "bajo", label: "Menos de $20.000", min: 0, max: 20000 },
  { id: "medio", label: "$20.000 a $50.000", min: 20000, max: 50000 },
  { id: "alto", label: "$50.000 o más", min: 50000, max: Infinity },
];
const ordenes = [
  { value: "precioAsc", label: "Precio: menor a mayor" },
  { value: "precioDesc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre (A-Z)" },
];

const comparadores = {
  precioAsc: (a, b) => a.precio - b.precio,
  precioDesc: (a, b) => b.precio - a.precio,
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
};

const unicos = (campo) =>
  [...new Set(productos.map((p) => p[campo]))].sort().map((v) => ({ value: v, label: v }));

const opciones = {
  categoria: unicos("categoria"),
  precio: rangosPrecio.map((r) => ({ value: r.id, label: r.label })),
  ubicacion: unicos("ubicacion"),
  estado: unicos("etiqueta"),
  orden: ordenes,
};

const FILTROS_VACIOS = { categoria: "", precio: "", ubicacion: "", estado: "", orden: "" };

const CatalogScreen = () => {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);//Filtros
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);

  const cambiarFiltro = (campo, valor) => setFiltros({ ...filtros, [campo]: valor });

  const aplicarFiltros = () => {
    setAplicados(filtros);
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_VACIOS);
    setAplicados(FILTROS_VACIOS);
    setPagina(1);
  };

  const verDetalle = (producto) => {
    // Esto debe dar los detalles del producto despues
  };

  const rango = rangosPrecio.find((r) => r.id === aplicados.precio); //Filtro de precios

  const filtrados = productos.filter(
    (p) =>
      (aplicados.categoria === "" || p.categoria === aplicados.categoria) &&
      (aplicados.ubicacion === "" || p.ubicacion === aplicados.ubicacion) &&
      (aplicados.estado === "" || p.etiqueta === aplicados.estado) &&
      (!rango || (p.precio >= rango.min && p.precio < rango.max))
  );

  const ordenados = aplicados.orden
    ? [...filtrados].sort(comparadores[aplicados.orden])
    : filtrados;

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  return (
    <AdminTemplate>
      <Box component="h1" sx={{ margin: 0, fontSize: 28 }}>
        Catálogo de productos y servicios
      </Box>
      <Box sx={{ fontSize: 14, marginTop: 0.5, marginBottom: 3, color: "#666" }}>
        Explora ofertas, compará precios y encontrá lo mejor para tu negocio.
      </Box>

      <CatalogToolbar
        filtros={filtros}
        opciones={opciones}
        onCambio={cambiarFiltro}
        onAplicar={aplicarFiltros}
        onLimpiar={limpiarFiltros}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginY: 2 }}>
        <Box>Mostrando {desde}-{hasta} de {ordenados.length} resultados</Box>
        <Box>Vista: Cuadrícula</Box>
      </Box>

      <CatalogGrid items={visibles} onVerDetalle={verDetalle} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3, fontSize: 12, color: "#666" }}>
        <Box>Página {paginaActual} de {totalPaginas}</Box>
        <Pagination
          count={totalPaginas}
          page={paginaActual}
          onChange={(_, valor) => setPagina(valor)}
          size="small"
          shape="rounded"
          sx={{ "& .Mui-selected": { backgroundColor: "#EC3333 !important", color: "#fff" } }}
        />
      </Box>
    </AdminTemplate>
  );
};

export default CatalogScreen;