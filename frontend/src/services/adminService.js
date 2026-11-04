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

// ---------- Estadísticas ----------

export async function obtenerEstadisticasAdmin() {
    return ESTADISTICAS_EJEMPLO;
}
