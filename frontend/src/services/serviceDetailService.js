const API_URL = import.meta.env.VITE_API_URL;

export const servicioService = {
  obtenerServicios: async () => {
    const respuesta = await fetch(`${API_URL}/servicios`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "Error al obtener servicios.");
    }

    return resultado.data ?? [];
  },

  obtenerServicioPorId: async (id) => {
    const respuesta = await fetch(`${API_URL}/servicios/${id}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.message || "Error al obtener el servicio.");
    }

    return resultado.data;
  },
};
