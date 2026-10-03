import LoginScreen from "./pages/Login/LoginScreen";
import RegisterScreen from "./pages/Register/RegisterScreen";

const App = () => {
  const currentPath = window.location.pathname.replace(/\/+$/, "");

  if (currentPath === "/registro") {
    return <RegisterScreen />;
  }

  return <LoginScreen />;
};

export default App;