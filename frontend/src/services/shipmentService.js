// src/services/shipmentService.js
//
// Despachos (envíos) de las ventas. Los estados son los de la tabla Despacho de la BD:
// 'En Preparación' -> 'Despachado' -> 'En reparto' -> 'Entregado'.
//
// TEMPORAL: la API todavía no tiene un endpoint que liste los despachos del vendedor ni uno que
// cambie el estado (solo existe GET /despachos/venta/{id}). Mientras tanto se usan datos de ejemplo
// en memoria, con la misma forma que devolvería la API, y se pierden al recargar la página.
// El costo de envío no existe hasta que el vendedor despacha: la BD lo calcula con las medidas del
// paquete (DatosLogisticos.costo_envio). Al crear los endpoints, solo hay que cambiar estas tres funciones:
//   listarDespachosVendedor  -> GET  /despachos/mis-despachos
//   obtenerDespacho          -> GET  /despachos/venta/{idVenta}
//   avanzarDespacho          -> PUT  /despachos/{id}/estado

export const ETAPAS_DESPACHO = ['En Preparación', 'Despachado', 'En reparto', 'Entregado'];

// Cómo se muestra cada estado (el de la BD es 'En Preparación', con mayúscula)
export const ETIQUETA_ESTADO = {
    'En Preparación': 'En preparación',
    Despachado: 'Despachado',
    'En reparto': 'En reparto',
    Entregado: 'Entregado',
};

export const TRANSPORTISTAS = ['Chilexpress', 'Starken', 'Correos de Chile', 'Otros'];

// Mismo cálculo que el trigger "calculo_costo_envio_proyectado" de la BD: el costo de envío sale del
// volumen del paquete que indica el vendedor al despachar (ancho × alto × fondo, en cm).
export const calcularCostoEnvio = ({ ancho, alto, fondo }) =>
    Math.round(((Number(ancho) * Number(alto) * Number(fondo)) / 5000) * 1555);

const aFecha = (offsetDias) => new Date(Date.now() + offsetDias * 86400000).toLocaleDateString('sv-SE'); // aaaa-mm-dd

const aFechaHora = (offsetDias, hora) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDias);
    const [h, m] = hora.split(':');
    d.setHours(Number(h), Number(m), 0, 0);
    return d.toISOString();
};

const textoEvento = (estado, transportista) => {
    switch (estado) {
        case 'En Preparación':
            return 'El vendedor está preparando tu pedido.';
        case 'Despachado':
            return `Tu pedido salió del vendedor${transportista ? ` con ${transportista}` : ''}.`;
        case 'En reparto':
            return 'Tu pedido está en reparto, pronto llegará a tu dirección.';
        default:
            return 'Tu pedido fue entregado.';
    }
};

// Eventos (del más reciente al más antiguo) hasta llegar al estado actual
const eventosHasta = (estado, transportista, fechas) =>
    ETAPAS_DESPACHO.slice(0, ETAPAS_DESPACHO.indexOf(estado) + 1)
        .map((e, i) => ({ estado: e, fecha: fechas[i], detalle: textoEvento(e, transportista) }))
        .reverse();

const almacen = [
    {
        idVenta: 1006,
        estado: 'En reparto',
        cliente: 'Francisca Soto',
        direccion: { calle: 'Bilbao', numero: '320', comuna: 'Puerto Montt' },
        transportista: 'Chilexpress',
        seguimiento: 'CH-4821763',
        paquete: { ancho: 32, alto: 25, fondo: 15 },
        costoEnvio: 3732,
        fechaEstimada: aFecha(0),
        productos: [
            { nombre: 'Teclado mecánico RGB', cantidad: 1 },
            { nombre: 'Mouse ergonómico', cantidad: 1 },
        ],
        eventos: eventosHasta('En reparto', 'Chilexpress', [
            aFechaHora(-2, '11:05'),
            aFechaHora(-1, '17:20'),
            aFechaHora(0, '08:40'),
        ]),
    },
    {
        idVenta: 1002,
        estado: 'Despachado',
        cliente: 'Sofía Contreras',
        direccion: { calle: 'Errázuriz', numero: '640', comuna: 'Valdivia' },
        transportista: 'Starken',
        seguimiento: 'ST-3390412',
        paquete: { ancho: 20, alto: 10, fondo: 10 },
        costoEnvio: 622,
        fechaEstimada: aFecha(2),
        productos: [{ nombre: 'Webcam HD', cantidad: 1 }],
        eventos: eventosHasta('Despachado', 'Starken', [aFechaHora(-1, '15:30'), aFechaHora(0, '09:10')]),
    },
    {
        idVenta: 1007,
        estado: 'En Preparación',
        cliente: 'Matías Pérez',
        direccion: { calle: 'Av. Buschmann', numero: '1450', comuna: 'Osorno' },
        transportista: null,
        seguimiento: null,
        paquete: null,
        costoEnvio: null,
        fechaEstimada: aFecha(4),
        productos: [
            { nombre: 'Monitor Ultra HD 32"', cantidad: 1 },
            { nombre: 'Soporte VESA', cantidad: 1 },
        ],
        eventos: eventosHasta('En Preparación', null, [aFechaHora(0, '10:15')]),
    },
    {
        idVenta: 1008,
        estado: 'En Preparación',
        cliente: 'Camila Rojas',
        direccion: { calle: 'Mackenna', numero: '850', comuna: 'Osorno' },
        transportista: null,
        seguimiento: null,
        paquete: null,
        costoEnvio: null,
        fechaEstimada: aFecha(5),
        productos: [{ nombre: 'Impresora láser color', cantidad: 1 }],
        eventos: eventosHasta('En Preparación', null, [aFechaHora(0, '12:40')]),
    },
    {
        idVenta: 1005,
        estado: 'Entregado',
        cliente: 'Diego Álvarez',
        direccion: { calle: 'Los Leones', numero: '1200', comuna: 'Providencia' },
        transportista: 'Chilexpress',
        seguimiento: 'CH-4790021',
        paquete: { ancho: 32, alto: 25, fondo: 15 },
        costoEnvio: 3732,
        fechaEstimada: aFecha(-3),
        productos: [{ nombre: 'Tóner negro', cantidad: 2 }],
        eventos: eventosHasta('Entregado', 'Chilexpress', [
            aFechaHora(-7, '10:00'),
            aFechaHora(-6, '16:45'),
            aFechaHora(-4, '09:30'),
            aFechaHora(-3, '13:12'),
        ]),
    },
];

const copia = (d) => JSON.parse(JSON.stringify(d));

// Si la compra no está entre los ejemplos (por ejemplo, una compra real del historial), se arma un
// despacho de ejemplo con un estado que depende del número de la venta, para poder ver la pantalla.
const buscar = (idVenta) => {
    let despacho = almacen.find((d) => d.idVenta === idVenta);
    if (!despacho) {
        const estado = ETAPAS_DESPACHO[Math.abs(idVenta) % ETAPAS_DESPACHO.length];
        const idx = ETAPAS_DESPACHO.indexOf(estado);
        const enviado = idx >= 1;
        despacho = {
            idVenta,
            estado,
            cliente: 'Tú',
            direccion: { calle: 'Tu dirección de despacho', numero: '', comuna: '' },
            transportista: enviado ? 'Chilexpress' : null,
            seguimiento: enviado ? `CH-${100000 + idVenta}` : null,
            paquete: enviado ? { ancho: 30, alto: 20, fondo: 10 } : null,
            costoEnvio: enviado ? calcularCostoEnvio({ ancho: 30, alto: 20, fondo: 10 }) : null,
            fechaEstimada: aFecha(estado === 'Entregado' ? -1 : 3 - idx),
            productos: [],
            eventos: eventosHasta(
                estado,
                enviado ? 'Chilexpress' : null,
                ETAPAS_DESPACHO.slice(0, idx + 1).map((_, i) => aFechaHora(i - idx - 1, '10:30'))
            ),
        };
        almacen.push(despacho);
    }
    return despacho;
};

export async function listarDespachosVendedor() {
    return copia(almacen);
}

export async function obtenerDespacho(idVenta) {
    return copia(buscar(Number(idVenta)));
}

// Pasa el despacho a la etapa siguiente. Para pasar a "Despachado" el vendedor indica la empresa de
// transporte y el número de seguimiento.
export async function avanzarDespacho(idVenta, { transportista, seguimiento, ancho, alto, fondo } = {}) {
    const despacho = buscar(Number(idVenta));
    const indice = ETAPAS_DESPACHO.indexOf(despacho.estado);

    if (indice === ETAPAS_DESPACHO.length - 1) {
        throw new Error('Este pedido ya fue entregado.');
    }

    const siguiente = ETAPAS_DESPACHO[indice + 1];

    if (siguiente === 'Despachado') {
        if (!transportista || !String(seguimiento ?? '').trim()) {
            throw new Error('Indica la empresa de transporte y el número de seguimiento.');
        }
        if (![ancho, alto, fondo].every((medida) => Number(medida) > 0)) {
            throw new Error('Indica el ancho, alto y fondo del paquete en centímetros.');
        }
        despacho.transportista = transportista;
        despacho.seguimiento = String(seguimiento).trim();
        despacho.paquete = { ancho: Number(ancho), alto: Number(alto), fondo: Number(fondo) };
        despacho.costoEnvio = calcularCostoEnvio(despacho.paquete); // en la BD lo calcula el trigger
        despacho.fechaEstimada = aFecha(3);
    }

    despacho.estado = siguiente;
    despacho.eventos = [
        { estado: siguiente, fecha: new Date().toISOString(), detalle: textoEvento(siguiente, despacho.transportista) },
        ...despacho.eventos,
    ];
    if (siguiente === 'Entregado') despacho.fechaEstimada = aFecha(0);

    return copia(despacho);
}
