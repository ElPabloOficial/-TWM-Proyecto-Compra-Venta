import { createContext, useContext, useState } from "react";

// TEMPORAL: las categorías vendrán de la base de datos cuando se conecte el backend
const categoriasIniciales = [
  { id: 1, nombre: "Computación" },
  { id: 2, nombre: "Electrónica" },
  { id: 3, nombre: "Hogar" },
];

// TEMPORAL: productos de ejemplo hasta que se conecte el backend
const productosIniciales = [
  {
    id: 1,
    nombre: "Notebook Lenovo 14\"",
    sku: "NB-LEN-14",
    descripcion: "Notebook de 14 pulgadas, 8 GB de RAM y 256 GB de almacenamiento.",
    categoriaId: 1,
    precio: 389990,
    stock: 5,
    imagen: null,
    restriccionEdad: false,
    oferta: 10,
    ofertaInicio: "2026-10-01",
    ofertaFin: "2026-10-31",
    estadoOferta: "vigente",
  },
  {
    id: 2,
    nombre: "Audífonos inalámbricos",
    sku: "AUD-INA-01",
    descripcion: "Audífonos Bluetooth con cancelación de ruido.",
    categoriaId: 2,
    precio: 29990,
    stock: 0,
    imagen: null,
    restriccionEdad: false,
    oferta: 0,
    ofertaInicio: "",
    ofertaFin: "",
    estadoOferta: "",
  },
];

const ProductContext = createContext(null);

export const ProductosProvider = ({ children }) => {
  const [productos, setProductos] = useState(productosIniciales);
  const categorias = categoriasIniciales;

  const agregarProducto = (producto) => {
    setProductos((prev) => [...prev, { ...producto, id: Date.now() }]);
  };

  const actualizarProducto = (producto) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === producto.id ? producto : p))
    );
  };

  const eliminarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{
        productos,
        categorias,
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