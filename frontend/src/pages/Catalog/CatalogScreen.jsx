import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";
import CatalogToolbar from "../../components/molecules/CatalogToolbar/CatalogToolbar";
import CatalogGrid from "../../components/organisms/CatalogGrid/CatalogGrid";
import CardGridSkeleton from "../../components/molecules/CardGridSkeleton/CardGridSkeleton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { listarCatalogo, rutaDetalle } from "../../services/catalogoService";
import useCart from "../../context/useCart";
import { useToast } from "../../context/ToastContext";
import { listarCategorias } from "../../services/productService";

const POR_PAGINA = 12;

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
const tipos = [
  { value: "producto", label: "Productos" },
  { value: "servicio", label: "Servicios" },
  { value: "oferta", label: "En oferta" },
];

// Un servicio sin precio va al final al ordenar por precio
const comparadores = {
  precioAsc: (a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity),
  precioDesc: (a, b) => (b.precio ?? -Infinity) - (a.precio ?? -Infinity),
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
};

const FILTROS_VACIOS = { categoria: "", precio: "", estado: "", orden: "" };

// Camino de una categoría, por ejemplo "Tecnología › Computación". Se omite la raíz
// (Productos / Servicios) para que el texto sea corto.
const rutaCategoria = (id, categorias) => {
  const camino = [];
  let actual = categorias.find((c) => c.id === Number(id));
  while (actual) {
    camino.unshift(actual.nombre);
    actual = categorias.find((c) => c.id === actual.padreId);
  }
  return (camino.length > 1 ? camino.slice(1) : camino).join(" › ");
};

// Elegir una categoría incluye también sus subcategorías
const idsConSubcategorias = (id, categorias) => {
  const resultado = new Set([Number(id)]);
  let hayNuevas = true;
  while (hayNuevas) {
    hayNuevas = false;
    categorias.forEach((c) => {
      if (c.padreId !== null && resultado.has(c.padreId) && !resultado.has(c.id)) {
        resultado.add(c.id);
        hayNuevas = true;
      }
    });
  }
  return resultado;
};

const CatalogScreen = () => {
  const navigate = useNavigate();
  const { addItem, user } = useCart();
  const { mostrarToast } = useToast();
  const [params, setParams] = useSearchParams();
  // Desde el Header se llega aquí como /catalogo?categoria=ID (menú de categorías) o
  // /catalogo?estado=oferta|producto|servicio (Ofertas, Productos y Servicios; también "Ver ofertas" del Home)
  const categoriaUrl = params.get("categoria") ?? "";
  const estadoUrl = params.get("estado") ?? "";

  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Sube al pedir "Reintentar" para volver a ejecutar la carga
  const [intento, setIntento] = useState(0);

  const [filtros, setFiltros] = useState({ ...FILTROS_VACIOS, categoria: categoriaUrl, estado: estadoUrl }); //Filtros
  const [aplicados, setAplicados] = useState({ ...FILTROS_VACIOS, categoria: categoriaUrl, estado: estadoUrl });
  const [pagina, setPagina] = useState(1);
  const [urlVista, setUrlVista] = useState(`${categoriaUrl}|${estadoUrl}`);

  // Si la URL cambia estando ya en el catálogo (se elige otra categoría u "Ofertas" en el Header), los filtros la siguen
  if (urlVista !== `${categoriaUrl}|${estadoUrl}`) {
    setUrlVista(`${categoriaUrl}|${estadoUrl}`);
    setFiltros((f) => ({ ...f, categoria: categoriaUrl, estado: estadoUrl }));
    setAplicados((a) => ({ ...a, categoria: categoriaUrl, estado: estadoUrl }));
    setPagina(1);
  }

  useEffect(() => {
    let activo = true; // evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta

    const cargar = async () => {
      try {
        const [lista, listaCategorias] = await Promise.all([
          listarCatalogo(),
          // Sin categorías el catálogo igual se ve; solo queda vacío el selector de categoría
          listarCategorias().catch(() => []),
        ]);
        if (!activo) return;
        setItems(lista);
        setCategorias(listaCategorias);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = () => {
    setCargando(true);
    setError("");
    setIntento((n) => n + 1);
  };

  // La categoría y el tipo elegidos quedan en la URL, así volver a elegirlos en el Header siempre funciona
  const paramsDe = (f) => ({
    ...(f.categoria ? { categoria: f.categoria } : {}),
    ...(f.estado ? { estado: f.estado } : {}),
  });

  const cambiarFiltro = (campo, valor) => setFiltros({ ...filtros, [campo]: valor });

  const aplicarFiltros = () => {
    setAplicados(filtros);
    setPagina(1);
    setParams(paramsDe(filtros));
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_VACIOS);
    setAplicados(FILTROS_VACIOS);
    setPagina(1);
    setParams({});
  };

  const verDetalle = (item) => navigate(rutaDetalle(item));

  const agregarAlCarro = async (item) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      // El carrito guarda tipo + id (un producto y un servicio pueden tener el mismo id)
      await addItem({ tipo: item.tipo, id: item.id }, 1);
      mostrarToast(`${item.nombre} se agregó al carrito`);
    } catch (e) {
      mostrarToast(e.message, "error");
    }
  };

  // Quita la categoría elegida en el menú del Header (la URL queda sin ?categoria)
  const quitarCategoria = () => {
    setFiltros((f) => ({ ...f, categoria: "" }));
    setAplicados((a) => ({ ...a, categoria: "" }));
    setPagina(1);
    setParams(paramsDe({ ...aplicados, categoria: "" }));
  };

  // Opciones de los selectores (salen de lo que hay en el catálogo)
  const opciones = {
    precio: rangosPrecio.map((r) => ({ value: r.id, label: r.label })),
    estado: tipos,
    orden: ordenes,
  };

  // ---------- Filtros ----------
  const rango = rangosPrecio.find((r) => r.id === aplicados.precio); //Filtro de precios
  const categoriasPermitidas = aplicados.categoria ? idsConSubcategorias(aplicados.categoria, categorias) : null;

  const filtrados = items.filter(
    (i) =>
      (!categoriasPermitidas || i.categorias.some((c) => categoriasPermitidas.has(c.id))) &&
      (aplicados.estado === "" ||
        (aplicados.estado === "oferta" ? i.descuentoPct > 0 : i.tipo === aplicados.estado)) &&
      (!rango || (i.precio !== null && i.precio >= rango.min && i.precio < rango.max))
  );

  const ordenados = aplicados.orden ? [...filtrados].sort(comparadores[aplicados.orden]) : filtrados;

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  return (
    <>
      <Header />

      <Box
        component="main"
        sx={{ maxWidth: 1200, width: "calc(100% - 48px)", margin: "0 auto", padding: "32px 0 64px" }}
      >
      <Box component="h1" sx={{ margin: 0, fontSize: 28 }}>
        Catálogo de productos y servicios
      </Box>
      <Box sx={{ fontSize: 14, marginTop: 0.5, marginBottom: 3, color: "#666" }}>
        Explora ofertas, compará precios y encontrá lo mejor para tu negocio.
      </Box>

      {cargando ? (
        <CardGridSkeleton cantidad={8} />
      ) : error ? (
        <ErrorState titulo="No pudimos cargar el catálogo" detalle={error} onReintentar={reintentar} />
      ) : (
        <>
          <CatalogToolbar
            filtros={filtros}
            opciones={opciones}
            onCambio={cambiarFiltro}
            onAplicar={aplicarFiltros}
            onLimpiar={limpiarFiltros}
          />

          {aplicados.categoria && (
            <Box sx={{ marginTop: 2, display: "flex", alignItems: "center", gap: 1, fontSize: 13, color: "#666" }}>
              Categoría:
              <Chip
                label={rutaCategoria(aplicados.categoria, categorias) || "Categoría seleccionada"}
                onDelete={quitarCategoria}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#EC3333",
                  color: "#000",
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": { color: "#EC3333" },
                }}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginY: 2 }}>
            <Box>Mostrando {desde}-{hasta} de {ordenados.length} resultados</Box>
            <Box>Vista: Cuadrícula</Box>
          </Box>

          <CatalogGrid
            items={visibles}
            onVerDetalle={verDetalle}
            onAgregar={agregarAlCarro}
            vacio={items.length === 0 ? "Todavía no hay productos ni servicios publicados." : undefined}
          />

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
        </>
      )}
      </Box>

      <Footer />
    </>
  );
};

export default CatalogScreen;
