import { authService } from './authService';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5097/api';
export const hoyLocal = () => new Date().toLocaleDateString('sv-SE');
export async function pedir(ruta, { method = 'GET', body } = {}) {
    let respuesta;
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method,
            headers: { 'Content-Type': 'application/json', ...authService.getAuthHeader() },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.');
    }
    if (respuesta.status === 401) throw new Error('Tu sesión no es válida. Vuelve a iniciar sesión.');
    if (respuesta.status === 403) throw new Error('No tienes permiso para modificar este elemento.');

    const cuerpo = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        const detalle = Array.isArray(cuerpo?.errors) && cuerpo.errors.length ? ` (${cuerpo.errors.join(', ')})` : '';
        throw new Error((cuerpo?.message ?? cuerpo?.title ?? 'Error en el servidor.') + detalle);
    }
    return cuerpo?.data;
}
export const leerJson = (valor) => {
    if (typeof valor !== 'string') return valor ?? {};
    try {
        return JSON.parse(valor);
    } catch {
        return {};
    }
};
