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

  // Detalle de una venta (para la boleta): artículos, neto, IVA, total y medio de pago.
  // Solo lo puede pedir el cliente o el vendedor de esa venta.
  getDetalle: async (idVenta) => {
    const token = localStorage.getItem("authToken");

    const respuesta = await fetch(`${API_URL}/ventas/${idVenta}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (respuesta.status === 403) {
      throw new Error("No tienes permiso para ver esta boleta.");
    }

    const resultado = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(resultado.message || "No se pudo obtener la boleta.");
    }

    return resultado.data;
  },
};
