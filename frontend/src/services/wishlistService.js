// src/services/wishlistService.js
//
// Listas de deseos del usuario (tabla ListaDeseos: id, nombrelista, descripcion, visibilidad).
// TEMPORAL: la API todavía no tiene un endpoint que devuelva las listas del usuario
// (GET /wishlist solo devuelve los productos y servicios). Mientras tanto se usan
// datos de ejemplo; al crear el endpoint, solo hay que cambiar esta función por pedir('/wishlist/listas').

import { pedir } from './apiClient';

const LISTAS_EJEMPLO = [
    { id: 1, nombre: 'Mis Favoritos', descripcion: 'Lista por defecto', publica: false, cantidad: 3 },
    { id: 2, nombre: 'Regalos de cumpleaños', descripcion: 'Ideas para regalar este año', publica: true, cantidad: 5 },
    { id: 3, nombre: 'Setup de escritorio', descripcion: 'Monitor, teclado y accesorios', publica: false, cantidad: 4 },
    { id: 4, nombre: 'Hogar nuevo', descripcion: '', publica: false, cantidad: 0 },
];

export async function listarListasDeseos() {
    return LISTAS_EJEMPLO;
}

// datos: { nombre, descripcion, publica }
// TEMPORAL: la lista nueva solo existe mientras la página no se recargue.
// Con el backend esto pasa a ser un POST que guarda nombrelista, descripcion y visibilidad.
export async function crearListaDeseos({ nombre, descripcion, publica }) {
    const id = Math.max(0, ...LISTAS_EJEMPLO.map((l) => l.id)) + 1;
    const nueva = { id, nombre, descripcion, publica, cantidad: 0 };
    LISTAS_EJEMPLO.push(nueva);
    return nueva;
}

// Cambia nombre, descripción y visibilidad de una lista. TEMPORAL: con el backend es un PUT.
export async function actualizarListaDeseos(id, { nombre, descripcion, publica }) {
    const lista = LISTAS_EJEMPLO.find((l) => l.id === id);
    if (!lista) throw new Error('La lista no existe.');
    Object.assign(lista, { nombre, descripcion, publica });
    return lista;
}

// Elimina una lista (el cliente puede eliminar lo que guardó en su wishlist). TEMPORAL: con el backend es un DELETE.
export async function eliminarListaDeseos(id) {
    const indice = LISTAS_EJEMPLO.findIndex((l) => l.id === id);
    if (indice === -1) throw new Error('La lista no existe.');
    LISTAS_EJEMPLO.splice(indice, 1);
}

// ---------- Con la API (GET /wishlist y POST /wishlist/agregar) ----------

// Lo que el usuario guardó: { productos: [{ id, nombre }], servicios: [{ id, nombre }] }
export async function obtenerMiWishlist() {
    const datos = await pedir('/wishlist');
    return { productos: datos?.productos ?? [], servicios: datos?.servicios ?? [] };
}

// Guarda un producto o servicio en la lista de deseos. tipo: "producto" | "servicio".
// La API responde 400 ("ya está en tu lista") si ya estaba guardado.
export async function agregarAWishlist(tipo, id) {
    await pedir('/wishlist/agregar', { method: 'POST', body: { tipo, id_item: id } });
}
