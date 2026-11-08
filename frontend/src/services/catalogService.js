// src/services/catalogService.js
//
// Catálogo público (GET /catalogo): productos y servicios juntos, para el Home y el Catálogo.
// La API ya entrega el precio final (con la oferta aplicada si hay una vigente) y, en ese caso,
// el precio anterior y el descuento.

import { pedir } from './apiClient';

const adaptar = (i) => {
    const descuentoPct = i.descuento ? Math.round(i.descuento * 100) : 0;
    return {
        clave: `${i.tipo}-${i.id}`, // un producto y un servicio pueden tener el mismo id
        tipo: i.tipo, // "producto" | "servicio"
        id: i.id,
        nombre: i.nombre ?? '',
        descripcion: i.descripcion ?? '',
        precio: i.precio ?? null, // un servicio sin vendedor puede no tener precio
        precioAnterior: i.precio_anterior ?? null,
        descuentoPct,
        imagen: i.imagen || null,
        categorias: (i.categorias ?? []).map((c) => ({ id: c.id, nombre: c.nombre })),
        categoria: i.categorias?.[0]?.nombre ?? '',
        ubicacion: i.ubicacion ?? '',
        vendedor: i.vendedor?.nombre ?? '',
        restriccionEdad: Boolean(i.restriccionedad),
        etiqueta: descuentoPct > 0 ? 'Oferta' : i.tipo === 'servicio' ? 'Servicio' : '',
    };
};

export async function listarCatalogo() {
    const datos = await pedir('/catalogo');
    return (datos ?? []).map(adaptar);
}

// Ficha de un producto o servicio (rutas /producto/:id y /servicio/:id)
export const rutaDetalle = (item) => (item.tipo === 'servicio' ? `/servicio/${item.id}` : `/producto/${item.id}`);
