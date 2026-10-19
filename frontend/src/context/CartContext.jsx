import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CartContext from './cart-context';

const customerSeed = [
  {
    id: 'phone',
    name: 'Smartphone 128GB negro',
    description: 'Entrega estimada: 2-3 días',
    price: 249990,
    quantity: 1,
    icon: 'phone',
  },
  {
    id: 'earbuds',
    name: 'Auriculares inalámbricos',
    description: 'Entrega estimada: 2-3 días',
    price: 89990,
    quantity: 1,
    icon: 'headphones',
  },
  {
    id: 'charger',
    name: 'Cargador USB-C 20W',
    description: 'Entrega estimada: 2-3 días',
    price: 14990,
    quantity: 2,
    icon: 'charger',
  },
];

const sellerSeed = [
  {
    id: 'laptop',
    name: 'Notebook para gestión de tienda',
    description: 'Entrega estimada: 2-3 días',
    price: 589990,
    quantity: 1,
    icon: 'laptop',
  },
  {
    id: 'scanner',
    name: 'Lector de códigos de barras',
    description: 'Entrega estimada: 2-3 días',
    price: 45990,
    quantity: 1,
    icon: 'scanner',
  },
];

const customerRecommendations = [
  {
    id: 'watch',
    name: 'Smartwatch deportivo',
    description: 'Seguimiento de actividad y notificaciones.',
    price: 129990,
    icon: 'watch',
  },
  {
    id: 'powerbank',
    name: 'Cargador portátil 10.000mAh',
    description: 'Ideal para viajes y uso diario.',
    price: 49990,
    icon: 'powerbank',
  },
  {
    id: 'case',
    name: 'Funda protectora transparente',
    description: 'Diseño ultrafino y resistente a golpes.',
    price: 19990,
    icon: 'case',
  },
  {
    id: 'speaker',
    name: 'Parlante Bluetooth compacto',
    description: 'Sonido claro y batería de larga duración.',
    price: 69990,
    icon: 'speaker',
  },
];

const sellerRecommendations = [
  {
    id: 'printer',
    name: 'Impresora de etiquetas',
    description: 'Agiliza el despacho de tus pedidos.',
    price: 89990,
    icon: 'printer',
  },
  {
    id: 'scale',
    name: 'Balanza digital',
    description: 'Pesa tus paquetes con precisión.',
    price: 32990,
    icon: 'scale',
  },
  {
    id: 'shelves',
    name: 'Estantería organizadora',
    description: 'Mantén tus productos en orden.',
    price: 79990,
    icon: 'shelves',
  },
  {
    id: 'labels',
    name: 'Pack de etiquetas térmicas',
    description: 'Rollo de etiquetas para despacho.',
    price: 12990,
    icon: 'labels',
  },
];

const readUser = () => {
  if (!localStorage.getItem('authToken')) return null;
  const userValue = localStorage.getItem('user');
  return userValue ? JSON.parse(userValue) : null;
};

const initialCartFor = (user, cartKey) => {
  if (!user) return [];

  const savedCart = localStorage.getItem(`ahorraton-cart-${cartKey}`);
  if (savedCart) {
    return JSON.parse(savedCart);
  }
  if (user?.role === 'cliente') return customerSeed;
  if (user?.role === 'vendedor') return sellerSeed;
  return [];
};

export function CartProvider({ children }) {
  useLocation();
  const user = readUser();
  const cartKey = user?.id ? `user-${user.id}` : 'guest';
  const [carts, setCarts] = useState(() => ({
    [cartKey]: initialCartFor(user, cartKey),
  }));
  const cart = user ? carts[cartKey] ?? initialCartFor(user, cartKey) : [];
  const recommendations =
    user?.role === 'vendedor' ? sellerRecommendations : customerRecommendations;

  const updateCart = (updater) => {
    if (!user) return false;

    setCarts((currentCarts) => {
      const currentCart =
        currentCarts[cartKey] ?? initialCartFor(user, cartKey);
      const nextCart = updater(currentCart);
      localStorage.setItem(`ahorraton-cart-${cartKey}`, JSON.stringify(nextCart));
      return { ...currentCarts, [cartKey]: nextCart };
    });
    return true;
  };

  const addItem = (item) => {
    if (!user) return false;

    return updateCart((currentCart) => {
      const existingItem = currentCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [
        ...currentCart,
        {
          id: item.id,
          name: item.name,
          description: item.description ?? 'Entrega estimada: 2-3 días',
          price: item.price,
          quantity: 1,
          icon: item.icon ?? 'phone',
        },
      ];
    });
  };

  const setQuantity = (itemId, quantity) => {
    if (!user || !Number.isInteger(quantity) || quantity < 1) return;
    updateCart((currentCart) =>
      currentCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (itemId) => {
    if (!user) return;
    updateCart((currentCart) =>
      currentCart.filter((item) => item.id !== itemId),
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: user
          ? cart.reduce((count, item) => count + item.quantity, 0)
          : 0,
        recommendations,
        addItem,
        setQuantity,
        removeItem,
        user,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
