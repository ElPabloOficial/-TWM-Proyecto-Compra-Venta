import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginScreen from "./pages/Login/LoginScreen";

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/login" element={<LoginScreen />} />
    </Routes>
    </BrowserRouter>
  );
};

export default App;
