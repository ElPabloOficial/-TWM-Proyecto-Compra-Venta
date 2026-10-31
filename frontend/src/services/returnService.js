const API_URL = import.meta.env.VITE_API_URL;

export const returnService = {
  crearDevolucion: async (
    id_venta,
    id_producto,
    cantidad,
    motivo,
    tipodevolucion,
    imagen
  ) => {
    const token = localStorage.getItem("authToken");

    const formData = new FormData();

    formData.append("id_venta", id_venta);
    formData.append("id_producto", id_producto);
    formData.append("cantidad", cantidad);
    formData.append("motivo", motivo);
    formData.append("tipodevolucion", tipodevolucion);

    // Adjuntar imagen si existe
    if (imagen) {
      formData.append("imagen", imagen);
    }

    const respuesta = await fetch(`${API_URL}/devoluciones`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al solicitar la devolución."
      );
    }

    return resultado;
  },
};