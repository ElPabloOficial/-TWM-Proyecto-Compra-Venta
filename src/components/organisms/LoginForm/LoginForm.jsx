import { useState } from "react";
import LoginField from "../../molecules/LoginField/LoginField";
import RememberUser from "../../molecules/RememberUser/RememberUser";
import CustomButton from "../../atoms/Button/CustomButton";

const LoginForm = ({ onSubmit }) => {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ rut, password, remember });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <LoginField
        id="rut"
        label="RUT"
        placeholder="Ingresa tu rut"
        value={rut}
        onChange={(e) => setRut(e.target.value)}
      />
      <LoginField
        id="password"
        label="Contraseña"
        type="password"
        placeholder="••••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <RememberUser
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
      />
      <CustomButton
        type="submit"
        variant="primary"
        size="large"
        sx={{
          alignSelf: "center",
          width: "80%",
          borderRadius: "999px",
          textTransform: "none",
          fontWeight: 700,
          fontSize: "1rem",
          border: "2px solid #EC3333",
        }}
      >
        Ingresar
      </CustomButton>
      <p className="login-register">
        ¿Aún no tienes cuenta? <a href="/registro">Regístrate</a>
      </p>
    </form>
  );
};

export default LoginForm;