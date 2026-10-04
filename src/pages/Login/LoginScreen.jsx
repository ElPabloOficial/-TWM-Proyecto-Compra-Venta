import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import LoginBrand from "../../components/organisms/LoginBrand/LoginBrand";
import LoginForm from "../../components/organisms/LoginForm/LoginForm";
import { authService } from "../../services/authService";

import "../../styles/Login.css";

const LoginScreen = () => {
  const handleLogin = async (data) => {
    try {
      console.log("[LoginScreen] handleLogin():", data);

      const response = await authService.login(data.rut, data.password);

      console.log("[LoginScreen] Inicio exitoso. Usuario:", response);

      if (data.remember) {
        console.log("[LoginScreen] 'Recuérdame' fue marcado.");
      }


    } catch (error) {
      console.error("[LoginScreen] Inicio fallido:", error.message);
      alert(error.message || "Ocurrió un error al iniciar sesión");
    }
  };

  return (
    <LoginTemplate
      brand={<LoginBrand />}
      form={<LoginForm onSubmit={handleLogin} />}
    />
  );
};

export default LoginScreen;
