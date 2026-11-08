// src/services/cartService.js
//
// Carrito y compra, conectados a la API:
//   GET    /carrito                         -> lo que hay en el carrito (productos y servicios, con su cantidad)
//   POST   /carrito/agregar                 -> { tipo, id_item, cantidad }
//   PUT    /carrito/actualizar              -> { tipo, id_item, cantidad }
//   DELETE /carrito/eliminar/{tipo}/{id}
//   POST   /ventas                          -> paga lo que hay en el carrito y lo vacía
//   GET    /direcciones                     -> direcciones de despacho del usuario
//
// La API del carrito devuelve solo nombre y cantidad, así que el precio, la imagen y el vendedor se
// toman del catálogo (que ya trae el precio final con la oferta aplicada).

import { pedir } from './apiClient';
import { listarCatalogo } from './catalogService';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export const IVA = 0.19;

// La imagen viene como ruta relativa del servidor ("uploads/x.png"); se le agrega la dirección de la API
export const urlImagen = (imagen) =>
    imagen
        ? imagen.startsWith('http')
            ? imagen
            : `${API_URL.replace(/\/api\/?$/, '')}/${imagen.replace(/^\/+/, '')}`
        : null;

// Un producto y un servicio pueden tener el mismo id, por eso se identifican con tipo + id
const clave = (tipo, id) => `${tipo}-${id}`;

export async function obtenerCarrito() {
    const [carrito, catalogo] = await Promise.all([pedir('/carrito'), listarCatalogo().catch(() => [])]);
    const porClave = new Map(catalogo.map((i) => [i.clave, i]));

    return [...(carrito?.productos ?? []), ...(carrito?.servicios ?? [])].map((fila) => {
        const info = porClave.get(clave(fila.tipo, fila.id_item));
        return {
            clave: clave(fila.tipo, fila.id_item),
            tipo: fila.tipo, // "producto" | "servicio"
            id: fila.id_item,
            nombre: info?.nombre ?? fila.nombre,
            descripcion: info?.descripcion ?? '',
            precio: info?.precio ?? null, // un servicio sin vendedor puede no tener precio
            precioAnterior: info?.precioAnterior ?? null,
            descuentoPct: info?.descuentoPct ?? 0,
            imagen: urlImagen(info?.imagen),
            vendedor: info?.vendedor ?? '',
            restriccionEdad: info?.restriccionEdad ?? false,
            cantidad: fila.cantidad,
        };
    });
}

export const agregarAlCarrito = (tipo, id, cantidad = 1) =>
    pedir('/carrito/agregar', { method: 'POST', body: { tipo, id_item: id, cantidad } });

export const actualizarCantidad = (tipo, id, cantidad) =>
    pedir('/carrito/actualizar', { method: 'PUT', body: { tipo, id_item: id, cantidad } });

export const quitarDelCarrito = (tipo, id) => pedir(`/carrito/eliminar/${tipo}/${id}`, { method: 'DELETE' });

// Los precios son netos (sin IVA), igual que en la API: total = neto + 19 % de IVA
export const calcularTotales = (items) => {
    const neto = items.reduce((suma, i) => suma + (i.precio ?? 0) * i.cantidad, 0);
    const iva = Math.round(neto * IVA);
    return { neto, iva, total: neto + iva };
};

// datos: { mediopago, ult4digitostarjeta, codigotransferencia, requieredespacho, id_direccion, nota }
// Devuelve { id_venta, total_pagado }
export const crearVenta = (datos) => pedir('/ventas', { method: 'POST', body: datos });

export async function listarDirecciones() {
    const lista = await pedir('/direcciones');
    return (lista ?? []).map((d) => ({
        id: d.id,
        texto: [
            `${d.calle} ${d.numero}`,
            d.pasaje && `pasaje ${d.pasaje}`,
            d.sector,
            d.nombre_comuna,
        ]
            .filter(Boolean)
            .join(', '),
        detalle: d.descripcion ?? '',
    }));
}
