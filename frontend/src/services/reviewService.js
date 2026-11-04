import { pedir } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL;

export const reviewService = {
  // Reseñas que escribió el usuario con sesión iniciada (productos y servicios)
  obtenerMisResenias: async () => (await pedir("/resenias/mias")) ?? [],

  // Crear reseña
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

  // Obtener reseñas de un producto
  obtenerReseniasProducto: async (idProducto) => {
    const respuesta = await fetch(
      `${API_URL}/resenias/producto/${idProducto}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al obtener las reseñas del producto."
      );
    }

    return resultado.data ?? [];
  },

  // Obtener reseñas de un servicio
  obtenerReseniasServicio: async (idServicio) => {
    const respuesta = await fetch(
      `${API_URL}/resenias/servicio/${idServicio}`
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || "Error al obtener las reseñas del servicio."
      );
    }

    return resultado.data ?? [];
  },
};
