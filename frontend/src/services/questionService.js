const API_URL = import.meta.env.VITE_API_URL;

export const questionService = {
  // Obtener preguntas de un producto
  obtenerPreguntasProducto: async (idProducto) => {
    const respuesta = await fetch(
      `${API_URL}/preguntas/producto/${idProducto}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al obtener las preguntas."
      );
    }

    return resultado.data ?? [];
  },

  // Obtener preguntas de un servicio
  obtenerPreguntasServicio: async (idServicio) => {
    const respuesta = await fetch(
      `${API_URL}/preguntas/servicio/${idServicio}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al obtener las preguntas."
      );
    }

    return resultado.data ?? [];
  },

  // Publicar una pregunta
  crearPregunta: async (tipo, id_item, pregunta) => {
    const token = localStorage.getItem("authToken");

    const respuesta = await fetch(`${API_URL}/preguntas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo,
        id_item,
        pregunta,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al publicar la pregunta."
      );
    }

    return resultado;
  },
};