// src/services/productService.js
//
// Conecta la gestión de inventario con la API (.NET).
//
// La pantalla de inventario trabaja con un producto "plano":
//   { id, nombre, sku, descripcion, categoriaId, precio, stock, imagen,
//     restriccionEdad, oferta (%), ofertaInicio, ofertaFin }
// pero en la base de datos esos datos están repartidos:
//   - Producto:    nombre, restriccionedad y un JSON "caracteristicas" (aquí van sku, descripcion y precio)
//   - Almacenar:   el stock de cada producto, dentro del Inventario del vendedor
//   - Oferta:      el descuento (0.15 = 15 %), y las fechas están en el propio Producto
// Este archivo hace la traducción en los dos sentidos.

import { pedir, hoyLocal, leerJson } from './apiClient';

// ---------- De la API a la pantalla ----------

const adaptarProducto = (p) => {
    const c = leerJson(p.caracteristicas);
    // Una oferta desactivada (estado = false) cuenta como "sin oferta"
    const hayOferta = p.id_oferta != null && p.ofertaactiva === true && p.preciooferta != null;

    return {
        id: p.id,
        nombre: p.nombre,
        sku: c.sku ?? '',
        descripcion: c.descripcion ?? '',
        categoriaId: p.categorias?.[0] ?? '',
        precio: Number(c.precio ?? 0),
        stock: Number(p.stockactual ?? 0),
        imagen: null, // TEMPORAL: las imágenes aún no se guardan en la API
        restriccionEdad: Boolean(p.restriccionedad),
        oferta: hayOferta ? Math.round(p.preciooferta * 100) : 0,
        ofertaInicio: hayOferta ? p.fechainicio ?? '' : '',
        ofertaFin: hayOferta ? p.fechafin ?? '' : '',
        idOferta: hayOferta ? p.id_oferta : null,
        // Se guarda el JSON completo para no perder color, material, etc. al editar
        _caracteristicas: c,
    };
};

// Estado de la oferta según las fechas: "vigente", "programada", "vencida" o "" si no hay oferta.
// Se calcula en el frontend porque depende de la fecha de hoy y no se guarda en la base de datos.
export const calcularEstadoOferta = (p) => {
    if (!(p.oferta > 0) || !p.ofertaInicio || !p.ofertaFin) return '';
    const hoy = hoyLocal();
    if (hoy < p.ofertaInicio) return 'programada';
    if (hoy > p.ofertaFin) return 'vencida';
    return 'vigente';
};

export async function listarMisProductos() {
    const datos = await pedir('/productos/mis-productos');
    return (datos ?? []).map(adaptarProducto);
}

export async function listarCategorias() {
    const datos = await pedir('/categorias');
    return (datos ?? []).map((c) => ({ id: c.id, nombre: c.nombre, padreId: c.id_categoria_padre ?? null }));
}

// ---------- De la pantalla a la API ----------

const armarCaracteristicas = (datos) => ({
    ...(datos._caracteristicas ?? { visibilidad: 'Activo' }),
    sku: datos.sku,
    descripcion: datos.descripcion,
    precio: datos.precio,
});

const armarProducto = (datos) => ({
    nombre: datos.nombre,
    restriccionedad: Boolean(datos.restriccionEdad),
    caracteristicas: armarCaracteristicas(datos),
    id_categoria: Number(datos.categoriaId),
});

// Devuelve el id del inventario del vendedor; si todavía no tiene uno, lo crea.
async function obtenerInventarioId() {
    const inventarios = await pedir('/inventarios');
    if (inventarios?.length) return inventarios[0].id;

    // Mínimo 10 unidades: es el umbral de "inventario crítico" que pide la pauta
    const nuevo = await pedir('/inventarios', {
        method: 'POST',
        body: { stockminimo: 10, stockmaximo: 10000 },
    });
    return nuevo.id;
}

async function guardarStock(idProducto, stock) {
    const idInventario = await obtenerInventarioId();
    await pedir('/inventarios/almacenar', {
        method: 'POST',
        body: { id_inventario: idInventario, id_producto: idProducto, stockactual: stock },
    });
}

// Reglas de la oferta que la API o la base de datos exigen. Se revisan antes de enviar nada,
// para no dejar el producto a medio guardar.
function validarOferta(datos) {
    if (!(datos.oferta > 0)) return;
    if (datos.oferta >= 100) {
        throw new Error('La oferta debe ser menor a 100 %.');
    }
    if (datos.ofertaInicio > hoyLocal()) {
        // La base de datos tiene la restricción chk_producto_fecha_inicio (inicio <= hoy)
        throw new Error('Por ahora la oferta no puede empezar en una fecha futura: usa la fecha de hoy o una anterior.');
    }
}

// Crea, cambia o quita la oferta solo si algo cambió respecto a lo que ya tenía el producto
async function sincronizarOferta(datos, original) {
    const cambio =
        !original ||
        original.oferta !== datos.oferta ||
        original.ofertaInicio !== datos.ofertaInicio ||
        original.ofertaFin !== datos.ofertaFin;
    if (!cambio) return;

    // Para cambiar una oferta se desactiva la anterior y se crea una nueva
    if (original?.idOferta) {
        await pedir(`/ofertas/${original.idOferta}`, { method: 'DELETE' });
    }
    if (datos.oferta > 0) {
        await pedir('/ofertas', {
            method: 'POST',
            body: {
                preciooferta: Math.round(datos.oferta) / 100, // 15 % -> 0.15
                estado: true,
                id_producto: datos.id,
                fechainicio: datos.ofertaInicio,
                fechafin: datos.ofertaFin,
            },
        });
    }
}

export async function crearProducto(datos) {
    const creado = await pedir('/productos', { method: 'POST', body: armarProducto(datos) });

    try {
        await guardarStock(creado.id, datos.stock);
    } catch (e) {
        throw new Error(`El producto se creó, pero no se pudo guardar el stock: ${e.message}`);
    }
    return creado.id;
}

export async function actualizarProducto(datos, original) {
    validarOferta(datos);

    await pedir(`/productos/${datos.id}`, { method: 'PUT', body: armarProducto(datos) });
    await guardarStock(datos.id, datos.stock);
    await sincronizarOferta(datos, original);
}

export async function eliminarProducto(id) {
    await pedir(`/productos/${id}`, { method: 'DELETE' });
}
