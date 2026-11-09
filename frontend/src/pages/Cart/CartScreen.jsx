import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Header from '../../components/organisms/Header/Header';
import ErrorState from '../../components/molecules/ErrorState/ErrorState';
import useCart from '../../context/useCart';
import { useToast } from '../../context/ToastContext';
import { listarCatalogo, rutaDetalle } from '../../services/catalogService';
import { calcularTotales, urlImagen } from '../../services/cartService';
import '../../styles/Cart.css';

const formatPrice = (amount) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

// Imagen del producto, o una bolsa si no tiene
const CartImage = ({ src, alt }) =>
  src ? <img src={src} alt={alt} loading="lazy" /> : <ShoppingBagOutlinedIcon aria-hidden="true" />;

const CartScreen = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cargando, error, refrescar, addItem, setQuantity, removeItem, user } = useCart();
  const { mostrarToast } = useToast();
  const [catalogo, setCatalogo] = useState([]);

  useEffect(() => {
    if (!user) return undefined;
    let activo = true;
    listarCatalogo()
      .then((lista) => activo && setCatalogo(lista))
      .catch(() => {}); // sin catálogo el carrito igual funciona; solo no hay recomendaciones
    return () => {
      activo = false;
    };
  }, [user]);

  const { neto, iva, total } = calcularTotales(cart);
  const sinPrecio = cart.some((item) => item.precio === null);

  // Recomendaciones: lo que no está en el carrito, empezando por lo que comparte categoría con él
  const recomendados = useMemo(() => {
    const categoriasCarrito = new Set(
      catalogo.filter((i) => cart.some((c) => c.clave === i.clave)).flatMap((i) => i.categorias.map((c) => c.id)),
    );
    return catalogo
      .filter((i) => i.precio !== null && !cart.some((c) => c.clave === i.clave))
      .map((i) => ({ ...i, afinidad: i.categorias.some((c) => categoriasCarrito.has(c.id)) ? 1 : 0 }))
      .sort((a, b) => b.afinidad - a.afinidad || b.descuentoPct - a.descuentoPct)
      .slice(0, 4);
  }, [catalogo, cart]);

  // Cualquier acción del carrito puede fallar (sin conexión, producto retirado...)
  const intentar = async (accion) => {
    try {
      await accion();
    } catch (e) {
      mostrarToast(e.message, 'error');
    }
  };

  const handleAdd = (item) =>
    intentar(async () => {
      await addItem({ tipo: item.tipo, id: item.id });
      mostrarToast(`${item.nombre} se agregó al carrito`);
    });

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
                <p>Revisa tus productos, {user.name}, y completa tu compra.</p>
              </div>
              <span className="cart-item-count">
                {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            {error ? (
              <ErrorState titulo="No pudimos cargar tu carrito" detalle={error} onReintentar={refrescar} />
            ) : (
              <div className="cart-content">
                <section className="cart-products" aria-labelledby="cart-products-title">
                  <h2 id="cart-products-title">Productos en tu carrito</h2>
                  {cargando ? (
                    <p className="cart-status">Cargando tu carrito...</p>
                  ) : cart.length === 0 ? (
                    <div className="cart-empty">
                      <ShoppingBagOutlinedIcon />
                      <p>Tu carrito está vacío.</p>
                      <button type="button" onClick={() => navigate('/catalogo')}>
                        Explorar productos
                      </button>
                    </div>
                  ) : (
                    <ul className="cart-product-list">
                      {cart.map((item) => (
                        <li className="cart-product" key={item.clave}>
                          <div className="cart-product-image">
                            <CartImage src={item.imagen} alt={item.nombre} />
                          </div>
                          <div className="cart-product-info">
                            <h3>
                              <button
                                type="button"
                                className="cart-product-link"
                                onClick={() => navigate(rutaDetalle(item))}
                              >
                                {item.nombre}
                              </button>
                            </h3>
                            <span>
                              {item.tipo === 'servicio' ? 'Servicio' : 'Producto'}
                              {item.vendedor && ` · Vendido por ${item.vendedor}`}
                            </span>
                            {item.restriccionEdad && (
                              <span className="cart-age">Solo para mayores de 18 años</span>
                            )}
                            <span className="cart-unit-price">
                              {item.precio === null ? (
                                'Precio por definir'
                              ) : (
                                <>
                                  {formatPrice(item.precio)} c/u
                                  {item.precioAnterior && (
                                    <>
                                      {' '}
                                      <s>{formatPrice(item.precioAnterior)}</s>{' '}
                                      <b className="cart-offer">-{item.descuentoPct}%</b>
                                    </>
                                  )}
                                </>
                              )}
                            </span>
                            <div className="cart-quantity-controls">
                              <button
                                type="button"
                                onClick={() => intentar(() => setQuantity(item, item.cantidad - 1))}
                                disabled={item.cantidad <= 1}
                                aria-label={`Disminuir cantidad de ${item.nombre}`}
                              >
                                <RemoveIcon fontSize="small" />
                              </button>
                              <span aria-live="polite">{item.cantidad}</span>
                              <button
                                type="button"
                                onClick={() => intentar(() => setQuantity(item, item.cantidad + 1))}
                                aria-label={`Aumentar cantidad de ${item.nombre}`}
                              >
                                <AddIcon fontSize="small" />
                              </button>
                              <button
                                type="button"
                                className="cart-remove-button"
                                onClick={() =>
                                  intentar(async () => {
                                    await removeItem(item);
                                    mostrarToast(`${item.nombre} se quitó del carrito`);
                                  })
                                }
                                aria-label={`Eliminar ${item.nombre} del carrito`}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                          <strong className="cart-product-price">
                            {item.precio === null ? '—' : formatPrice(item.precio * item.cantidad)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <aside className="cart-summary" aria-labelledby="cart-summary-title">
                  <h2 id="cart-summary-title">Resumen de compra</h2>
                  <div className="cart-summary-row">
                    <span>Subtotal (neto)</span>
                    <span>{formatPrice(neto)}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>IVA (19%)</span>
                    <span>{formatPrice(iva)}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span className="cart-shipping-label">
                      <LocalShippingOutlinedIcon fontSize="small" />
                      Envío
                    </span>
                    <span>Se calcula al despachar</span>
                  </div>
                  <div className="cart-summary-total">
                    <span>Total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                  <button
                    type="button"
                    className="cart-checkout-button"
                    onClick={() => navigate('/confirmarcompra')}
                    disabled={cargando || cart.length === 0 || sinPrecio}
                  >
                    Continuar con la compra
                  </button>
                  {sinPrecio && (
                    <p className="cart-summary-note cart-summary-warning">
                      Hay un servicio sin precio definido. Quítalo o pide una cotización para continuar.
                    </p>
                  )}
                  <p className="cart-summary-note">
                    Puedes editar la cantidad o eliminar productos antes de confirmar tu compra. El costo de
                    envío se calcula con el tamaño del paquete cuando el vendedor despacha tu pedido.
                  </p>
                </aside>
              </div>
            )}

            {recomendados.length > 0 && (
              <section className="cart-recommendations" aria-labelledby="cart-recommendations-title">
                <div className="cart-recommendations-heading">
                  <h2 id="cart-recommendations-title">Recomendaciones para añadir al carrito</h2>
                  <button type="button" onClick={() => navigate('/catalogo')}>
                    Ver todo
                  </button>
                </div>
                <div className="cart-recommendations-grid">
                  {recomendados.map((item) => (
                    <article
                      className="cart-recommendation"
                      key={item.clave}
                      role="link"
                      tabIndex={0}
                      aria-label={`Ver ${item.nombre}`}
                      onClick={() => navigate(rutaDetalle(item))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(rutaDetalle(item));
                      }}
                    >
                      <div className="cart-recommendation-image">
                        <CartImage src={urlImagen(item.imagen)} alt={item.nombre} />
                      </div>
                      <h3>{item.nombre}</h3>
                      <p>{item.descripcion}</p>
                      <div className="cart-recommendation-footer">
                        <strong>{formatPrice(item.precio)}</strong>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // agregar no debe abrir la ficha
                            handleAdd(item);
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          aria-label={`Añadir ${item.nombre} al carrito`}
                        >
                          Agregar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CartScreen;