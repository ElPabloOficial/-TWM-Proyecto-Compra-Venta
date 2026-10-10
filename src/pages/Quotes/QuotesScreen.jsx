import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Header from '../../components/organisms/Header/Header';
import useQuotes from '../../context/useQuotes';
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

const getValidityLabel = (quote) => {
  if (quote.status === 'Aceptada' || quote.status === 'Expirada') {
    return quote.status;
  }
  const days = getRemainingDays(quote.expirationDate);
  if (days < 0) return 'Expirada';
  return `${days} ${days === 1 ? 'día restante' : 'días restantes'}`;
};

const QuotesScreen = () => {
  const { quotes } = useQuotes();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(quotes.length / QUOTES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visibleQuotes = quotes.slice(
    (currentPage - 1) * QUOTES_PER_PAGE,
    currentPage * QUOTES_PER_PAGE,
  );

  return (
    <div className="quotes-layout">
      <Header />
      <main className="quotes-main">
        <Breadcrumbs aria-label="Ruta de navegación" className="quotes-breadcrumbs">
          <Link component={RouterLink} to="/inicio" underline="hover" color="inherit">
            Inicio
          </Link>
          <Typography color="text.primary">Cotizaciones</Typography>
        </Breadcrumbs>

        <div className="quotes-heading">
          <div>
            <h1>Mis Cotizaciones</h1>
            <p>Consulta el estado de tus cotizaciones, acepta las que te convengan y descarga el PDF.</p>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="quotes-add-button"
            disableElevation
          >
            Añadir cotización
          </Button>
        </div>

        <section className="quotes-panel" aria-label="Listado de cotizaciones">
          <div className="quotes-table-scroll">
            <table className="quotes-table">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Fecha</th>
                  <th>Productos / Servicios</th>
                  <th>Valor total</th>
                  <th>Estado</th>
                  <th>Vigencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td data-label="N.º">{quote.id}</td>
                    <td data-label="Fecha">{formatDate(quote.issueDate)}</td>
                    <td data-label="Productos / Servicios">
                      {quote.items.map((item) => item.name).join(', ')}
                    </td>
                    <td data-label="Valor total" className="quotes-total">
                      {formatPrice(getQuoteTotal(quote))}
                    </td>
                    <td data-label="Estado">
                      <span
                        className={`quote-status quote-status-${quote.status.toLowerCase()}`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td
                      data-label="Vigencia"
                      className={
                        getRemainingDays(quote.expirationDate) <= 1 &&
                        quote.status === 'Respondida'
                          ? 'quotes-expiring'
                          : ''
                      }
                    >
                      {getValidityLabel(quote)}
                    </td>
                    <td data-label="Acciones">
                      <Button
                        component={RouterLink}
                        to={`/cotizaciones/${quote.id}`}
                        size="small"
                        className="quotes-detail-link"
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
                {visibleQuotes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="quotes-empty">
                      No tienes cotizaciones para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="quotes-table-footer">
            <span>
              Total: {quotes.length} {quotes.length === 1 ? 'cotización' : 'cotizaciones'}
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
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={pageNumber === currentPage ? 'active' : ''}
                      onClick={() => setPage(pageNumber)}
                      aria-current={pageNumber === currentPage ? 'page' : undefined}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
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

        <Button
          className="quotes-back-home"
          onClick={() => navigate('/inicio')}
        >
          Volver al inicio
        </Button>
      </main>
    </div>
  );
};

export default QuotesScreen;
