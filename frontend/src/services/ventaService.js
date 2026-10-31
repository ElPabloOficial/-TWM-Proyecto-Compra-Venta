const API_URL = import.meta.env.VITE_API_URL;

export const ventaService = {
  // Obtener el historial de compras del usuario autenticado
  getMisCompras: async () => {
    const token = localStorage.getItem("authToken");

    const respuesta = await fetch(`${API_URL}/ventas/mis-compras`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al obtener el historial de compras."
      );
    }

    return resultado.data;
  },
};
