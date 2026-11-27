import { pedir } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL;

// ---------- Devoluciones que pidieron los clientes de un vendedor (GET /devoluciones/vendedor) ----------

const dinero = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;

// 2026-11-20 -> 20-11-2026
const fechaCorta = (iso) => (iso ? String(iso).slice(0, 10).split("-").reverse().join("-") : "");

// La foto de evidencia se guarda como "/uploads/devoluciones/xxx.jpg" y la sirve la API
const urlEvidencia = (ruta) =>
  ruta ? `${API_URL.replace(/\/api\/?$/, "")}/${String(ruta).replace(/^\/+/, "")}` : null;

// Solo hay dos resoluciones; todo lo demás (incluidos los estados antiguos de los datos de prueba) sigue pendiente
const estadoDeVendedor = (estado) => (estado === "Aprobada" || estado === "Rechazada" ? estado : "En Proceso");

const aSolicitud = (d) => {
  const status = estadoDeVendedor(d.estado);
  const esCambio = String(d.tipo ?? "").toLowerCase().startsWith("cambio");
  const unidades = `${d.cantidad} ${d.cantidad === 1 ? "unidad" : "unidades"}`;

  let refund = "";
  if (status === "Aprobada") {
    refund = esCambio
      ? `Cambio de producto aprobado el ${fechaCorta(d.fechaResolucion)}`
      : `Reembolso procesado el ${fechaCorta(d.fechaResolucion)} · ${dinero(d.montoReintegrado)}`;
  } else if (status === "Rechazada") {
    refund = `Solicitud rechazada el ${fechaCorta(d.fechaResolucion)}`;
  }

  return {
    id: d.id,
    product: d.producto,
    order: `#${d.venta}`,
    customer: d.cliente,
    quantity: unidades,
    // Mientras está pendiente se muestra cuánto habría que reembolsar
    price: esCambio ? "Cambio de producto" : dinero(status === "Aprobada" ? d.montoReintegrado : d.montoSugerido),
    reason: d.motivo,
    status,
    refund,
    image: urlEvidencia(d.imagenEvidencia),
  };
};

// Solicitudes de los clientes del vendedor y la tasa de devolución (devoluciones / ventas, en %)
export async function listarSolicitudesDeMisVentas() {
  const datos = await pedir("/devoluciones/vendedor");
  const pendientesPrimero = (datos?.items ?? []).map(aSolicitud);
  // Las pendientes arriba; dentro de cada grupo se mantiene el orden de la API (más nuevas primero)
  const pendientes = pendientesPrimero.filter((s) => s.status === "En Proceso");
  const resueltas = pendientesPrimero.filter((s) => s.status !== "En Proceso");

  return {
    solicitudes: [...pendientes, ...resueltas],
    tasaDevolucion: Number(datos?.tasa_devolucion) || 0,
  };
}

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
