import { pedir } from './apiClient';

// Notificaciones del usuario (GET /notificaciones). La API las arma con lo que ya existe en la base de datos
// (preguntas, mensajes, pedidos, devoluciones, cotizaciones, ofertas), ordenadas de la más nueva a la más antigua.
// Cada una: { id, tipo: "mensaje" | "oferta" | "sistema", titulo, descripcion, fecha, soloFecha, ruta }
export async function listarNotificaciones() {
    const datos = await pedir('/notificaciones');
    return Array.isArray(datos) ? datos : [];
}

// La base de datos no guarda qué notificaciones ya se leyeron: se recuerda en este navegador, por usuario.
const claveLeidas = (rut) => `notificaciones-leidas-${rut}`;
const MAX_LEIDAS = 500;

// Se dispara cada vez que cambian las leídas, para que el globo del Header se actualice al instante
export const EVENTO_LEIDAS = 'notificaciones-leidas-cambiaron';

export function obtenerLeidas(rut) {
    try {
        return new Set(JSON.parse(localStorage.getItem(claveLeidas(rut)) ?? '[]'));
    } catch {
        return new Set();
    }
}

export function guardarLeidas(rut, ids) {
    try {
        localStorage.setItem(claveLeidas(rut), JSON.stringify([...ids].slice(-MAX_LEIDAS)));
    } catch {
        /* sin almacenamiento disponible: se vuelven a mostrar como nuevas */
    }
    window.dispatchEvent(new Event(EVENTO_LEIDAS));
}