import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProductosProvider } from "./context/ProductContext";
import { ServiciosProvider } from "./context/ServiceContext";
import { QuotesProvider } from "./context/QuotesContext";
import { CartProvider } from "./context/CartContext";

import LoginScreen from "./pages/Login/LoginScreen";
import RegisterScreen from "./pages/Register/RegisterScreen";
import InventoryScreen from "./pages/Inventory/InventoryScreen";
import AddProductScreen from "./pages/Inventory/AddProductScreen";
import ServicesScreen from "./pages/Services/ServicesScreen";
import ServiceFormScreen from "./pages/Services/ServiceFormScreen";
import MessageModerationScreen from "./pages/MessageModeration/MessageModerationScreen";
import MessagesScreen from "./pages/Messages/MessagesScreen";
import HomeScreen from "./pages/Home/HomeScreen";
import ProfileScreen from "./pages/Profile/ProfileScreen";
import QuotesScreen from "./pages/Quotes/QuotesScreen";
import QuoteDetailScreen from "./pages/Quotes/QuoteDetailScreen";
import ReviewsScreen from "./pages/Reviews/ReviewsScreen";
import OrdersScreen from "./pages/Orders/OrdersScreen";
import ReceiptScreen from "./pages/Receipt/ReceiptScreen";
import ReportsScreen from "./pages/Reports/ReportsScreen";
import TransHistoryScreen from "./pages/TransHistoryScreen/TransHistoryScreen";
import ShippingCostsScreen from "./pages/Shipping/ShippingCostsScreen";
import WishlistScreen from "./pages/Wishlist/WishlistScreen";
import CategoryManagementScreen from "./pages/Category/CategoryManagementScreen";
import AdminUserManagementScreen from "./pages/AdminUser/AdminUserAdministrationScreen";
import ConfirmPurchaseScreen from "./pages/ConfirmPurchase/ConfirmPurchaseScreen";
import CartScreen from "./pages/Cart/CartScreen";
import CatalogScreen from "./pages/Catalog/CatalogScreen";
import AdminScreen from './pages/Admin/AdminScreen';
import NewQuoteScreen from './pages/NewQuote/NewQuoteScreen';
import AddressesScreen from "./pages/Addresses/AddressesScreen";

const App = () => {
  return (
    <BrowserRouter>
      <ProductosProvider>
        <ServiciosProvider>
          <QuotesProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/inicio" replace />} />
                <Route path="/inicio" element={<HomeScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/inventario" element={<InventoryScreen />} />
                <Route path="/inventario/nuevo" element={<AddProductScreen />} />
                <Route path="/inventario/editar/:id" element={<AddProductScreen />} />
                <Route path="/servicios" element={<ServicesScreen />} />
                <Route path="/servicios/nuevo" element={<ServiceFormScreen />} />
                <Route path="/servicios/editar/:id" element={<ServiceFormScreen />} />
                <Route path="/mensajes" element={<MessageModerationScreen />} />
                <Route path="/mensajes/vendedor" element={<MessagesScreen />} />
                <Route path="/registro" element={<RegisterScreen />} />
                <Route path="/perfil" element={<ProfileScreen />} />
                <Route path="/cotizaciones" element={<QuotesScreen />} />
                <Route path="/cotizaciones/:id" element={<QuoteDetailScreen />} />
                <Route path="/resenas" element={<ReviewsScreen />} />
                <Route path="/pedidos" element={<OrdersScreen />} />
                <Route path="/recibo" element={<ReceiptScreen />} />
                <Route path="/reportes" element={<ReportsScreen />} />
                <Route path="/transacciones" element={<TransHistoryScreen />} />
                <Route path="/envios" element={<ShippingCostsScreen />} />
                <Route path="/listadedeseos" element={<WishlistScreen />} />
                <Route path="/categorias" element={<CategoryManagementScreen />} />
                <Route path="/carrito" element={<CartScreen />} />
                <Route path="/usuarios" element={<AdminUserManagementScreen />} />
                <Route path="/confirmarcompra" element={<ConfirmPurchaseScreen />} />
                <Route path="/catalogo" element={<CatalogScreen />} />
                <Route path="/admin" element={<AdminScreen />} />
                <Route path="/cotizaciones/nueva" element={<NewQuoteScreen />} />
                <Route path="/direcciones" element={<AddressesScreen />} />
              </Routes>
            </CartProvider>
          </QuotesProvider>
        </ServiciosProvider>
      </ProductosProvider>
    </BrowserRouter>
  );
};

export default App;