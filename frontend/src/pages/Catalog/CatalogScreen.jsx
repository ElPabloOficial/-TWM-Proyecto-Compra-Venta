import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";
import CatalogToolbar from "../../components/molecules/CatalogToolbar/CatalogToolbar";
import CatalogGrid from "../../components/organisms/CatalogGrid/CatalogGrid";
import CardGridSkeleton from "../../components/molecules/CardGridSkeleton/CardGridSkeleton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { listarCatalogo, rutaDetalle } from "../../services/catalogService";
import useCart from "../../context/useCart";
import { useToast } from "../../context/ToastContext";
import { listarCategorias } from "../../services/productService";

const POR_PAGINA = 12;

// Atajos del selector de precio: llenan el mínimo y el máximo (que también se pueden escribir a mano)
const rangosPrecio = [
  { id: "bajo", label: "Menos de $20.000", min: "", max: "19999" },
  { id: "medio", label: "$20.000 a $50.000", min: "20000", max: "50000" },
  { id: "alto", label: "$50.000 o más", min: "50000", max: "" },
];
const ordenes = [
  { value: "precioAsc", label: "Precio: menor a mayor" },
  { value: "precioDesc", label: "Precio: mayor a menor" },
  { value: "descuento", label: "Mayor descuento" },
  { value: "nuevos", label: "Más nuevos" },
  { value: "nombre", label: "Nombre (A-Z)" },
  { value: "nombreDesc", label: "Nombre (Z-A)" },
];
const tipos = [
  { value: "producto", label: "Productos" },
  { value: "servicio", label: "Servicios" },
];

// Un servicio sin precio va al final al ordenar por precio.
// "Más nuevos" usa el id: el catálogo no trae fecha de publicación y los ids crecen con cada registro nuevo.
const comparadores = {
  precioAsc: (a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity),
  precioDesc: (a, b) => (b.precio ?? -Infinity) - (a.precio ?? -Infinity),
  descuento: (a, b) => b.descuentoPct - a.descuentoPct || a.nombre.localeCompare(b.nombre),
  nuevos: (a, b) => b.id - a.id,
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  nombreDesc: (a, b) => b.nombre.localeCompare(a.nombre),
};

// Minúsculas y sin tildes, para que "audifonos" encuentre "Audífonos"
const normalizar = (texto) =>
  String(texto ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const formatoPrecio = (n) => `$${n.toLocaleString("es-CL")}`;

const FILTROS_VACIOS = { categoria: "", estado: "", oferta: false, precioMin: "", precioMax: "", orden: "" };

// La vista elegida (cuadrícula o lista) se recuerda en este navegador
const CLAVE_VISTA = "catalogo-vista";
const leerVista = () => {
  try {
    return localStorage.getItem(CLAVE_VISTA) === "lista" ? "lista" : "cuadricula";
  } catch {
    return "cuadricula";
  }
};

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
  // "En oferta" es un interruptor aparte del tipo: llega como ?estado=oferta (Header) o ?oferta=1 (junto con un tipo)
  const estadoParam = params.get("estado") ?? "";
  const ofertaUrl = estadoParam === "oferta" || params.get("oferta") === "1";
  const estadoUrl = estadoParam === "oferta" ? "" : estadoParam;
  // /catalogo?q=texto viene de la barra de búsqueda del Header
  const busqueda = (params.get("q") ?? "").trim();

  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Sube al pedir "Reintentar" para volver a ejecutar la carga
  const [intento, setIntento] = useState(0);

  // Los filtros se aplican apenas se cambian
  const [filtros, setFiltros] = useState({ ...FILTROS_VACIOS, categoria: categoriaUrl, estado: estadoUrl, oferta: ofertaUrl });
  const [pagina, setPagina] = useState(1);
  const [vista, setVista] = useState(leerVista);
  const claveUrl = `${categoriaUrl}|${estadoParam}|${params.get("oferta") ?? ""}|${busqueda}`;
  const [urlVista, setUrlVista] = useState(claveUrl);

  // Si la URL cambia estando ya en el catálogo (se elige otra categoría u "Ofertas" en el Header), los filtros la siguen
  if (urlVista !== claveUrl) {
    setUrlVista(claveUrl);
    setFiltros((f) => ({ ...f, categoria: categoriaUrl, estado: estadoUrl, oferta: ofertaUrl }));
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

  // La categoría, el tipo y las ofertas elegidos quedan en la URL, así volver a elegirlos en el Header siempre funciona.
  // Solo "En oferta" (sin tipo) usa la forma ?estado=oferta, que es la que usa el Header.
  const paramsDe = (f) => ({
    ...(f.categoria ? { categoria: f.categoria } : {}),
    ...(f.estado ? { estado: f.estado } : f.oferta ? { estado: "oferta" } : {}),
    ...(f.estado && f.oferta ? { oferta: "1" } : {}),
    ...(busqueda ? { q: busqueda } : {}),
  });

  // Cada cambio se aplica al instante (puede cambiar varios campos a la vez, como el rango de precio)
  const cambiarFiltros = (cambios) => {
    const nuevos = { ...filtros, ...cambios };
    setFiltros(nuevos);
    setPagina(1);
    setParams(paramsDe(nuevos));
  };
  const cambiarFiltro = (campo, valor) => cambiarFiltros({ [campo]: valor });

  const limpiarFiltros = () => {
    setFiltros(FILTROS_VACIOS);
    setPagina(1);
    setParams({});
  };

  const elegirRango = (id) => {
    const rango = rangosPrecio.find((r) => r.id === id);
    cambiarFiltros({ precioMin: rango?.min ?? "", precioMax: rango?.max ?? "" });
  };

  const cambiarVista = (_, nueva) => {
    if (!nueva) return; // no se puede quedar sin vista
    setVista(nueva);
    try {
      localStorage.setItem(CLAVE_VISTA, nueva);
    } catch {
      /* sin almacenamiento disponible: la vista vale solo mientras la pantalla está abierta */
    }
  };

  // Al cambiar de página se vuelve al inicio: el paginador está abajo y los resultados nuevos empiezan arriba
  const irAPagina = (_, valor) => {
    setPagina(valor);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Quita el texto de búsqueda (la URL queda sin ?q)
  const quitarBusqueda = () => {
    setPagina(1);
    const { q, ...resto } = Object.fromEntries(params);
    setParams(resto);
  };

  // Opciones de los selectores
  const opciones = {
    precio: rangosPrecio.map((r) => ({ value: r.id, label: r.label })),
    estado: tipos,
    orden: ordenes,
  };

  // ---------- Filtros ----------
  const precioMin = filtros.precioMin === "" ? null : Number(filtros.precioMin);
  const precioMax = filtros.precioMax === "" ? null : Number(filtros.precioMax);
  const hayFiltroPrecio = precioMin !== null || precioMax !== null;
  const errorRango = precioMin !== null && precioMax !== null && precioMin > precioMax;
  const rangoPrecio =
    rangosPrecio.find((r) => r.min === filtros.precioMin && r.max === filtros.precioMax)?.id ??
    (hayFiltroPrecio ? "personalizado" : "");

  const categoriasPermitidas = filtros.categoria ? idsConSubcategorias(filtros.categoria, categorias) : null;

  // Cada palabra escrita debe aparecer en el nombre, la descripción, la categoría o el vendedor
  const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
  const coincideBusqueda = (i) => {
    if (palabras.length === 0) return true;
    const texto = normalizar([i.nombre, i.descripcion, i.vendedor, ...i.categorias.map((c) => c.nombre)].join(" "));
    return palabras.every((p) => texto.includes(p));
  };

  // Todos los filtros salvo el de precio (sirve también para contar lo que el precio deja fuera)
  const cumpleSinPrecio = (i) =>
    coincideBusqueda(i) &&
    (!categoriasPermitidas || i.categorias.some((c) => categoriasPermitidas.has(c.id))) &&
    (filtros.estado === "" || i.tipo === filtros.estado) &&
    (!filtros.oferta || i.descuentoPct > 0);

  const enRangoPrecio = (i) =>
    !hayFiltroPrecio ||
    (i.precio !== null && (precioMin === null || i.precio >= precioMin) && (precioMax === null || i.precio <= precioMax));

  const filtrados = items.filter((i) => cumpleSinPrecio(i) && enRangoPrecio(i));

  // Los que no tienen precio ("Consultar precio") no pueden entrar en un rango de precio: se avisa cuántos quedan fuera
  const sinPrecioOcultos = hayFiltroPrecio ? items.filter((i) => i.precio === null && cumpleSinPrecio(i)).length : 0;

  // Sin orden elegido: con una búsqueda se ordena por relevancia (nombre > categoría > descripción o vendedor);
  // sin búsqueda se deja el orden predeterminado del catálogo.
  const puntaje = (i) => {
    const nombre = normalizar(i.nombre);
    const categoriasTexto = normalizar(i.categorias.map((c) => c.nombre).join(" "));
    const resto = normalizar(`${i.descripcion} ${i.vendedor}`);
    return palabras.reduce(
      (total, p) => total + (nombre.includes(p) ? 3 : 0) + (categoriasTexto.includes(p) ? 2 : 0) + (resto.includes(p) ? 1 : 0),
      0
    );
  };

  let ordenados = filtrados;
  if (filtros.orden) {
    ordenados = [...filtrados].sort(comparadores[filtros.orden]);
  } else if (palabras.length > 0) {
    ordenados = filtrados
      .map((i) => ({ i, puntos: puntaje(i) }))
      .sort((a, b) => b.puntos - a.puntos)
      .map(({ i }) => i);
  }

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  // Filtros activos, cada uno con su "x" para quitarlo
  const etiquetaDe = (lista, valor) => lista.find((o) => o.value === valor)?.label ?? valor;
  const etiquetaPrecio =
    precioMin !== null && precioMax !== null
      ? `${formatoPrecio(precioMin)} – ${formatoPrecio(precioMax)}`
      : precioMin !== null
        ? `Desde ${formatoPrecio(precioMin)}`
        : precioMax !== null
          ? `Hasta ${formatoPrecio(precioMax)}`
          : "";
  const chips = [
    busqueda && { clave: "q", etiqueta: `Búsqueda: ${busqueda}`, quitar: quitarBusqueda },
    filtros.categoria && {
      clave: "categoria",
      etiqueta: `Categoría: ${rutaCategoria(filtros.categoria, categorias) || "seleccionada"}`,
      quitar: () => cambiarFiltro("categoria", ""),
    },
    filtros.estado && {
      clave: "estado",
      etiqueta: `Tipo: ${etiquetaDe(tipos, filtros.estado)}`,
      quitar: () => cambiarFiltro("estado", ""),
    },
    filtros.oferta && { clave: "oferta", etiqueta: "Solo en oferta", quitar: () => cambiarFiltro("oferta", false) },
    hayFiltroPrecio && {
      clave: "precio",
      etiqueta: `Precio: ${etiquetaPrecio}`,
      quitar: () => cambiarFiltros({ precioMin: "", precioMax: "" }),
    },
    filtros.orden && {
      clave: "orden",
      etiqueta: `Orden: ${etiquetaDe(ordenes, filtros.orden)}`,
      quitar: () => cambiarFiltro("orden", ""),
    },
  ].filter(Boolean);

  // Sin resultados: se explica y se ofrece limpiar los filtros
  const mensajeVacio =
    items.length === 0 ? (
      "Todavía no hay productos ni servicios publicados."
    ) : (
      <Box>
        <Box sx={{ marginBottom: 1.5 }}>No se encontraron resultados con esos filtros.</Box>
        {chips.length > 0 && (
          <Button
            variant="contained"
            size="small"
            disableElevation
            onClick={limpiarFiltros}
            sx={{ backgroundColor: "#EC3333", "&:hover": { backgroundColor: "#D42B2B" } }}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>
    );

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
            rangoPrecio={rangoPrecio}
            errorRango={errorRango}
            etiquetaOrdenBase={busqueda ? "Relevancia" : "Predeterminado"}
            onCambio={cambiarFiltro}
            onElegirRango={elegirRango}
            onLimpiar={limpiarFiltros}
            hayFiltros={chips.length > 0}
          />

          {errorRango && (
            <Box role="alert" sx={{ marginTop: 1, fontSize: 12, color: "#B42318" }}>
              El precio mínimo es mayor que el máximo.
            </Box>
          )}

          {chips.length > 0 && (
            <Box sx={{ marginTop: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", fontSize: 13, color: "#666" }}>
              Filtros activos:
              {chips.map((chip) => (
                <Chip
                  key={chip.clave}
                  label={chip.etiqueta}
                  onDelete={chip.quitar}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "#EC3333",
                    color: "#000",
                    fontWeight: 600,
                    "& .MuiChip-deleteIcon": { color: "#EC3333" },
                  }}
                />
              ))}
            </Box>
          )}

          {sinPrecioOcultos > 0 && (
            <Box role="status" sx={{ marginTop: 1.5, fontSize: 12, color: "#666" }}>
              {sinPrecioOcultos === 1
                ? "1 resultado sin precio (\"Consultar precio\") no se muestra porque filtraste por precio."
                : `${sinPrecioOcultos} resultados sin precio ("Consultar precio") no se muestran porque filtraste por precio.`}{" "}
              <Box
                component="button"
                type="button"
                onClick={() => cambiarFiltros({ precioMin: "", precioMax: "" })}
                sx={{ padding: 0, border: "none", background: "none", font: "inherit", fontWeight: 700, color: "#EC3333", cursor: "pointer", textDecoration: "underline" }}
              >
                Quitar filtro de precio
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#666", marginY: 2 }}>
            <Box>Mostrando {desde}-{hasta} de {ordenados.length} resultados</Box>
            <ToggleButtonGroup value={vista} exclusive onChange={cambiarVista} size="small" aria-label="Vista de los resultados">
              <ToggleButton value="cuadricula" aria-label="Vista en cuadrícula" sx={{ "&.Mui-selected": { color: "#EC3333" } }}>
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="lista" aria-label="Vista en lista" sx={{ "&.Mui-selected": { color: "#EC3333" } }}>
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <CatalogGrid
            items={visibles}
            vista={vista}
            onVerDetalle={verDetalle}
            onAgregar={agregarAlCarro}
            vacio={mensajeVacio}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3, fontSize: 12, color: "#666" }}>
            <Box>Página {paginaActual} de {totalPaginas}</Box>
            <Pagination
              count={totalPaginas}
              page={paginaActual}
              onChange={irAPagina}
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