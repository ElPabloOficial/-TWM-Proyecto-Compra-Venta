import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "../services/authService";
import * as api from "../services/productService";

const ProductContext = createContext(null);

// Categorías bajo la raíz indicada, en orden de árbol y con sangría por nivel
const descendientesDe = (categorias, nombreRaiz) => {
  const raiz = categorias.find(
    (c) => c.padreId === null && c.nombre.trim().toLowerCase() === nombreRaiz
  );
  if (!raiz) return [];

  const resultado = [];
  const recorrer = (padreId, nivel) => {
    categorias
      .filter((c) => c.padreId === padreId)
      .forEach((c) => {
        resultado.push({ ...c, nivel, etiqueta: "\u00A0\u00A0".repeat(nivel) + c.nombre });
        recorrer(c.id, nivel + 1);
      });
  };
  recorrer(raiz.id, 0);
  return resultado;
};

export const ProductosProvider = ({ children }) => {
  const [productosApi, setProductosApi] = useState([]);
  const [categorias, setCategorias] = useState([]);
  // Empieza en "cargando" si ya hay una sesión iniciada, para que las pantallas esperen los datos
  const [cargando, setCargando] = useState(() => Boolean(authService.getCurrentUser()));
  const [error, setError] = useState("");

  // Pide a la API los productos del vendedor y las categorías.
  // Con { silencioso: true } no muestra el aviso "cargando" (se usa después de guardar o eliminar).
  const recargar = useCallback(async ({ silencioso = false } = {}) => {
    if (!authService.getCurrentUser()) {
      setProductosApi([]);
      setCargando(false);
      return;
    }

    if (!silencioso) setCargando(true);
    setError("");
    try {
      const [productos, cats] = await Promise.all([
        api.listarMisProductos(),
        api.listarCategorias(),
      ]);
      setProductosApi(productos);
      setCategorias(cats);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const categoriasProducto = useMemo(() => descendientesDe(categorias, "productos"), [categorias]);
  const categoriasServicio = useMemo(() => descendientesDe(categorias, "servicios"), [categorias]);

  // El estado de la oferta (vigente, programada, vencida) se calcula con la fecha de hoy
  const productos = productosApi.map((p) => ({ ...p, estadoOferta: api.calcularEstadoOferta(p) }));

  // Las tres acciones devuelven una promesa: si la API rechaza algo, lanzan un Error con
  // el mensaje, y la pantalla que las llamó lo muestra.
  const agregarProducto = async (datos) => {
    await api.crearProducto(datos);
    await recargar({ silencioso: true });
  };

  const actualizarProducto = async (datos) => {
    const original = productosApi.find((p) => p.id === datos.id);
    try {
      await api.actualizarProducto(datos, original);
    } finally {
      // Aunque falle a medias, se vuelve a cargar para mostrar lo que sí quedó guardado
      await recargar({ silencioso: true });
    }
  };

  const eliminarProducto = async (id) => {
    await api.eliminarProducto(id);
    await recargar({ silencioso: true });
  };

  return (
    <ProductContext.Provider
      value={{
        productos,
        categorias,
        categoriasProducto,
        categoriasServicio,
        cargando,
        error,
        recargar,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductos = () => useContext(ProductContext);