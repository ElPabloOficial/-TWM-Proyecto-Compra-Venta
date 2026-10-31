
const API_URL = import.meta.env.VITE_API_URL;

export const reviewService = {
  crearResenia: async (tipo, id_item, calificacion, comentario) => {
    const token = localStorage.getItem("authToken");

    const respuesta = await fetch(`${API_URL}/resenias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo,
        id_item,
        calificacion,
        comentario,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al publicar la reseña."
      );
    }

    return resultado;
  },
};
