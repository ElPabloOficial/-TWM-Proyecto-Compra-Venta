import { pedir } from './apiClient';

// Mensajería privada (una conversación por venta) y preguntas públicas del usuario.
// Todas las llamadas usan el token de la sesión (pedir lo agrega solo).
export const messageService = {
    // GET /mensajes/mias?rol=cliente -> [{ id_venta, contraparte, asunto, fecha, mensajes: [{ id, autor, texto, fecha, leido }] }]
    obtenerConversaciones: async (rol = 'cliente') => {
        const datos = await pedir(`/mensajes/mias?rol=${rol}`);
        return (datos ?? []).map((c) => ({
            id: c.id_venta,
            contraparte: c.contraparte,
            asunto: c.asunto,
            fecha: c.fecha ?? undefined,
            // La BD guarda solo la fecha del mensaje (no la hora)
            mensajes: (c.mensajes ?? []).map((m) => ({ ...m, hora: '' })),
        }));
    },

    // POST /mensajes -> { id } del mensaje creado
    enviarMensaje: (idVenta, contenido) =>
        pedir('/mensajes', { method: 'POST', body: { id_venta: idVenta, contenido } }),

    // PUT /mensajes/venta/{id}/leer
    marcarLeida: (idVenta) => pedir(`/mensajes/venta/${idVenta}/leer`, { method: 'PUT' }),

    // GET /preguntas/vendedor -> preguntas de los productos y servicios del vendedor (con el nombre de quien preguntó)
    obtenerPreguntasVendedor: async () => {
        const datos = await pedir('/preguntas/vendedor');
        return (datos ?? []).map((p) => ({
            id: p.id,
            tipo: p.tipo,
            producto: p.item,
            productoId: p.id_item,
            persona: p.persona,
            texto: p.pregunta,
            fecha: p.fecha,
            respuesta: p.respuesta ? { texto: p.respuesta, fecha: p.fecha_respuesta ?? p.fecha } : null,
        }));
    },

    // PUT /preguntas/responder (una pregunta se responde una sola vez)
    responderPregunta: (idPregunta, respuesta) =>
        pedir('/preguntas/responder', { method: 'PUT', body: { id_pregunta: idPregunta, respuesta } }),

    // GET /preguntas/mias -> preguntas con la forma que usa QuestionsPanel
    obtenerMisPreguntas: async () => {
        const datos = await pedir('/preguntas/mias');
        return (datos ?? []).map((p) => ({
            id: `${p.tipo}-${p.id}`,
            tipo: p.tipo,
            producto: p.item,
            productoId: p.id_item,
            texto: p.pregunta,
            fecha: p.fecha,
            respuesta: p.respuesta ? { texto: p.respuesta, fecha: p.fecha_respuesta ?? p.fecha } : null,
        }));
    },
};
