// src/services/pedidoService.js
//
// Conecta la pantalla de Pedidos del vendedor con la API (.NET).
//
// Un "pedido" es una venta (tabla Venta) del vendedor. La API entrega ya armado:
//   { id, fecha, estado, requiere_despacho, cliente, direccion, seguimiento, neto, total, items }
// donde "estado" es: pendiente | preparacion | enviado | entregado | cancelado
// (la API lo calcula a partir de Venta.Estado y Despacho.Estado).

import { pedir } from './apiClient';

const adaptarPedido = (v) => ({
    id: v.id,
    numero: `PED-${String(v.id).padStart(4, '0')}`,
    cliente: v.cliente ?? '',
    // Sin despacho (servicios o retiro en tienda) no hay dirección de entrega
    direccion: v.direccion ?? 'Sin despacho (servicio o retiro)',
    fecha: v.fecha ? String(v.fecha).slice(0, 10) : '',
    estado: v.estado,
    seguimiento: v.seguimiento ?? '',
    requiereDespacho: Boolean(v.requiere_despacho),
    neto: Number(v.neto ?? 0),
    total: Number(v.total ?? 0), // neto + IVA
    items: (v.items ?? []).map((i) => ({
        nombre: i.nombre,
        cantidad: i.cantidad,
        subtotal: Number(i.subtotal ?? 0), // neto de la línea (precio × cantidad)
    })),
});

export async function listarMisPedidos() {
    const datos = await pedir('/ventas/mis-pedidos');
    return (datos ?? []).map(adaptarPedido);
}

// Cambia el estado del pedido. "seguimiento" solo importa para "enviado" y "entregado".
export async function actualizarEstadoPedido({ id, estado, seguimiento }) {
    await pedir(`/ventas/${id}/estado`, {
        method: 'PUT',
        body: { estado, seguimiento: seguimiento || null },
    });
}
