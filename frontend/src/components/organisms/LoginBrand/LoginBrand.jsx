import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";

const LoginBrand = () => {
  return (
    <div className="login-brand">
      <Link to="/inicio" aria-label="Ir al inicio" style={{ display: "inline-block" }}>
        <img src={logo} alt="Logo" className="login-logo" style={{ cursor: "pointer" }} />
      </Link>
      <h1 className="login-title">Inicio de sesión</h1>
    </div>
  );
};

export default LoginBrand;