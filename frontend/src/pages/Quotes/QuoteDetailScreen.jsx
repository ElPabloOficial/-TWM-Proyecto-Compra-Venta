import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import Header from '../../components/organisms/Header/Header';
import { useToast } from '../../context/ToastContext';
import { obtenerCotizacion, aceptarCotizacion } from '../../services/quoteService';
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
  const location = useLocation();
  // Quien viene de "Mis cotizaciones" (cliente) vuelve ahí; el vendedor vuelve a su listado
  const volverA = location.state?.volverA ?? '/cotizaciones';
  const { mostrarToast } = useToast();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // GET /cotizaciones/{id}
  useEffect(() => {
    let active = true;

    setLoading(true);
    setFailed(false);
    obtenerCotizacion(id)
      .then((data) => {
        if (active) setQuote(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (failed) {
    return <Navigate to={volverA} replace />;
  }

  if (loading || !quote) {
    return (
      <div className="quotes-layout">
        <Header />
        <main className="quotes-main quotes-detail-main">
          <p role="status">Cargando cotización...</p>
        </main>
      </div>
    );
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
  const canBuy = quote.status === 'Aceptada' && !isExpired;
  // Productos de los que ya no quedan las unidades cotizadas (el stock lo ve solo el cliente)
  const sinStock = quote.items.filter(
    (item) => item.tipo === 'producto' && item.stock != null && item.stock < item.quantity,
  );
  const hayProblemaDeStock = sinStock.length > 0;
  const conStockVisible = ['Respondida', 'Aceptada'].includes(quote.status);

  // PUT /cotizaciones/{id}/aceptar
  const handleAccept = async () => {
    if (!canAccept || accepting) return;
    setAccepting(true);
    try {
      await aceptarCotizacion(quote.id);
      setQuote({ ...quote, status: 'Aceptada' });
      setAccepted(true);
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="quotes-layout">
      <Header />
      <main className="quotes-main quotes-detail-main">
        <Breadcrumbs aria-label="Ruta de navegación" className="quotes-breadcrumbs">
          <Link component={RouterLink} to="/inicio" underline="hover" color="inherit">
            Inicio
          </Link>
          <Link component={RouterLink} to={volverA} underline="hover" color="inherit">
            Cotizaciones
          </Link>
          <Typography color="text.primary">Detalle de cotización</Typography>
        </Breadcrumbs>

        <div className="quote-detail-heading">
          <h1>Cotización #{quote.id}</h1>
          <span className={`quote-status quote-status-${quote.status.toLowerCase()}`}>
            {quote.status === 'Aceptada' ? 'Aceptada por el cliente' : quote.status}
          </span>
        </div>

        {accepted && (
          <Alert severity="success" className="quote-feedback">
            Cotización aceptada exitosamente. Ya puedes comprar con ella al valor acordado.
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
                <dd>{quote.status === 'Solicitada' ? 'Aún sin responder' : quote.seller.name}</dd>
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
                  <tr key={`${item.tipo}-${item.id}`}>
                    <td>
                      {item.name}
                      {conStockVisible && item.tipo === 'producto' && item.stock != null && (
                        <span className={`quote-stock ${item.stock < item.quantity ? 'quote-stock-bajo' : ''}`}>
                          {item.stock < item.quantity
                            ? `Stock insuficiente (quedan ${item.stock})`
                            : `${item.stock} en stock`}
                        </span>
                      )}
                    </td>
                    <td>{item.unitPrice > 0 ? formatPrice(item.unitPrice) : 'Por cotizar'}</td>
                    <td>{item.quantity}</td>
                    <td className="quotes-total">
                      {item.unitPrice > 0 ? formatPrice(item.unitPrice * item.quantity) : '—'}
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

        {conStockVisible && hayProblemaDeStock && (
          <Alert severity="warning" className="quote-feedback">
            No hay stock suficiente de {sinStock.map((item) => item.name).join(', ')}. No podrás comprar con esta
            cotización hasta que el vendedor lo reponga.
          </Alert>
        )}

        <div className="quote-detail-actions">
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleAccept}
            disabled={!canAccept || accepting}
            className="quote-accept-button"
          >
            Aceptar cotización
          </Button>
          {quote.status === 'Respondida' && (
            <Button
              variant="contained"
              onClick={() => navigate(`/confirmarcompra?cotizacion=${quote.id}`)}
              disabled={!canAccept || hayProblemaDeStock}
              className="quote-accept-button"
            >
              Aceptar y comprar
            </Button>
          )}
          {quote.status === 'Aceptada' && (
            <Button
              variant="contained"
              onClick={() => navigate(`/confirmarcompra?cotizacion=${quote.id}`)}
              disabled={!canBuy || hayProblemaDeStock}
              className="quote-accept-button"
            >
              Comprar con esta cotización
            </Button>
          )}
          {quote.status === 'Comprada' && (
            <Button variant="contained" onClick={() => navigate('/historial')} className="quote-accept-button">
              Ver mis compras
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => window.print()}
            className="quote-print-button"
          >
            Descargar PDF
          </Button>
          <Button
            onClick={() => navigate(volverA)}
            className="quote-return-button"
          >
            Volver a Mis Cotizaciones
          </Button>
        </div>
        <Alert severity="info" className="quote-action-note">
          {quote.status === 'Aceptada'
            ? 'Esta cotización está aceptada: puedes comprar al valor acordado mientras siga vigente.'
            : quote.status === 'Comprada'
              ? 'Ya compraste con esta cotización. Revisa tu pedido en Mis compras.'
              : quote.status === 'Respondida'
                ? 'Puedes aceptarla y comprar de una vez, o solo aceptarla y comprar más tarde mientras siga vigente.'
                : 'Solo puedes aceptar cotizaciones respondidas y que aún estén vigentes.'}
        </Alert>
      </main>
    </div>
  );
};

export default QuoteDetailScreen;