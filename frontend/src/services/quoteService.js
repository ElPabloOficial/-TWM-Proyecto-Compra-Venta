import { pedir } from './apiClient';

// Cotizaciones (API /cotizaciones). Cada cotización es de un solo vendedor: al solicitarla, la API crea una por
// cada vendedor involucrado. Estados: "Solicitada" -> "Respondida" -> "Aceptada" ("Expirada" a los 15 días).

// La API entrega la cotización en español; las pantallas usan estos nombres
const adaptar = (c) => ({
    id: String(c.id),
    issueDate: c.fechaEmision, // "2026-11-20"
    expirationDate: c.fechaExpiracion,
    status: c.estado,
    client: { name: c.cliente?.nombre ?? '—', rut: c.cliente?.rut ?? '—' },
    seller: c.vendedor ? { name: c.vendedor.nombre, rut: c.vendedor.rut } : { name: 'Por asignar', rut: '—' },
    items: (c.items ?? []).map((i) => ({
        tipo: i.tipo, // "producto" | "servicio"
        id: i.id,
        name: i.nombre,
        unitPrice: i.precio,
        quantity: i.cantidad,
        stock: i.stock ?? null, // unidades que quedan (solo productos, y solo en el detalle del cliente)
    })),
});

// Las que pedí como cliente
export async function listarMisCotizaciones() {
    const datos = await pedir('/cotizaciones/mias');
    return (Array.isArray(datos) ? datos : []).map(adaptar);
}

// Las que me pidieron como vendedor (solo con mis productos y servicios)
export async function listarCotizacionesRecibidas() {
    const datos = await pedir('/cotizaciones/recibidas');
    return (Array.isArray(datos) ? datos : []).map(adaptar);
}

export async function obtenerCotizacion(id) {
    return adaptar(await pedir(`/cotizaciones/${id}`));
}

// Solicita una cotización. items: [{ id, tipo: "unidad" | "servicio", precio, cantidad }]
// Devuelve { ids }: los números de las cotizaciones creadas (una por vendedor).
export async function crearCotizaciones(items) {
    const datos = await pedir('/cotizaciones', {
        method: 'POST',
        body: {
            items: items.map((i) => ({
                tipo: i.tipo === 'servicio' ? 'servicio' : 'producto',
                id_item: i.id,
                precio: i.precio,
                cantidad: i.cantidad,
            })),
        },
    });
    return { ids: datos?.ids ?? [] };
}

// El vendedor responde: precio unitario de cada ítem, en el mismo orden que cotizacion.items
export async function responderCotizacion(cotizacion, precios) {
    await pedir(`/cotizaciones/${cotizacion.id}/responder`, {
        method: 'PUT',
        body: {
            precios: cotizacion.items.map((item, i) => ({ tipo: item.tipo, id_item: item.id, precio: precios[i] })),
        },
    });
}

// El cliente acepta una cotización respondida y vigente
export async function aceptarCotizacion(id) {
    await pedir(`/cotizaciones/${id}/aceptar`, { method: 'PUT' });
}