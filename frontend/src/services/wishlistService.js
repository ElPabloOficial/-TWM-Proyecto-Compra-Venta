// src/services/wishlistService.js
//
// Listas de deseos del usuario (tabla ListaDeseos: id, nombrelista, descripcion, visibilidad).
// TEMPORAL: la API todavía no tiene un endpoint que devuelva las listas del usuario
// (GET /wishlist solo devuelve los productos y servicios). Mientras tanto se usan
// datos de ejemplo; al crear el endpoint, solo hay que cambiar esta función por pedir('/wishlist/listas').

const LISTAS_EJEMPLO = [
    { id: 1, nombre: 'Mis Favoritos', descripcion: 'Lista por defecto', publica: false, cantidad: 3 },
    { id: 2, nombre: 'Regalos de cumpleaños', descripcion: 'Ideas para regalar este año', publica: true, cantidad: 5 },
    { id: 3, nombre: 'Setup de escritorio', descripcion: 'Monitor, teclado y accesorios', publica: false, cantidad: 4 },
    { id: 4, nombre: 'Hogar nuevo', descripcion: '', publica: false, cantidad: 0 },
];

export async function listarListasDeseos() {
    return LISTAS_EJEMPLO;
}
