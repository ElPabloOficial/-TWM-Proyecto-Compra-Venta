// src/services/boletaPdf.js
//
// Genera la boleta de venta (comprobante) en PDF, en el navegador, a partir del detalle de una
// venta que entrega la API (GET /ventas/{id}). Incluye lo que pide el enunciado: fecha de la
// transacción, lista de artículos, valor neto sin IVA, IVA (19 %), total cobrado y medio de pago
// (últimos 4 dígitos de la tarjeta o código de transferencia).

import { jsPDF } from 'jspdf';

const pesos = (n) => `$${Math.round(Number(n) || 0).toLocaleString('es-CL')}`;

const fechaLarga = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
        : '-';

const hora = (iso) =>
    iso ? new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

// Medio de pago tal como se escribe en la boleta, p. ej. "Tarjeta de crédito (terminada en 4521)"
const textoPago = (pago) => {
    if (!pago?.medio) return 'No registrado';
    if (pago.ult4digitos) return `${pago.medio} (terminada en ${pago.ult4digitos})`;
    if (pago.codigoTransferencia) return `${pago.medio} (código ${pago.codigoTransferencia})`;
    return pago.medio;
};

// Pasa la respuesta de la API (snake_case) al formato que usan la pantalla de la boleta y el PDF.
export function adaptarBoleta(v) {
    const total = Math.round(Number(v.total) || 0);
    const neto = Math.round(Number(v.neto) || 0);

    const items = [
        ...(v.productos ?? []).map((p) => ({ tipo: 'producto', ...p })),
        ...(v.servicios ?? []).map((s) => ({ tipo: 'servicio', ...s })),
    ].map((i) => ({
        tipo: i.tipo,
        nombre: i.nombre ?? '',
        cantidad: Number(i.cantidad) || 0,
        precioUnitario: Number(i.precio_unitario) || 0,
        subtotal: Number(i.subtotal) || 0,
    }));

    return {
        id: v.id_venta,
        numero: String(v.id_venta).padStart(6, '0'),
        fecha: v.fecha ?? null,
        estado: v.estado ?? '',
        requiereDespacho: Boolean(v.requiere_despacho),
        cliente: { rut: v.cliente?.rut ?? '', nombre: v.cliente?.nombre ?? '' },
        vendedor: { rut: v.vendedor?.rut ?? '', nombre: v.vendedor?.nombre ?? '' },
        items,
        neto,
        ivaPorcentaje: Math.round((Number(v.iva) || 0) * 100),
        iva: total - neto,
        total,
        pago: {
            // "metodo_pago" es el campo antiguo; "pago" trae además los últimos 4 dígitos o el código
            medio: v.pago?.medio ?? v.metodo_pago ?? '',
            ult4digitos: v.pago?.ult4digitos ?? null,
            codigoTransferencia: v.pago?.codigo_transferencia ?? null,
        },
    };
}

// ---------- Armado del PDF (A4 vertical, medidas en mm) ----------

const MARGEN = 18;
const ANCHO = 210;
const DERECHA = ANCHO - MARGEN; // borde derecho del contenido
const FONDO_PAGINA = 275; // más abajo de esto se pasa a otra página
const ROJO = [236, 51, 51];
const GRIS_TEXTO = [110, 110, 110];

const COL_PRECIO = 142; // las columnas numéricas se alinean a la derecha de estas posiciones
const COL_CANT = 160;
const COL_SUBTOTAL = DERECHA;

function dibujarEncabezadoTabla(doc, y) {
    doc.setFillColor(243, 244, 246);
    doc.rect(MARGEN, y, DERECHA - MARGEN, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text('Producto / Servicio', MARGEN + 2, y + 5.4);
    doc.text('Precio unit.', COL_PRECIO, y + 5.4, { align: 'right' });
    doc.text('Cant.', COL_CANT, y + 5.4, { align: 'right' });
    doc.text('Subtotal', COL_SUBTOTAL - 2, y + 5.4, { align: 'right' });
    return y + 8;
}

export function crearBoletaPdf(b) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // ---------- Título ----------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...ROJO);
    doc.text('BOLETA DE VENTA', MARGEN, 24);

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`N° ${b.numero}`, DERECHA, 24, { align: 'right' });

    doc.setDrawColor(...ROJO);
    doc.setLineWidth(0.6);
    doc.line(MARGEN, 28, DERECHA, 28);

    // ---------- Datos de la venta, vendedor y cliente ----------
    const bloque = (titulo, lineas, x, y, ancho) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...GRIS_TEXTO);
        doc.text(titulo.toUpperCase(), x, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        let yy = y + 5.5;
        lineas.forEach((linea) => {
            doc.splitTextToSize(linea, ancho).forEach((parte) => {
                doc.text(parte, x, yy);
                yy += 5;
            });
        });
        return yy;
    };

    const horaTexto = hora(b.fecha);
    const finIzq = bloque(
        'Datos de la venta',
        [
            `Fecha de emisión: ${fechaLarga(b.fecha)}${horaTexto ? `, ${horaTexto} h` : ''}`,
            `Estado: ${b.estado || '-'}`,
            `Medio de pago: ${textoPago(b.pago)}`,
            `Despacho: ${b.requiereDespacho ? 'Con despacho' : 'Sin despacho'}`,
        ],
        MARGEN,
        37,
        88
    );
    const finDer1 = bloque('Vendedor', [b.vendedor.nombre || '-', `RUT: ${b.vendedor.rut || '-'}`], 115, 37, DERECHA - 115);
    const finDer2 = bloque('Cliente', [b.cliente.nombre || '-', `RUT: ${b.cliente.rut || '-'}`], 115, finDer1 + 3, DERECHA - 115);

    let y = Math.max(finIzq, finDer2) + 6;

    // ---------- Detalle ----------
    y = dibujarEncabezadoTabla(doc, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    if (b.items.length === 0) {
        doc.setTextColor(...GRIS_TEXTO);
        doc.text('Esta venta no tiene artículos asociados.', MARGEN + 2, y + 7);
        y += 11;
    }

    b.items.forEach((item) => {
        const nombre = item.tipo === 'servicio' ? `${item.nombre} (servicio)` : item.nombre;
        const lineas = doc.splitTextToSize(nombre, 88);
        const alto = lineas.length * 4.8 + 4;

        if (y + alto > FONDO_PAGINA) {
            doc.addPage();
            y = dibujarEncabezadoTabla(doc, 20);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
        }

        doc.setTextColor(30, 30, 30);
        doc.text(lineas, MARGEN + 2, y + 5);
        doc.text(pesos(item.precioUnitario), COL_PRECIO, y + 5, { align: 'right' });
        doc.text(String(item.cantidad), COL_CANT, y + 5, { align: 'right' });
        doc.text(pesos(item.subtotal), COL_SUBTOTAL - 2, y + 5, { align: 'right' });

        y += alto;
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.2);
        doc.line(MARGEN, y, DERECHA, y);
    });

    // ---------- Totales ----------
    if (y + 34 > FONDO_PAGINA) {
        doc.addPage();
        y = 20;
    }
    y += 8;

    const fila = (etiqueta, valor, negrita = false) => {
        doc.setFont('helvetica', negrita ? 'bold' : 'normal');
        doc.setFontSize(negrita ? 12 : 10);
        doc.setTextColor(30, 30, 30);
        doc.text(etiqueta, 130, y);
        doc.text(valor, COL_SUBTOTAL - 2, y, { align: 'right' });
        y += negrita ? 7 : 6;
    };

    fila('Valor neto (sin IVA)', pesos(b.neto));
    fila(`IVA (${b.ivaPorcentaje}%)`, pesos(b.iva));
    doc.setDrawColor(...ROJO);
    doc.setLineWidth(0.5);
    doc.line(130, y - 3.5, COL_SUBTOTAL, y - 3.5);
    y += 1.5;
    fila('TOTAL', pesos(b.total), true);

    // ---------- Pie de cada página ----------
    const paginas = doc.getNumberOfPages();
    const generado = new Date().toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
    for (let i = 1; i <= paginas; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...GRIS_TEXTO);
        doc.text(`Documento generado el ${generado}`, MARGEN, 287);
        doc.text(`Página ${i} de ${paginas}`, DERECHA, 287, { align: 'right' });
    }

    return doc;
}

// Descarga la boleta como archivo PDF ("boleta-000123.pdf")
export function descargarBoletaPdf(boleta) {
    crearBoletaPdf(boleta).save(`boleta-${boleta.numero}.pdf`);
}
