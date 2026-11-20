import { pedir } from './apiClient';

// Listas de deseos reales (API /wishlist). En la base de datos una lista pertenece a un usuario mientras
// tenga al menos un producto o servicio guardado (tablas Crear1 y Crear2), así que una lista nueva se crea
// junto con su primer ítem y desaparece cuando se quita el último.

// Mis listas: [{ id, nombre, descripcion, publica, cantidad }]
export async function listarListasDeseos() {
    const datos = await pedir('/wishlist/listas');
    return Array.isArray(datos) ? datos : [];
}

// Crea una lista con su primer producto o servicio.
// datos: { nombre, descripcion, publica, tipo: "producto" | "servicio", id }
export async function crearListaDeseos({ nombre, descripcion, publica, tipo, id }) {
    return pedir('/wishlist/listas', {
        method: 'POST',
        body: { nombre, descripcion, publica, tipo, id_item: id },
    });
}

// Cambia nombre, descripción y visibilidad de una lista. datos: { nombre, descripcion, publica }
export async function actualizarListaDeseos(id, { nombre, descripcion, publica }) {
    return pedir(`/wishlist/listas/${id}`, { method: 'PUT', body: { nombre, descripcion, publica } });
}

// Elimina una lista junto con lo que guardaste en ella
export async function eliminarListaDeseos(id) {
    await pedir(`/wishlist/listas/${id}`, { method: 'DELETE' });
}

// Todo lo que el usuario guardó: { productos: [{ id, nombre, idLista }], servicios: [{ id, nombre, idLista }] }
// Un mismo producto aparece una vez por cada lista en la que está.
export async function obtenerMiWishlist() {
    const datos = await pedir('/wishlist');
    return { productos: datos?.productos ?? [], servicios: datos?.servicios ?? [] };
}

// Guarda un producto o servicio en una lista (sin idLista, en "Mis Favoritos"). tipo: "producto" | "servicio".
// La API responde 400 ("ya está en tu lista") si ya estaba guardado en esa lista.
export async function agregarAWishlist(tipo, id, idLista) {
    await pedir('/wishlist/agregar', {
        method: 'POST',
        body: { tipo, id_item: id, ...(idLista != null && { id_lista: idLista }) },
    });
}

// Quita un producto o servicio de una lista (sin idLista, de todas las que lo tengan)
export async function eliminarDeWishlist(tipo, id, idLista) {
    const consulta = idLista != null ? `?idLista=${idLista}` : '';
    await pedir(`/wishlist/eliminar/${tipo}/${id}${consulta}`, { method: 'DELETE' });
}

// ---------- Diálogo "Agregar a una lista" ----------

// Listas del usuario y en cuáles ya está este ítem: { listas, seleccionadas: [idLista, ...] }
export async function obtenerListasDeItem(tipo, id) {
    const [listas, wishlist] = await Promise.all([listarListasDeseos(), obtenerMiWishlist()]);
    const guardados = tipo === 'servicio' ? wishlist.servicios : wishlist.productos;
    const seleccionadas = guardados.filter((g) => g.id === id).map((g) => g.idLista);
    return { listas, seleccionadas: listas.map((l) => l.id).filter((idLista) => seleccionadas.includes(idLista)) };
}

// Deja el ítem exactamente en las listas indicadas: lo agrega a las marcadas, lo quita de las desmarcadas
// y crea las listas nuevas (datos { nombre, descripcion, publica }) con este ítem como primero.
export async function guardarItemEnListas(tipo, id, idsListas, listasNuevas = []) {
    const quiere = new Set(idsListas);
    const { seleccionadas: actuales } = await obtenerListasDeItem(tipo, id);

    // Primero se agrega y se crea, y al final se quita: así una lista no desaparece a mitad del proceso
    for (const idLista of quiere) {
        if (!actuales.includes(idLista)) await agregarAWishlist(tipo, id, idLista);
    }
    for (const nueva of listasNuevas) {
        await crearListaDeseos({ nombre: nueva.nombre, descripcion: nueva.descripcion, publica: nueva.publica, tipo, id });
    }
    for (const idLista of actuales) {
        if (!quiere.has(idLista)) await eliminarDeWishlist(tipo, id, idLista);
    }

    return { enAlguna: quiere.size + listasNuevas.length > 0 };
}