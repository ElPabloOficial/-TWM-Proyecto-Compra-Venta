import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const LoginField = ({ id, label, type = "text", placeholder, value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="login-field">
      <label className="login-label" htmlFor={id}>{label}</label>
      <div className="login-input-wrap">
        <input
          id={id}
          className="login-input"
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <button
            type="button"
            className="login-eye"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginField;