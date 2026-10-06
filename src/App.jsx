// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ProductosProvider } from "./context/ProductContext";
// import LoginScreen from "./pages/Login/LoginScreen";
// import InventoryScreen from "./pages/Inventory/InventoryScreen";
// import AddProductScreen from "./pages/Inventory/AddProductScreen";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <ProductosProvider>
//         <Routes>
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="/login" element={<LoginScreen />} />
//           <Route path="/inventario" element={<InventoryScreen />} />
//           <Route path="/inventario/nuevo" element={<AddProductScreen />} />
//         </Routes>
//       </ProductosProvider>
//     </BrowserRouter>
//   );
// };

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProductosProvider } from "./context/ProductContext";
import { ServiciosProvider } from "./context/ServiceContext";

import LoginScreen from "./pages/Login/LoginScreen";
import RegisterScreen from "./pages/Register/RegisterScreen";
import InventoryScreen from "./pages/Inventory/InventoryScreen";
import AddProductScreen from "./pages/Inventory/AddProductScreen";
import ServicesScreen from "./pages/Services/ServicesScreen";
import ServiceFormScreen from "./pages/Services/ServiceFormScreen";
import MessageModerationScreen from "./pages/MessageModeration/MessageModerationScreen";
import HomeScreen from "./pages/Home/HomeScreen";

import ProfileScreen from "./pages/Profile/ProfileScreen"; // ← NUEVO

const App = () => {
  return (
    <BrowserRouter>
      <ProductosProvider>
        <ServiciosProvider>
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
            <Route path="/registro" element={<RegisterScreen />} />
            <Route path="/perfil" element={<ProfileScreen />} /> {/* ← NUEVO */}
          </Routes>
        </ServiciosProvider>
      </ProductosProvider>
    </BrowserRouter>
  );
};

export default App;
