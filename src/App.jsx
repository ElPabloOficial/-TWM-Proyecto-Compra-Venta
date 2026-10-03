import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./pages/Login/LoginScreen";
import InventoryScreen from "./pages/Inventory/InventoryScreen";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/inventario" element={<InventoryScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;