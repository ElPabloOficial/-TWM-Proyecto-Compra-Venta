// src/services/adminService.js
//
// Servicios del panel de administración: usuarios, ventas y estadísticas (todos con la API real).

import { pedir } from './apiClient';

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

// ---------- Ficha completa de un usuario (AdminController: /admin/usuarios/{rut}) ----------

// Años cumplidos a partir de una fecha "YYYY-MM-DD"
const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const [anio, mes, dia] = String(fechaNacimiento).slice(0, 10).split('-').map(Number);
    const hoy = new Date();
    let edad = hoy.getFullYear() - anio;
    if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad -= 1;
    return edad;
};

// Compras o ventas del usuario: totales y las más recientes
const aResumenVentas = (r) => ({
    cantidad: r?.cantidad ?? 0,
    monto: r?.monto ?? 0,
    enProceso: r?.en_proceso ?? 0,
    porDespachar: r?.por_despachar ?? 0,
    ultima: r?.ultima ?? null,
    recientes: (r?.recientes ?? []).map((v) => ({
        id: v.id,
        codigo: `VEN-${String(v.id).padStart(4, '0')}`,
        fecha: v.fecha ?? null,
        estado: String(v.estado ?? '').trim(),
        tipoEstado: v.tipo_estado, // "completada" | "anulada" | "pendiente"
        total: v.total ?? 0,
        contraparte: v.contraparte ?? '',
    })),
});

export async function obtenerUsuarioDetalle(rut) {
    const d = await pedir(`/admin/usuarios/${encodeURIComponent(rut)}`);

    return {
        rut: d.rut,
        nombre: d.nombre,
        tipo: d.tipo,
        fechaNacimiento: d.fechanacimiento ?? null,
        edad: calcularEdad(d.fechanacimiento),
        registro: d.registro ?? null,
        sesionIniciada: Boolean(d.sesion_iniciada),
        correos: d.correos ?? [],
        telefonos: d.telefonos ?? [],
        direcciones: (d.direcciones ?? []).map((x) => ({
            id: x.id,
            texto: [`${x.calle} ${x.numero}`, x.pasaje, x.sector].filter(Boolean).join(', '),
            lugar: [x.comuna, x.region].filter(Boolean).join(', '),
        })),
        empresas: (d.empresas ?? []).map((e) => ({
            rut: e.rut,
            nombre: e.nombre,
            giro: e.giro ?? '',
            paginaWeb: e.paginaweb ?? '',
        })),
        compras: aResumenVentas(d.compras),
        ventas: aResumenVentas(d.ventas),
        actividad: {
            cotizaciones: d.actividad?.cotizaciones ?? 0,
            devoluciones: d.actividad?.devoluciones ?? 0,
            resenias: d.actividad?.resenias ?? 0,
            preguntas: d.actividad?.preguntas ?? 0,
            favoritos: d.actividad?.favoritos ?? 0,
        },
        publicaciones: {
            productos: d.publicaciones?.productos ?? 0,
            servicios: d.publicaciones?.servicios ?? 0,
        },
    };
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

// ---------- Moderación de mensajes y reseñas (AdminController: /admin/moderacion) ----------

// En la URL el tipo va sin tilde: "mensaje" o "resena"
const tipoUrl = (tipo) => (tipo === 'Reseña' ? 'resena' : 'mensaje');

// Mensajes y reseñas pueden tener el mismo id, por eso la clave incluye el tipo
const aContenidoModeracion = (c) => ({
    clave: `${c.tipo}-${c.id}`,
    id: c.id,
    tipo: c.tipo, // "Mensaje" | "Reseña"
    cliente: c.cliente,
    mensaje: c.contenido ?? '',
    fecha: String(c.fecha).slice(0, 10),
    detalle: c.detalle ?? '',
    palabras: c.palabras ?? [], // palabras ofensivas detectadas en el texto
});

// Solo llegan los mensajes y reseñas que contienen palabras ofensivas (lista en el backend).
// "revisados" es el total de mensajes y reseñas que se analizaron.
export async function listarContenidoModeracion() {
    const datos = await pedir('/admin/moderacion');
    return {
        revisados: datos?.revisados ?? 0,
        items: (datos?.items ?? []).map(aContenidoModeracion),
    };
}

// Borra el mensaje o la reseña de forma definitiva
export async function eliminarContenido(contenido) {
    await pedir(`/admin/moderacion/${tipoUrl(contenido.tipo)}/${contenido.id}`, { method: 'DELETE' });
}

// ---------- Estadísticas (ReportesController: /reportes/...) ----------

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_EN_GRAFICO = 6;

// La API devuelve solo los meses que tuvieron ventas, ordenados. Aquí se toman los últimos
// 6 meses (terminando en el último con ventas) y los meses sin ventas se rellenan con 0,
// para que el gráfico no una dos meses que no son consecutivos.
const aIngresosMensuales = (filas) => {
    if (!filas.length) return [];
    const ultimo = filas[filas.length - 1];
    const montoPorMes = new Map(filas.map((f) => [f.anio * 12 + (f.mes - 1), Number(f.total) || 0]));
    const fin = ultimo.anio * 12 + (ultimo.mes - 1);

    const meses = [];
    for (let i = MESES_EN_GRAFICO - 1; i >= 0; i--) {
        const indice = fin - i;
        meses.push({ anio: Math.floor(indice / 12), mes: (indice % 12) + 1, monto: Math.round(montoPorMes.get(indice) ?? 0) });
    }
    // Si los meses cruzan de un año a otro, se agrega el año a la etiqueta ("Dic 24")
    const variosAnios = meses[0].anio !== meses[meses.length - 1].anio;
    return meses.map((m) => ({
        mes: variosAnios ? `${MESES[m.mes - 1]} ${String(m.anio).slice(2)}` : MESES[m.mes - 1],
        monto: m.monto,
    }));
};

export async function obtenerEstadisticasAdmin() {
    const [dashboard, ingresos, envios, alertas] = await Promise.all([
        pedir('/reportes/dashboard'),
        pedir('/reportes/ingresos-mensuales'),
        pedir('/reportes/envios-por-empresa'),
        pedir('/reportes/alertas'),
    ]);

    return {
        ingresosMes: Math.round(Number(dashboard?.ingresos_mes) || 0),
        ingresosMensuales: aIngresosMensuales(ingresos ?? []),
        ventasCompletadas: Number(dashboard?.ventas_completadas) || 0,
        tiempoEntregaDias: Number(dashboard?.tiempo_entrega_promedio) || 0,
        calificacionPromedio: Number(dashboard?.calificacion_promedio) || 0,
        enviosPorEmpresa: (envios ?? []).map((e) => ({ empresa: e.empresa, cantidad: Number(e.cantidad) || 0 })),
        calidad: {
            preguntasSinResponder48h: Number(alertas?.preguntas_sin_responder) || 0,
            resenasNuevasSemana: Number(alertas?.resenas_nuevas_semana) || 0,
            tasaDevoluciones: Number(alertas?.tasa_devoluciones) || 0,
            emprendedoresBajo3: Number(alertas?.emprendedores_baja_calificacion) || 0,
        },
    };
}
