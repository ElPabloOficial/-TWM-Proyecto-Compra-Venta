import { pedir } from './apiClient';

// Ventas del vendedor en un período (GET /reportes/ventas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD).
// Devuelve una fila por cada producto o servicio vendido (solo ventas Pagadas o Entregadas):
//   { id, idVenta, fecha: "2026-11-20", tipo, producto, categoria, cantidad, precio, total }
// "total" es el neto de la fila (sin IVA); "precio" es el unitario.
export async function listarVentasDelPeriodo(desde, hasta) {
    const datos = await pedir(`/reportes/ventas?desde=${desde}&hasta=${hasta}`);
    return (Array.isArray(datos) ? datos : []).map((fila, i) => ({
        id: `${fila.idVenta}-${fila.tipo}-${i}`,
        idVenta: fila.idVenta,
        fecha: fila.fecha,
        tipo: fila.tipo,
        producto: fila.producto,
        categoria: fila.categoria,
        cantidad: fila.cantidad,
        precio: fila.precio,
        total: fila.total,
    }));
}