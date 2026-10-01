import { useState } from "react";

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {visible ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M1 1l22 22" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginField;