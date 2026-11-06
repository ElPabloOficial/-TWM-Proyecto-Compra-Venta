// src/services/adminService.js
//
// Servicios del panel de administración: usuarios (API real) y estadísticas (datos de ejemplo).
//
// Estadísticas del panel de administración.
// TEMPORAL: la API todavía no tiene un endpoint de estadísticas (AdminController solo
// entrega usuarios, reseñas, mensajes y devoluciones). Mientras tanto se usan datos de
// ejemplo; al crearlo (p. ej. GET /admin/estadisticas), solo hay que cambiar esta función
// por: return pedir('/admin/estadisticas');

import { pedir } from './apiClient';

const ESTADISTICAS_EJEMPLO = {
    ingresosMensuales: [
        { mes: 'Abr', monto: 12200000 },
        { mes: 'May', monto: 13400000 },
        { mes: 'Jun', monto: 14000000 },
        { mes: 'Jul', monto: 15800000 },
        { mes: 'Ago', monto: 16500000 },
        { mes: 'Sep', monto: 18500000 },
    ],
    ventasCompletadas: 1284,
    tiempoEntregaDias: 2.4,
    calificacionPromedio: 4.6,
    enviosPorEmpresa: [
        { empresa: 'Chilexpress', cantidad: 420 },
        { empresa: 'Starken', cantidad: 310 },
        { empresa: 'Correos de Chile', cantidad: 180 },
        { empresa: 'Otros', cantidad: 95 },
    ],
    calidad: {
        preguntasSinResponder48h: 7,
        resenasNuevasSemana: 64,
        tasaDevoluciones: 3.1,
        emprendedoresBajo3: 2,
    },
};

// ---------- Usuarios (AdminController: /admin/usuarios) ----------

// Pasa un usuario de la API al formato que usa la tabla.
// La BD guarda 'admin' o 'administrador'; aquí ambos son "administrador".
// "estado" lo calcula la API (Activo = tiene la sesión iniciada).
const aUsuarioTabla = (u) => {
    const tipo = String(u.tipo ?? '').trim().toLowerCase();
    return {
        id: u.rut,
        rut: u.rut,
        nombre: u.nombre,
        correo: u.correo,
        tipo: tipo === 'admin' ? 'administrador' : tipo,
        estado: String(u.estado ?? '').toLowerCase(),
        registro: String(u.registro).slice(0, 10), // aaaa-mm-dd
    };
};

export async function listarUsuarios() {
    const datos = await pedir('/admin/usuarios');
    return (datos ?? []).map(aUsuarioTabla);
}

// datos: { rut, nombre, correo, clave, fechaNacimiento (aaaa-mm-dd), tipo }
export async function crearUsuario(datos) {
    const creado = await pedir('/admin/usuarios', {
        method: 'POST',
        body: {
            rut: datos.rut,
            nombre: datos.nombre,
            correo: datos.correo,
            clave: datos.clave,
            fechanacimiento: datos.fechaNacimiento,
            tipousuario: datos.tipo,
        },
    });
    return aUsuarioTabla(creado);
}

export async function eliminarUsuario(rut) {
    await pedir(`/admin/usuarios/${encodeURIComponent(rut)}`, { method: 'DELETE' });
}

// ---------- Ventas / transacciones (AdminController: /admin/ventas) ----------

// La BD guarda el estado como texto libre ("Completada", "Anulado", "Pendiente"...).
// Se agrupa en tres tipos para poder contar y pintar cada estado.
const tipoEstadoVenta = (estado) => {
    const e = String(estado ?? '').trim().toLowerCase();
    if (['completada', 'entregado', 'entregada'].includes(e)) return 'completada';
    if (['anulado', 'anulada', 'cancelado', 'cancelada'].includes(e)) return 'anulada';
    return 'pendiente';
};

const aTransaccion = (v) => ({
    id: v.id,
    codigo: `VEN-${String(v.id).padStart(4, '0')}`,
    fecha: v.fecha ?? null,
    estado: String(v.estado ?? '').trim(),
    tipoEstado: tipoEstadoVenta(v.estado),
    neto: Number(v.neto) || 0,
    total: Number(v.total) || 0,
    requiereDespacho: Boolean(v.requiere_despacho),
    nota: v.nota ?? '',
    cliente: v.cliente ?? '',
    rutCliente: v.rut_cliente ?? '',
    vendedor: v.vendedor ?? '',
    rutVendedor: v.rut_vendedor ?? '',
    items: (v.items ?? []).map((i) => ({
        tipo: i.tipo,
        nombre: i.nombre,
        cantidad: Number(i.cantidad) || 0,
        subtotal: Number(i.subtotal) || 0,
    })),
});

// Todas las ventas de la plataforma (solo administrador)
export async function listarVentas() {
    const datos = await pedir('/admin/ventas');
    return (datos ?? []).map(aTransaccion);
}

// ---------- Estadísticas ----------

export async function obtenerEstadisticasAdmin() {
    return ESTADISTICAS_EJEMPLO;
}
