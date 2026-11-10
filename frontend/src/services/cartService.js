
import { pedir } from "./apiClient";
import { listarCatalogo } from "./catalogService";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const IVA = 0.19;

// Identificar rutas de imágenes locales
const esRutaLocal = (ruta) =>
    /^(file:|[a-zA-Z]:[\\/]|\\\\)/i.test(ruta.trim());

// Obtener URL válida de imagen
export const urlImagen = (imagen) => {
    if (
        !imagen ||
        typeof imagen !== "string" ||
        esRutaLocal(imagen)
    ) {
        return null;
    }

    return imagen.startsWith("http")
        ? imagen
        : `${API_URL.replace(/\/api\/?$/, "")}/${imagen.replace(/^\/+/, "")}`;
};

// Identificar productos y servicios
const clave = (tipo, id) => `${tipo}-${id}`;

// Obtener carrito
export async function obtenerCarrito() {
    const [carrito, catalogo] = await Promise.all([
        pedir("/carrito"),
        listarCatalogo().catch(() => []),
    ]);

    const porClave = new Map(
        catalogo.map((i) => [i.clave, i])
    );

    return [
        ...(carrito?.productos ?? []),
        ...(carrito?.servicios ?? []),
    ].map((fila) => {
        const info = porClave.get(
            clave(fila.tipo, fila.id_item)
        );

        return {
            clave: clave(fila.tipo, fila.id_item),
            tipo: fila.tipo,
            id: fila.id_item,
            nombre: info?.nombre ?? fila.nombre,
            descripcion: info?.descripcion ?? "",
            precio: info?.precio ?? null,
            precioAnterior: info?.precioAnterior ?? null,
            descuentoPct: info?.descuentoPct ?? 0,
            imagen: urlImagen(info?.imagen),
            vendedor: info?.vendedor ?? "",
            restriccionEdad: info?.restriccionEdad ?? false,
            cantidad: fila.cantidad,
        };
    });
}

// Agregar producto o servicio al carrito
export const agregarAlCarrito = (
    tipo,
    id,
    cantidad = 1
) =>
    pedir("/carrito/agregar", {
        method: "POST",
        body: {
            tipo,
            id_item: id,
            cantidad,
        },
    });

// Actualizar cantidad
export const actualizarCantidad = (
    tipo,
    id,
    cantidad
) =>
    pedir("/carrito/actualizar", {
        method: "PUT",
        body: {
            tipo,
            id_item: id,
            cantidad,
        },
    });

// Eliminar producto o servicio del carrito
export const quitarDelCarrito = (tipo, id) =>
    pedir(`/carrito/eliminar/${tipo}/${id}`, {
        method: "DELETE",
    });

// Calcular totales
export const calcularTotales = (items) => {
    const neto = items.reduce(
        (suma, i) =>
            suma + (i.precio ?? 0) * i.cantidad,
        0
    );

    const iva = Math.round(neto * IVA);

    return {
        neto,
        iva,
        total: neto + iva,
    };
};

// Crear venta
export const crearVenta = (datos) =>
    pedir("/ventas", {
        method: "POST",
        body: datos,
    });

// Listar direcciones
export async function listarDirecciones() {
    const lista = await pedir("/direcciones");

    return (lista ?? []).map((d) => ({
        id: d.id,
        texto: [
            `${d.calle} ${d.numero}`,
            d.pasaje && `pasaje ${d.pasaje}`,
            d.sector,
            d.nombre_comuna,
        ]
            .filter(Boolean)
            .join(", "),
        detalle: d.descripcion ?? "",
    }));
}
