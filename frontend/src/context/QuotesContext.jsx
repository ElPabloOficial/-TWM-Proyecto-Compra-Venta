import { useMemo, useState } from 'react';
import QuotesContext from './quotes-context';
import { authService } from '../services/authService';

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const sampleQuotes = [
  {
    id: '001',
    issueDate: dateOffset(-1),
    expirationDate: dateOffset(3),
    status: 'Respondida',
    client: { name: 'Camila Rojas', rut: '20.111.222-3' },
    seller: { name: 'Tech Solutions SpA', rut: '76.543.210-K' },
    items: [
      { name: 'Laptop Pro X', unitPrice: 899990, quantity: 1 },
      { name: 'Mouse Ergonómico', unitPrice: 45990, quantity: 2 },
      { name: 'Teclado Mecánico RGB', unitPrice: 79990, quantity: 1 },
    ],
  },
  {
    id: '002',
    issueDate: dateOffset(-3),
    expirationDate: dateOffset(4),
    status: 'Solicitada',
    client: { name: 'Matías Pérez', rut: '19.876.543-2' },
    seller: { name: 'Servicio Técnico Central', rut: '77.345.678-5' },
    items: [
      { name: 'Mantención de PC', unitPrice: 59990, quantity: 1 },
      { name: 'Diagnóstico de hardware', unitPrice: 29990, quantity: 1 },
    ],
  },
  {
    id: '003',
    issueDate: dateOffset(-7),
    expirationDate: dateOffset(2),
    status: 'Aceptada',
    client: { name: 'Francisca Soto', rut: '18.222.333-4' },
    seller: { name: 'Monitor Chile Ltda.', rut: '76.123.456-0' },
    items: [
      { name: 'Monitor Ultra HD 32"', unitPrice: 489990, quantity: 1 },
      { name: 'Soporte VESA', unitPrice: 69990, quantity: 1 },
    ],
  },
  {
    id: '004',
    issueDate: dateOffset(-12),
    expirationDate: dateOffset(-5),
    status: 'Expirada',
    client: { name: 'Diego Álvarez', rut: '17.333.444-5' },
    seller: { name: 'Impresoras del Sur', rut: '77.111.111-8' },
    items: [
      { name: 'Impresora Láser Color', unitPrice: 299990, quantity: 1 },
      { name: 'Tóner negro', unitPrice: 22500, quantity: 2 },
    ],
  },
  {
    id: '005',
    issueDate: dateOffset(-2),
    expirationDate: dateOffset(1),
    status: 'Respondida',
    client: { name: 'Valentina Muñoz', rut: '21.444.555-6' },
    seller: { name: 'Conecta Tecnología', rut: '76.987.654-3' },
    items: [
      { name: 'Webcam HD', unitPrice: 45990, quantity: 1 },
      { name: 'Micrófono USB Profesional', unitPrice: 79990, quantity: 1 },
    ],
  },
];

export function QuotesProvider({ children }) {
  const [quotes, setQuotes] = useState(sampleQuotes);

  const acceptQuote = (quoteId) => {
    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) =>
        quote.id === quoteId && quote.status === 'Respondida'
          ? { ...quote, status: 'Aceptada' }
          : quote,
      ),
    );
  };

  // TEMPORAL: con el backend esto pasa a ser POST /cotizaciones (queda "Solicitada" hasta que
  // un emprendedor responda). items: [{ name, unitPrice, quantity }]
  const addQuote = (items) => {
    const nextNumber = Math.max(0, ...quotes.map((quote) => Number(quote.id) || 0)) + 1;
    const newQuote = {
      id: String(nextNumber).padStart(3, '0'),
      issueDate: dateOffset(0),
      expirationDate: dateOffset(15), // valores vigentes por 15 días
      status: 'Solicitada',
      client: {
        name: authService.getCurrentUser()?.name ?? 'Cliente',
        rut: authService.getCurrentUser()?.rut ?? '—',
      },
      seller: { name: 'Por asignar', rut: '—' },
      items,
    };
    setQuotes((currentQuotes) => [newQuote, ...currentQuotes]);
    return newQuote;
  };

  // El vendedor responde una cotización "Solicitada": pone el precio de cada ítem y queda
  // "Respondida" por 15 días. TEMPORAL: con el backend es PUT /cotizaciones/{id}.
  // prices: precio unitario de cada ítem, en el mismo orden; note: mensaje opcional al cliente.
  const respondQuote = (quoteId, { prices, note }) => {
    const user = authService.getCurrentUser();
    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) =>
        quote.id === quoteId && quote.status === 'Solicitada'
          ? {
              ...quote,
              status: 'Respondida',
              expirationDate: dateOffset(15),
              note: note?.trim() || '',
              seller: { name: user?.name ?? 'Vendedor', rut: user?.rut ?? '—' },
              items: quote.items.map((item, index) => ({ ...item, unitPrice: prices[index] })),
            }
          : quote,
      ),
    );
  };

  const value = useMemo(
    () => ({ quotes, acceptQuote, addQuote, respondQuote }),
    [quotes],
  );

  return (
    <QuotesContext.Provider value={value}>
      {children}
    </QuotesContext.Provider>
  );
}
