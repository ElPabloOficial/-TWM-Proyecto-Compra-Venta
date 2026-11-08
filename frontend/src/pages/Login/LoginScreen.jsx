import { useNavigate } from "react-router-dom";

import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import LoginBrand from "../../components/organisms/LoginBrand/LoginBrand";
import LoginForm from "../../components/organisms/LoginForm/LoginForm";
import { authService } from "../../services/authService";

import "../../styles/Login.css";

const LoginScreen = () => {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      // La contraseña nunca se imprime: solo se confirma que se capturó
      console.log("[LoginScreen] handleLogin():", { rut: data.rut, password: "[oculta]", remember: data.remember });

      const response = await authService.login(data.rut, data.password);

      // Se imprime solo el usuario: la respuesta también trae el token de sesión y no debe mostrarse
      console.log("[LoginScreen] Inicio exitoso. Usuario:", response.user);

      if (data.remember) {
        console.log("[LoginScreen] 'Recuérdame' fue marcado.");
      }

      navigate("/inicio");

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
