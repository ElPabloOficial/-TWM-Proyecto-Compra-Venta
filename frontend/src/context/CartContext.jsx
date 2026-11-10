import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CartContext from './cart-context';
import {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  quitarDelCarrito,
} from '../services/cartService';

/*
 * Carrito de compra, guardado en la base de datos (cada usuario tiene el suyo).
 *   cart       -> [{ clave, tipo, id, nombre, precio, cantidad, imagen, ... }]
 *   addItem    -> addItem({ tipo: 'producto' | 'servicio', id }, cantidad = 1)
 *   setQuantity(item, cantidad) / removeItem(item) / clearCart() / refrescar()
 * Las acciones lanzan un error si la API rechaza el cambio (la pantalla muestra el mensaje).
 */

const readUser = () => {
  if (!localStorage.getItem('authToken')) return null;
  const userValue = localStorage.getItem('user');
  return userValue ? JSON.parse(userValue) : null;
};

export function CartProvider({ children }) {
  useLocation(); // vuelve a leer la sesión al cambiar de página (al iniciar o cerrar sesión)
  const [, setVersionSesion] = useState(0);
  const user = readUser();
  const rut = user?.rut ?? null;

  const [cart, setCart] = useState([]);
  const [cargando, setCargando] = useState(Boolean(rut));
  const [error, setError] = useState('');

  const refrescar = useCallback(async () => {
    if (!rut) {
      setCart([]);
      setCargando(false);
      return;
    }
    setError('');
    try {
      setCart(await obtenerCarrito());
    } catch (e) {
      if (e.sesionCerrada) {
        // La sesión se cerró sola: se muestra el carrito como "sin sesión", sin mensaje de error
        setCart([]);
      } else {
        setError(e.message);
      }
    } finally {
      setCargando(false);
    }
  }, [rut]);

  useEffect(() => {
    setCargando(Boolean(rut));
    refrescar();
  }, [rut, refrescar]);

  // Si la API cierra la sesión (token vencido o sin conexión), se vuelve a leer al instante
  useEffect(() => {
    const alCerrarSesion = () => {
      setError('');
      setCart([]);
      setVersionSesion((v) => v + 1);
    };
    window.addEventListener('sesion-cerrada', alCerrarSesion);
    return () => window.removeEventListener('sesion-cerrada', alCerrarSesion);
  }, []);

  const addItem = async (item, cantidad = 1) => {
    if (!user) return false;
    console.log('[Carrito] Agregar al carrito:', { tipo: item.tipo, id: item.id, cantidad });
    await agregarAlCarrito(item.tipo, item.id, cantidad);
    await refrescar();
    return true;
  };

  const setQuantity = async (item, cantidad) => {
    if (!user || !Number.isInteger(cantidad) || cantidad < 1) return;
    console.log('[Carrito] Cambiar cantidad:', { tipo: item.tipo, id: item.id, cantidad });
    const anterior = cart;
    setCart((actual) => actual.map((i) => (i.clave === item.clave ? { ...i, cantidad } : i)));
    try {
      await actualizarCantidad(item.tipo, item.id, cantidad);
    } catch (e) {
      setCart(anterior);
      throw e;
    }
  };

  const removeItem = async (item) => {
    if (!user) return;
    console.log('[Carrito] Quitar del carrito:', { tipo: item.tipo, id: item.id });
    const anterior = cart;
    setCart((actual) => actual.filter((i) => i.clave !== item.clave));
    try {
      await quitarDelCarrito(item.tipo, item.id);
    } catch (e) {
      setCart(anterior);
      throw e;
    }
  };

  // Después de pagar la API ya vació el carrito; esto solo actualiza la pantalla
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: user ? cart.reduce((count, item) => count + item.cantidad, 0) : 0,
        cargando,
        error,
        refrescar,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        user,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}