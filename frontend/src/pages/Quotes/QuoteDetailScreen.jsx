import { useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import Header from '../../components/organisms/Header/Header';
import useQuotes from '../../context/useQuotes';
import '../../styles/Quotes.css';

const formatDate = (date) => {
  const [year, , day] = date.split('-');
  return `${day} de ${new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(
    new Date(`${date}T00:00:00`),
  )} de ${year}`;
};

const formatPrice = (amount) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

const getRemainingDays = (expirationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(`${expirationDate}T00:00:00`);
  return Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));
};

const QuoteDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotes, acceptQuote } = useQuotes();
  const [accepted, setAccepted] = useState(false);
  const quote = quotes.find((item) => item.id === id);

  if (!quote) {
    return <Navigate to="/cotizaciones" replace />;
  }

  const subtotal = quote.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;
  const isExpired =
    quote.status === 'Expirada' || getRemainingDays(quote.expirationDate) < 0;
  const canAccept = quote.status === 'Respondida' && !isExpired;

  const handleAccept = () => {
    if (!canAccept) return;
    acceptQuote(quote.id);
    setAccepted(true);
  };

  return (
    <div className="quotes-layout">
      <Header />
      <main className="quotes-main quotes-detail-main">
        <Breadcrumbs aria-label="Ruta de navegación" className="quotes-breadcrumbs">
          <Link component={RouterLink} to="/inicio" underline="hover" color="inherit">
            Inicio
          </Link>
          <Link component={RouterLink} to="/cotizaciones" underline="hover" color="inherit">
            Cotizaciones
          </Link>
          <Typography color="text.primary">Detalle de cotización</Typography>
        </Breadcrumbs>

        <div className="quote-detail-heading">
          <h1>Cotización #{quote.id}</h1>
          <span className={`quote-status quote-status-${quote.status.toLowerCase()}`}>
            {quote.status}
          </span>
        </div>

        {accepted && (
          <Alert severity="success" className="quote-feedback">
            Cotización aceptada exitosamente.
          </Alert>
        )}

        <div className="quote-summary-grid">
          <section className="quote-info-card">
            <h2>Datos de la cotización</h2>
            <dl>
              <div>
                <dt>Fecha de emisión</dt>
                <dd>{formatDate(quote.issueDate)}</dd>
              </div>
              <div>
                <dt>Fecha de expiración</dt>
                <dd>{formatDate(quote.expirationDate)}</dd>
              </div>
              <div>
                <dt>Vigencia restante</dt>
                <dd className={isExpired ? 'quotes-expiring' : ''}>
                  {isExpired
                    ? 'Expirada'
                    : `${getRemainingDays(quote.expirationDate)} ${
                        getRemainingDays(quote.expirationDate) === 1
                          ? 'día restante'
                          : 'días restantes'
                      }`}
                </dd>
              </div>
            </dl>
          </section>

          <section className="quote-info-card">
            <h2>Vendedor</h2>
            <dl>
              <div>
                <dt>Nombre</dt>
                <dd>{quote.seller.name}</dd>
              </div>
              <div>
                <dt>RUT</dt>
                <dd>{quote.seller.rut}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="quote-items-card">
          <h2>Productos / Servicios cotizados</h2>
          <div className="quotes-table-scroll">
            <table className="quote-items-table">
              <thead>
                <tr>
                  <th>Producto / Servicio</th>
                  <th>Precio unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{formatPrice(item.unitPrice)}</td>
                    <td>{item.quantity}</td>
                    <td className="quotes-total">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Subtotal</td>
                  <td>{formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3}>IVA (19%)</td>
                  <td>{formatPrice(tax)}</td>
                </tr>
                <tr className="quote-grand-total">
                  <td colSpan={3}>Total</td>
                  <td>{formatPrice(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <div className="quote-detail-actions">
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleAccept}
            disabled={!canAccept}
            className="quote-accept-button"
          >
            Aceptar cotización
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.print()}
            className="quote-print-button"
          >
            Descargar PDF
          </Button>
          <Button
            onClick={() => navigate('/cotizaciones')}
            className="quote-return-button"
          >
            Volver a Mis Cotizaciones
          </Button>
        </div>
        <Alert severity="info" className="quote-action-note">
          Solo puedes aceptar cotizaciones respondidas y que aún estén vigentes.
        </Alert>
      </main>
    </div>
  );
};

export default QuoteDetailScreen;
