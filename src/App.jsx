import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProductosProvider } from "./context/ProductContext";
import LoginScreen from "./pages/Login/LoginScreen";
import InventoryScreen from "./pages/Inventory/InventoryScreen";
import AddProductScreen from "./pages/Inventory/AddProductScreen";
import MessageModerationScreen from "./pages/MessageModeration/MessageModerationScreen";
import HomeScreen from "./pages/Home/HomeScreen";

const App = () => {
  return (
    <BrowserRouter>
      <ProductosProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/inventario" element={<InventoryScreen />} />
          <Route path="/inventario/nuevo" element={<AddProductScreen />} />
          <Route path="/inventario/editar/:id" element={<AddProductScreen />} />
          <Route path="/mensajes" element={<MessageModerationScreen />} />
        </Routes>
      </ProductosProvider>
    </BrowserRouter>
  );
};

export default App;