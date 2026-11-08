const API_URL = import.meta.env.VITE_API_URL;

export const devolucionesService = {
  // Obtener las devoluciones
  getDevoluciones: async () => {
    const token = localStorage.getItem("authToken");

    const respuesta = await fetch(`${API_URL}/devoluciones`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al obtener las devoluciones."
      );
    }

    return resultado.data ?? [];
  },

  // Actualizar el estado de una devolución
  actualizarEstado: async (id, estado, montoreintegrado) => {
    const token = localStorage.getItem("authToken");

    const respuesta = await fetch(`${API_URL}/devoluciones/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estado,
        montoreintegrado,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al actualizar la devolución."
      );
    }

    return resultado.data ?? [];;
  },
};
