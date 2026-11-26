import { pedir } from './apiClient';

// Empresas de despacho y sus límites volumétricos (tabla EmpresaDespacho).
// Solo el administrador puede usar estas llamadas.

// De la API a la pantalla
const adaptarEmpresa = (e) => ({
    id: e.id,
    nombre: e.nombre,
    alto: e.alto_max_cm,
    ancho: e.ancho_max_cm,
    fondo: e.fondo_max_cm,
    peso: e.peso_max_g, // en gramos, igual que el peso de los productos
    volumen: e.volumen_max_cm3, // alto × ancho × fondo (lo calcula la API)
    despachos: e.despachos ?? 0,
    // Tarifa del envío (se guarda en el mismo JSON de la empresa)
    divisor: e.divisor_volumetrico, // cm³ por kg volumétrico
    tarifaKg: e.tarifa_por_kg, // pesos por kg cobrado
    tarifaMinima: e.tarifa_minima, // pesos, precio mínimo de un envío
    dias: e.dias_entrega, // plazo estimado en días
});

// De la pantalla a la API (el volumen no se envía: lo calcula el backend)
const armarEmpresa = (d) => ({
    nombre: d.nombre,
    alto_max_cm: Number(d.alto),
    ancho_max_cm: Number(d.ancho),
    fondo_max_cm: Number(d.fondo),
    peso_max_g: Number(d.peso),
    divisor_volumetrico: Number(d.divisor),
    tarifa_por_kg: Number(d.tarifaKg),
    tarifa_minima: Number(d.tarifaMinima),
    dias_entrega: Number(d.dias),
});

export const shippingService = {
    // GET /empresas-despacho
    listarEmpresas: async () => ((await pedir('/empresas-despacho')) ?? []).map(adaptarEmpresa),

    // POST /empresas-despacho
    crearEmpresa: (datos) => pedir('/empresas-despacho', { method: 'POST', body: armarEmpresa(datos) }),

    // PUT /empresas-despacho/{id}
    actualizarEmpresa: (datos) => pedir(`/empresas-despacho/${datos.id}`, { method: 'PUT', body: armarEmpresa(datos) }),

    // DELETE /empresas-despacho/{id} (la API la rechaza si la empresa ya tiene despachos)
    eliminarEmpresa: (id) => pedir(`/empresas-despacho/${id}`, { method: 'DELETE' }),
};
