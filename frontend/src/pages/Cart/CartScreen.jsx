import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SpeakerOutlinedIcon from '@mui/icons-material/SpeakerOutlined';
import WatchOutlinedIcon from '@mui/icons-material/WatchOutlined';
import Header from '../../components/organisms/Header/Header';
import useCart from '../../context/useCart';
import '../../styles/Cart.css';

const formatPrice = (amount) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

const icons = {
  phone: PhoneAndroidIcon,
  headphones: HeadphonesIcon,
  charger: LocalOfferOutlinedIcon,
  laptop: ComputerIcon,
  scanner: Inventory2OutlinedIcon,
  watch: WatchOutlinedIcon,
  powerbank: LocalOfferOutlinedIcon,
  case: PhoneAndroidIcon,
  speaker: SpeakerOutlinedIcon,
  printer: PrintOutlinedIcon,
  scale: ScaleOutlinedIcon,
  shelves: Inventory2OutlinedIcon,
  labels: LocalOfferOutlinedIcon,
};

const CartProductIcon = ({ icon }) => {
  const Icon = icons[icon] ?? ShoppingBagOutlinedIcon;
  return <Icon aria-hidden="true" />;
};

const CartScreen = () => {
  const navigate = useNavigate();
  const { cart, cartCount, recommendations, addItem, setQuantity, removeItem, user } =
    useCart();
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shipping = 0;

  const handleAdd = (item) => {
    addItem(item);
    setCheckoutMessage('');
  };

  const handleCheckout = () => {
    const purchase = {
      usuario: user ? { id: user.id, nombre: user.name, rol: user.role } : null,
      productos: cart,
      subtotal,
      envio: shipping,
      total: subtotal + shipping,
    };
    console.log('[CartScreen] Datos de compra:', purchase);
    setCheckoutMessage(
      'Compra de demostración lista. No se ha realizado ningún pago.',
    );
  };

  return (
    <div className="cart-layout">
      <Header />
      <main className="cart-main">
        {!user ? (
          <section className="cart-login-required" aria-labelledby="cart-login-title">
            <ShoppingBagOutlinedIcon aria-hidden="true" />
            <h1 id="cart-login-title">Inicia sesión para ver tu carrito</h1>
            <p>
              Cada cuenta tiene su propio carrito. Inicia sesión para consultar
              tus productos y continuar.
            </p>
            <button type="button" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </section>
        ) : (
          <>
        <div className="cart-heading">
          <div>
            <h1>Carrito de compra</h1>
            <p>
              {user
                ? `Revisa tus productos, ${user.name}, y completa tu compra.`
                : 'Revisa tus productos y completa tu compra.'}
            </p>
          </div>
          <span className="cart-item-count">
            {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>

        {checkoutMessage && (
          <div className="cart-feedback" role="status">
            {checkoutMessage}
          </div>
        )}

        <div className="cart-content">
          <section className="cart-products" aria-labelledby="cart-products-title">
            <h2 id="cart-products-title">Productos en tu carrito</h2>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBagOutlinedIcon />
                <p>Tu carrito está vacío.</p>
                <button type="button" onClick={() => navigate('/inicio')}>
                  Explorar productos
                </button>
              </div>
            ) : (
              <ul className="cart-product-list">
                {cart.map((item) => (
                  <li className="cart-product" key={item.id}>
                    <div className={`cart-product-image cart-icon-${item.icon}`}>
                      <CartProductIcon icon={item.icon} />
                    </div>
                    <div className="cart-product-info">
                      <h3>{item.name}</h3>
                      <span>Cantidad: {item.quantity}</span>
                      <span>{item.description}</span>
                      <div className="cart-quantity-controls">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Disminuir cantidad de ${item.name}`}
                        >
                          <RemoveIcon fontSize="small" />
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          <AddIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          className="cart-remove-button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Eliminar ${item.name} del carrito`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                    <strong className="cart-product-price">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title">Resumen de compra</h2>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-shipping-label">
                <LocalShippingOutlinedIcon fontSize="small" />
                Envío
              </span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <strong>{formatPrice(subtotal + shipping)}</strong>
            </div>
            <button
              type="button"
              className="cart-checkout-button"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Pagar ahora
            </button>
            <p className="cart-summary-note">
              Puedes editar la cantidad o eliminar productos antes de confirmar
              tu compra.
            </p>
          </aside>
        </div>

        <section className="cart-recommendations" aria-labelledby="cart-recommendations-title">
          <div className="cart-recommendations-heading">
            <h2 id="cart-recommendations-title">Recomendaciones para añadir al carrito</h2>
            <button type="button" onClick={() => navigate('/inicio')}>
              Ver todo
            </button>
          </div>
          <div className="cart-recommendations-grid">
            {recommendations.map((item) => (
              <article className="cart-recommendation" key={item.id}>
                <div className={`cart-recommendation-image cart-icon-${item.icon}`}>
                  <CartProductIcon icon={item.icon} />
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="cart-recommendation-footer">
                  <strong>{formatPrice(item.price)}</strong>
                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    aria-label={`Añadir ${item.name} al carrito`}
                  >
                    Agregar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
};

export default CartScreen;
