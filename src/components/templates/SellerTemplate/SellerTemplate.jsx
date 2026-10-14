import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Header from "../../organisms/Header/Header";
import Sidebar from "../../organisms/Sidebar/Sidebar";

// Rutas del menú lateral. Si una opción no aparece aquí, por ahora solo cierra el menú
// (la pantalla aún no existe). Se agrega su ruta cuando se cree.
const rutasMenu = {
  productos: "/inventario",
  servicios: "/servicios",
  mensajes: "/mensajes",
  resenas: "/resenas",
  cotizacion: "/cotizaciones",
};

// "activo" es el id de la opción del menú que se marca como seleccionada
const SellerTemplate = ({ children, activo = "productos" }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const seleccionarOpcion = (id) => {
    setMenuAbierto(false);
    const ruta = rutasMenu[id];
    if (ruta) navigate(ruta);
  };

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

      {/* Barra lateral: aparece al presionar el botón ☰ */}
      <aside className={`inv-drawer ${menuAbierto ? "abierto" : ""}`}>
        <Sidebar activo={activo} onSelect={seleccionarOpcion} />
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