// src/services/categoryService.js
//
// Categorías conectadas a la API (CategoriasController):
//   GET    /categorias        -> todas, con su categoría padre y cuántos productos/servicios tiene cada una
//   POST   /categorias        -> { nombre, id_categoria_padre }   (solo administrador)
//   PUT    /categorias/{id}   -> { nombre, id_categoria_padre }   (solo administrador)
//   DELETE /categorias/{id}   -> solo si no tiene subcategorías ni productos/servicios (solo administrador)

import { pedir } from './apiClient';

// Devuelve la lista plana: [{ id, nombre, padreId, cantidadProductos, cantidadServicios }]
export async function obtenerCategorias() {
    const lista = await pedir('/categorias');
    return (lista ?? []).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        padreId: c.id_categoria_padre ?? null, // null = categoría raíz (Productos, Servicios)
        cantidadProductos: c.cantidad_productos ?? 0,
        cantidadServicios: c.cantidad_servicios ?? 0,
    }));
}

export const crearCategoria = ({ nombre, padreId = null }) =>
    pedir('/categorias', { method: 'POST', body: { nombre, id_categoria_padre: padreId } });

export const actualizarCategoria = (id, { nombre, padreId = null }) =>
    pedir(`/categorias/${id}`, { method: 'PUT', body: { nombre, id_categoria_padre: padreId } });

export const eliminarCategoria = (id) => pedir(`/categorias/${id}`, { method: 'DELETE' });
