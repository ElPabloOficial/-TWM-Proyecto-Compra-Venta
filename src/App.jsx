import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProductosProvider } from "./context/ProductContext";
import LoginScreen from "./pages/Login/LoginScreen";
import InventoryScreen from "./pages/Inventory/InventoryScreen";
import AddProductScreen from "./pages/Inventory/AddProductScreen";
import MessageModerationScreen from "./pages/MessageModeration/MessageModerationScreen";

const App = () => {
  return (
    <BrowserRouter>
      <ProductosProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/inventario" element={<InventoryScreen />} />
          <Route path="/inventario/nuevo" element={<AddProductScreen />} />
          <Route path="/mensajes" element={<MessageModerationScreen />} />
        </Routes>
      </ProductosProvider>
    </BrowserRouter>
  );
};

export default App;