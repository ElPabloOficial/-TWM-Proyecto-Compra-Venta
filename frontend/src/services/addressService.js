// Direcciones de despacho del usuario (API: /direcciones) y la lista de comunas (/comunas).

import { pedir } from './apiClient';

const adaptar = (d) => ({
    id: d.id,
    calle: d.calle ?? '',
    numero: d.numero != null ? String(d.numero) : '',
    pasaje: d.pasaje ?? '',
    sector: d.sector ?? '',
    descripcion: d.descripcion ?? '',
    idComuna: d.id_comuna,
    comuna: d.nombre_comuna ?? '',
    region: d.nombre_region ?? '',
});

// El formulario guarda todo como texto; la API espera el número y la comuna como números
const aCuerpo = (f) => ({
    calle: f.calle.trim(),
    numero: Number(f.numero),
    pasaje: f.pasaje.trim(),
    descripcion: f.descripcion.trim(),
    sector: f.sector.trim(),
    id_comuna: Number(f.idComuna),
});

export async function obtenerDirecciones() {
    return ((await pedir('/direcciones')) ?? []).map(adaptar);
}

export async function crearDireccion(form) {
    await pedir('/direcciones', { method: 'POST', body: aCuerpo(form) });
}

export async function actualizarDireccion(id, form) {
    await pedir(`/direcciones/${id}`, { method: 'PUT', body: aCuerpo(form) });
}

export async function eliminarDireccion(id) {
    await pedir(`/direcciones/${id}`, { method: 'DELETE' });
}

// [{ id, nombre, provincia, region }]
export async function obtenerComunas() {
    return (await pedir('/comunas')) ?? [];
}
