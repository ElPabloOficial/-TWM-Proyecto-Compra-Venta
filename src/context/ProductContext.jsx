import { createContext, useContext, useState } from "react";

// TEMPORAL: las categorías vendrán de la base de datos cuando se conecte el backend
const categoriasIniciales = [
  { id: 1, nombre: "Computación" },
  { id: 2, nombre: "Electrónica" },
  { id: 3, nombre: "Hogar" },
];

const productosIniciales = [];

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