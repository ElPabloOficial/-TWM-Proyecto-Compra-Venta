import { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Header from "../../organisms/Header/Header";
import Sidebar from "../../organisms/Sidebar/Sidebar";

const SellerTemplate = ({ children }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!menuAbierto) return;
    const cerrarConEsc = (e) => {
      if (e.key === "Escape") setMenuAbierto(false);
    };
    window.addEventListener("keydown", cerrarConEsc);
    return () => window.removeEventListener("keydown", cerrarConEsc);
  }, [menuAbierto]);

  return (
    <div className="inv-layout">
      <Header />

      {menuAbierto && (
        <div className="inv-overlay" onClick={() => setMenuAbierto(false)} />
      )}

      {/* Barra lateral: aparece al presionar el botón ☰.
          El Sidebar navega y marca la opción activa por sí solo (según la URL);
          aquí solo se cierra el menú. */}
      <aside className={`inv-drawer ${menuAbierto ? "abierto" : ""}`}>
        <Sidebar onSelect={() => setMenuAbierto(false)} />
      </aside>

      <main className="inv-main">
        <button
          type="button"
          className="inv-menu-btn"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </button>

        <div className="inv-main-content">{children}</div>
      </main>
    </div>
  );
};

export default SellerTemplate;