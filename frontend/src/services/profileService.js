import { pedir } from './apiClient';
import { authService } from './authService';

// "987654321" -> "+56 9 8765 4321"
const formatearTelefono = (numero) => {
    const d = String(numero ?? '').replace(/\D/g, '');
    return d.length === 9 ? `+56 ${d[0]} ${d.slice(1, 5)} ${d.slice(5)}` : d;
};

// Convierte la respuesta de la API al formato que usa ProfileConfigCard.
// El rol dual de la base de datos ("ambos") se trata como "vendedor", igual que en authService.
const adaptarPerfil = (p) => ({
    name: p.nombre ?? '',
    rut: p.rut ?? '',
    role: p.tipousuario === 'ambos' ? 'vendedor' : p.tipousuario,
    telefonos: (p.telefonos ?? []).map(formatearTelefono),
    correo: p.correo ?? '',
    fechaNacimiento: p.fechanacimiento ? String(p.fechanacimiento).slice(0, 10) : '',
    rutEmpresa: p.empresa?.rut ?? '',
    nombreEmpresa: p.empresa?.nombre ?? '',
    giroComercial: p.empresa?.giro ?? '',
    paginaWeb: p.empresa?.paginaweb ?? '',
    direccionLocal: p.empresa?.direccionlocal ?? '',
    tieneEmpresa: Boolean(p.empresa),
    calle: p.direccion?.calle ?? '',
    numero: p.direccion?.numero != null ? String(p.direccion.numero) : '',
    pasaje: p.direccion?.pasaje ?? '',
    descripcion: p.direccion?.descripcion ?? '',
    sector: p.direccion?.sector ?? '',
    idComuna: p.direccion?.id_comuna ?? '',
});

export async function obtenerPerfil() {
    return adaptarPerfil(await pedir('/perfil'));
}

export async function listarComunas() {
    return (await pedir('/comunas')) ?? [];
}

// "esVendedor" decide si se mandan los datos de empresa (un cliente no tiene empresa)
export async function guardarPerfil(form, esVendedor) {
    const datos = await pedir('/perfil', {
        method: 'PUT',
        body: {
            nombre: form.nombre,
            fechanacimiento: form.fechaNacimiento || null,
            correo: form.correo,
            telefonos: form.telefonos,
            direccion: {
                calle: form.calle,
                numero: form.numero === '' ? null : Number(form.numero),
                pasaje: form.pasaje,
                descripcion: form.descripcion,
                sector: form.sector,
                id_comuna: form.idComuna === '' ? null : Number(form.idComuna),
            },
            empresa: esVendedor
                ? {
                      rut: form.rutEmpresa,
                      nombre: form.nombreEmpresa,
                      giro: form.giroComercial,
                      paginaweb: form.paginaWeb,
                  }
                : null,
        },
    });
    return adaptarPerfil(datos);
}

// Convierte una cuenta de cliente en vendedor (PUT /perfil/vendedor). La API crea la empresa,
// cambia el tipo de cuenta y entrega un token nuevo con el rol de vendedor.
export async function convertirEnVendedor(empresa) {
    const datos = await pedir('/perfil/vendedor', {
        method: 'PUT',
        body: {
            rut: empresa.rut,
            nombre: empresa.nombre,
            giro: empresa.giro,
            paginaweb: empresa.paginaWeb,
        },
    });
    authService.setToken(datos.token);
    authService.actualizarUsuario({ role: 'vendedor', tipousuario: 'vendedor' });
    return adaptarPerfil(datos.perfil);
}

export async function cambiarClave({ claveActual, claveNueva }) {
    await pedir('/perfil/clave', { method: 'PUT', body: { claveActual, claveNueva } });
}