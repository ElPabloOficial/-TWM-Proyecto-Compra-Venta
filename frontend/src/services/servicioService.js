import { pedir, hoyLocal, leerJson } from './apiClient';
import { calcularEstadoOferta } from './productService';

export { calcularEstadoOferta };

export const MAX_MINUTOS = 23 * 60 + 59; // máx. 23:59 (TIME)

const dos = (n) => String(n).padStart(2, '0');

const minutosAHora = (minutos) => `${dos(Math.floor(minutos / 60))}:${dos(minutos % 60)}:00`;
const horaAMinutos = (hora) => {
    const [h = 0, m = 0] = String(hora ?? '').split(':').map(Number);
    return h * 60 + m;
};

const adaptarServicio = (s) => {
    const c = leerJson(s.caracteristicas);
    const hayOferta = s.id_oferta != null && s.ofertaactiva === true && s.preciooferta != null;

    return {
        id: s.id,
        codigo: c.codigo ?? '',
        nombre: s.nombre,
        descripcion: c.descripcion ?? '',
        categoriaId: s.categorias?.[0] ?? '',
        modalidad: c.modalidad ?? '',
        duracion: horaAMinutos(s.duracion),
        precio: Number(s.precio ?? 0),
        restriccionEdad: Boolean(s.restriccionedad),
        oferta: hayOferta ? Math.round(s.preciooferta * 100) : 0,
        ofertaInicio: hayOferta ? s.fechainicio ?? '' : '',
        ofertaFin: hayOferta ? s.fechafin ?? '' : '',
        idOferta: hayOferta ? s.id_oferta : null,
        _caracteristicas: c,
    };
};

export async function listarMisServicios() {
    const datos = await pedir('/servicios/mis-servicios');
    return (datos ?? []).map(adaptarServicio);
}

const armarServicio = (datos) => ({
    nombre: datos.nombre,
    restriccionedad: Boolean(datos.restriccionEdad),
    duracion: minutosAHora(datos.duracion),
    caracteristicas: {
        ...(datos._caracteristicas ?? {}),
        codigo: datos.codigo,
        descripcion: datos.descripcion,
        modalidad: datos.modalidad,
    },
    id_categoria: Number(datos.categoriaId),
    precio: Math.round(datos.precio),
});
function validarServicio(datos) {
    if (!Number.isInteger(datos.duracion) || datos.duracion <= 0 || datos.duracion > MAX_MINUTOS) {
        throw new Error(`La duración debe ser un número entero de minutos entre 1 y ${MAX_MINUTOS}.`);
    }
    if (!(datos.oferta > 0)) return;
    if (datos.oferta >= 100) {
        throw new Error('La oferta debe ser menor a 100 %.');
    }
    if (datos.ofertaFin <= datos.ofertaInicio) {
        // chk_fechas_servicio (inicio < fin)
        throw new Error('La fecha de término debe ser posterior a la de inicio.');
    }
    if (datos.ofertaInicio > hoyLocal()) {
        // chk_servicio_fecha_inicio (inicio <= hoy)
        throw new Error('Por ahora la oferta no puede empezar en una fecha futura: usa la fecha de hoy o una anterior.');
    }
}
async function sincronizarOferta(datos, original) {
    const cambio =
        !original ||
        original.oferta !== datos.oferta ||
        original.ofertaInicio !== datos.ofertaInicio ||
        original.ofertaFin !== datos.ofertaFin;
    if (!cambio) return;
    if (original?.idOferta) {
        await pedir(`/ofertas/${original.idOferta}`, { method: 'DELETE' });
    }
    if (datos.oferta > 0) {
        await pedir('/ofertas', {
            method: 'POST',
            body: {
                preciooferta: Math.round(datos.oferta) / 100,
                estado: true,
                id_servicio: datos.id,
                fechainicio: datos.ofertaInicio,
                fechafin: datos.ofertaFin,
            },
        });
    }
}

export async function crearServicio(datos) {
    validarServicio(datos);

    const creado = await pedir('/servicios', { method: 'POST', body: armarServicio(datos) });

    try {
        await sincronizarOferta({ ...datos, id: creado.id }, null);
    } catch (e) {
        throw new Error(`El servicio se creó, pero no se pudo guardar la oferta: ${e.message}`);
    }
    return creado.id;
}

export async function actualizarServicio(datos, original) {
    validarServicio(datos);

    await pedir(`/servicios/${datos.id}`, { method: 'PUT', body: armarServicio(datos) });
    await sincronizarOferta(datos, original);
}

export async function eliminarServicio(id) {
    await pedir(`/servicios/${id}`, { method: 'DELETE' });
}
