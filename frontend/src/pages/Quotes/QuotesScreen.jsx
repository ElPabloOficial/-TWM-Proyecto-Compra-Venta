import { useState } from 'react';
import Button from '@mui/material/Button';
import SellerTemplate from '../../components/templates/SellerTemplate/SellerTemplate';
import StatCard from '../../components/molecules/StatCard/StatCard';
import QuoteResponseDialog from '../../components/organisms/QuoteResponseDialog/QuoteResponseDialog';
import useQuotes from '../../context/useQuotes';
import { useToast } from '../../context/ToastContext';
import '../../styles/Inventory.css';
import '../../styles/Quotes.css';

const QUOTES_PER_PAGE = 5;

const formatDate = (date) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const formatPrice = (amount) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

const getQuoteTotal = (quote) =>
  quote.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

const getRemainingDays = (expirationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(`${expirationDate}T00:00:00`);
  return Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));
};

// Una cotización vencida se muestra como "Expirada" aunque no se haya actualizado
const getStatus = (quote) =>
  quote.status !== 'Aceptada' && quote.status !== 'Expirada' && getRemainingDays(quote.expirationDate) < 0
    ? 'Expirada'
    : quote.status;

const getValidityLabel = (quote, status) => {
  if (status === 'Aceptada' || status === 'Expirada') return status;
  const days = getRemainingDays(quote.expirationDate);
  return `${days} ${days === 1 ? 'día restante' : 'días restantes'}`;
};

// Las que faltan por responder van primero
const STATUS_ORDER = { Solicitada: 0, Respondida: 1, Aceptada: 2, Expirada: 3 };

const QuotesScreen = () => {
  const { quotes, respondQuote } = useQuotes();
  const { mostrarToast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  // Cotizaciones que pidieron los clientes (vista del vendedor)
  const received = quotes
    .map((quote) => ({ ...quote, effectiveStatus: getStatus(quote) }))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.effectiveStatus] - STATUS_ORDER[b.effectiveStatus] ||
        b.issueDate.localeCompare(a.issueDate),
    );

  const count = (status) => received.filter((quote) => quote.effectiveStatus === status).length;
  const selected = received.find((quote) => quote.id === selectedId) ?? null;

  const pageCount = Math.max(1, Math.ceil(received.length / QUOTES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visibleQuotes = received.slice(
    (currentPage - 1) * QUOTES_PER_PAGE,
    currentPage * QUOTES_PER_PAGE,
  );

  const handleSend = (response) => {
    respondQuote(selected.id, response);
    setSelectedId(null);
    mostrarToast('Cotización respondida correctamente');
  };

  return (
    <SellerTemplate>
      {/* SellerTemplate ya incluye el Header y el menú lateral (botón ☰).
          Se usa <div> y no <main> porque la plantilla ya tiene un <main>. */}
      <div className="quotes-main">
        <div className="quotes-heading">
          <div>
            <h1>Cotizaciones recibidas</h1>
            <p>Responde las solicitudes de tus clientes: indica el precio de cada producto o servicio.</p>
          </div>
        </div>

        <div className="inv-stats">
          <StatCard titulo="Por responder" valor={count('Solicitada')} />
          <StatCard titulo="Respondidas" valor={count('Respondida')} />
          <StatCard titulo="Aceptadas" valor={count('Aceptada')} />
        </div>

        <section className="quotes-panel" aria-label="Cotizaciones recibidas">
          <div className="quotes-table-scroll">
            <table className="quotes-table">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos / Servicios</th>
                  <th>Valor total</th>
                  <th>Estado</th>
                  <th>Vigencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleQuotes.map((quote) => {
                  const status = quote.effectiveStatus;
                  const total = getQuoteTotal(quote);
                  return (
                    <tr key={quote.id}>
                      <td data-label="N.º">{quote.id}</td>
                      <td data-label="Fecha">{formatDate(quote.issueDate)}</td>
                      <td data-label="Cliente">{quote.client?.name ?? '—'}</td>
                      <td data-label="Productos / Servicios">
                        {quote.items.map((item) => item.name).join(', ')}
                      </td>
                      <td data-label="Valor total" className="quotes-total">
                        {total > 0 ? formatPrice(total) : 'Por cotizar'}
                      </td>
                      <td data-label="Estado">
                        <span className={`quote-status quote-status-${status.toLowerCase()}`}>
                          {status === 'Solicitada' ? 'Por responder' : status === 'Aceptada' ? 'Aceptada por el cliente' : status}
                        </span>
                      </td>
                      <td data-label="Vigencia">{getValidityLabel(quote, status)}</td>
                      <td data-label="Acciones">
                        {status === 'Solicitada' ? (
                          <Button
                            size="small"
                            variant="contained"
                            disableElevation
                            className="quotes-add-button"
                            onClick={() => setSelectedId(quote.id)}
                          >
                            Responder
                          </Button>
                        ) : (
                          <Button size="small" className="quotes-detail-link" onClick={() => setSelectedId(quote.id)}>
                            Ver detalle
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {visibleQuotes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="quotes-empty">
                      Todavía no has recibido solicitudes de cotización.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="quotes-table-footer">
            <span>
              Total: {received.length} {received.length === 1 ? 'cotización' : 'cotizaciones'}
            </span>
            {pageCount > 1 && (
              <nav className="quotes-pagination" aria-label="Paginación">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={pageNumber === currentPage ? 'active' : ''}
                    onClick={() => setPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  aria-label="Página siguiente"
                >
                  ›
                </button>
              </nav>
            )}
          </div>
        </section>
      </div>

      <QuoteResponseDialog
        quote={selected}
        puedeResponder={selected?.effectiveStatus === 'Solicitada'}
        onClose={() => setSelectedId(null)}
        onEnviar={handleSend}
      />
    </SellerTemplate>
  );
};

export default QuotesScreen;
