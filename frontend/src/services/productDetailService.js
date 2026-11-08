const API_URL = import.meta.env.VITE_API_URL;

export const productoService = {
  obtenerProductos: async () => {
    const respuesta = await fetch(`${API_URL}/productos`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "Error al obtener productos.");
    }

    return resultado.data ?? [];
  },

  obtenerProductoPorId: async (id) => {
    const respuesta = await fetch(`${API_URL}/productos/${id}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "Error al obtener el producto.");
    }

    return resultado.data;
  },
};
