import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const LoginField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  errorMessage = "",
}) => {
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
          required={required}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
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
      {errorMessage && (
        <p id={`${id}-error`} className="login-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default LoginField;