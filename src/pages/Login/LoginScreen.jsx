import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import LoginBrand from "../../components/organisms/LoginBrand/LoginBrand";
import LoginForm from "../../components/organisms/LoginForm/LoginForm";
import "../../styles/Login.css";

const LoginScreen = () => {
  const handleLogin = (data) => {
    // Aquí va la llamada a la API 
    console.log(data);
  };

  return (
    <LoginTemplate
      brand={<LoginBrand />}
      form={<LoginForm onSubmit={handleLogin} />}
    />
  );
};

export default LoginScreen;