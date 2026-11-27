import { API_URL, pedir } from './apiClient';
import { urlImagen } from './cartService';

// Estados de una devolución en la base: "En Proceso" (recién solicitada), "Aprobada" y "Rechazada".
// Los antiguos ("Pendiente", "En revisión") se tratan como "En revisión".
export const EN_REVISION = 'En revisión';
export const APROBADA = 'Aprobada';
export const RECHAZADA = 'Rechazada';

const normalizarEstado = (estado) => {
    if (estado === 'Aprobada') return APROBADA;
    if (estado === 'Rechazada') return RECHAZADA;
    return EN_REVISION;
};

// La foto de evidencia se guarda como "/uploads/devoluciones/xxx.jpg" y la sirve la API
const urlEvidencia = (ruta) =>
    ruta ? `${API_URL.replace(/\/api\/?$/, '')}/${String(ruta).replace(/^\/+/, '')}` : null;

const adaptar = (d) => ({
    id: d.id,
    idVenta: d.venta,
    idProducto: d.idProducto,
    producto: d.producto,
    imagenProducto: urlImagen(d.imagenProducto),
    cantidad: d.cantidad,
    vendedor: d.vendedor,
    motivo: d.motivo,
    estado: normalizarEstado(d.estado),
    tipo: d.tipo, // "Reembolso" | "Cambio"
    montoReintegrado: d.montoReintegrado ?? 0,
    fechaSolicitud: d.fechaSolicitud, // "2026-11-20"
    fechaResolucion: d.fechaResolucion ?? null,
    imagenEvidencia: urlEvidencia(d.imagenEvidencia),
});

// Las devoluciones que el usuario pidió como cliente, de la más nueva a la más antigua (GET /devoluciones/mias)
export async function listarMisDevolucionesSeguimiento() {
    const datos = await pedir('/devoluciones/mias');
    return (Array.isArray(datos) ? datos : []).map(adaptar);
}