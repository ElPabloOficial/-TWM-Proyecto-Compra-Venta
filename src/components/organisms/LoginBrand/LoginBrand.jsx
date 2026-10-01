import logo from "../../../assets/logo.png";

const LoginBrand = () => {
  return (
    <div className="login-brand">
      <img src={logo} alt="Logo" className="login-logo" />
      <h1 className="login-title">Inicio de sesión</h1>
    </div>
  );
};

export default LoginBrand;