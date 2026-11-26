// src/services/shipmentService.js
//
// Despachos (envíos) de las ventas, conectados con la API (.NET). Los estados son los de la tabla
// Despacho de la BD: 'En Preparación' -> 'Despachado' -> 'En reparto' -> 'Entregado'.
//
//   listarDespachosVendedor  -> GET /despachos/mis-despachos              (vendedor)
//   obtenerDespacho          -> GET /despachos/venta/{idVenta}            (cliente o vendedor)
//   avanzarDespacho          -> PUT /despachos/venta/{idVenta}/avanzar    (vendedor)
//
// La API responde en snake_case; aquí se convierte a la forma que usan las pantallas:
//   { idVenta, estado, cliente, direccion, transportista, seguimiento, paquete, costoEnvio,
//     fechaEstimada, productos, eventos }

import { pedir } from './apiClient';

export const ETAPAS_DESPACHO = ['En Preparación', 'Despachado', 'En reparto', 'Entregado'];

// Cómo se muestra cada estado (el de la BD es 'En Preparación', con mayúscula)
export const ETIQUETA_ESTADO = {
    'En Preparación': 'En preparación',
    Despachado: 'Despachado',
    'En reparto': 'En reparto',
    Entregado: 'Entregado',
};

// Solo se usa si la compra no trae empresa de despacho (normalmente se elige al comprar).
// Los nombres son los de la tabla EmpresaDespacho.
export const TRANSPORTISTAS = ['Chilexpress', 'Starken', 'CorreosChile', 'Blue Express'];

const adaptarDespacho = (d) => ({
    idVenta: d.id_venta,
    idDespacho: d.id_despacho,
    estado: d.estado,
    cliente: d.cliente ?? '',
    direccion: {
        calle: d.direccion_entrega?.calle ?? '',
        numero: d.direccion_entrega?.numero ?? '',
        comuna: d.direccion_entrega?.comuna ?? '',
    },
    transportista: d.empresa_despacho ?? null,
    seguimiento: d.numero_seguimiento ?? null,
    paquete: d.paquete
        ? { ancho: d.paquete.ancho_cm, alto: d.paquete.alto_cm, fondo: d.paquete.fondo_cm }
        : null,
    costoEnvio: d.costo_envio != null ? Number(d.costo_envio) : null,
    fechaEstimada: d.fecha_estimada,
    productos: (d.productos ?? []).map((p) => ({ nombre: p.nombre, cantidad: p.cantidad })),
    eventos: (d.eventos ?? []).map((e) => ({ estado: e.estado, fecha: e.fecha, detalle: e.detalle })),
});

export async function listarDespachosVendedor() {
    const datos = await pedir('/despachos/mis-despachos');
    return (datos ?? []).map(adaptarDespacho);
}

export async function obtenerDespacho(idVenta) {
    const datos = await pedir(`/despachos/venta/${encodeURIComponent(idVenta)}`);
    return adaptarDespacho(datos);
}

// Pasa el despacho a la etapa siguiente. Para pasar a "Despachado" el vendedor indica el número de
// seguimiento y las medidas del paquete (y la empresa, solo si la compra no la trae).
export async function avanzarDespacho(idVenta, { transportista, seguimiento, ancho, alto, fondo } = {}) {
    const body = {};
    if (transportista) body.transportista = transportista;
    if (String(seguimiento ?? '').trim()) body.seguimiento = String(seguimiento).trim();
    if (Number(ancho) > 0) body.ancho = Number(ancho);
    if (Number(alto) > 0) body.alto = Number(alto);
    if (Number(fondo) > 0) body.fondo = Number(fondo);

    const datos = await pedir(`/despachos/venta/${encodeURIComponent(idVenta)}/avanzar`, { method: 'PUT', body });
    return adaptarDespacho(datos);
}
