import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChatIcon from "@mui/icons-material/Chat";
import StarIcon from "@mui/icons-material/Star";
import UndoIcon from "@mui/icons-material/Undo";
import InventoryIcon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { authService } from "../../../services/authService";
import CustomButton from "../../atoms/Button/CustomButton";
import "../../../styles/ProfileMenu.css";

// Opciones para cualquier usuario.
// Si una opción no tiene "ruta", por ahora solo cierra el menú (la pantalla aún no existe).
const opcionesUsuario = [
  { id: "perfil", label: "Mi perfil", icon: <AccountCircleIcon fontSize="small" />, ruta: "/perfil" },
  { id: "pedidos", label: "Mis pedidos", icon: <ReceiptLongIcon fontSize="small" /> },
  {
    id: "cotizaciones",
    label: "Mis Cotizaciones",
    icon: <ReceiptLongIcon fontSize="small" />,
    ruta: "/cotizaciones",
  },
  { id: "favoritos", label: "Mis favoritos", icon: <FavoriteIcon fontSize="small" /> },
  { id: "direcciones", label: "Mis direcciones", icon: <LocationOnIcon fontSize="small" /> },
  { id: "mensajes", label: "Mensajes", icon: <ChatIcon fontSize="small" /> },
  { id: "resenas", label: "Mis reseñas", icon: <StarIcon fontSize="small" /> },
  { id: "devoluciones", label: "Devoluciones", icon: <UndoIcon fontSize="small" /> },
];

// Opciones solo para vendedores
const opcionesVendedor = [
  {
    id: "inventario",
    label: "Gestión de inventario",
    icon: <InventoryIcon fontSize="small" />,
    ruta: "/inventario",
  },
];


const ProfileMenu = () => {
  const [usuario, setUsuario] = useState(() => authService.getCurrentUser());
  const esVendedor = usuario?.role === "vendedor";
  const [posicion, setPosicion] = useState(null);
  const navigate = useNavigate();
  const abierto = posicion !== null;

  const abrir = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosicion({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  };

  const cerrar = () => setPosicion(null);

  const irA = (ruta) => {
    cerrar();
    navigate(ruta);
  };

  const handleCerrarSesion = async () => {
    console.log("[ProfileMenu] handleCerrarSesion():", usuario);
    await authService.logout();
    setUsuario(null);
    irA("/inicio");
  };

  // Cierra con Esc o al cambiar el tamaño de la ventana
  useEffect(() => {
    if (!abierto) return;
    const cerrarConEsc = (e) => {
      if (e.key === "Escape") setPosicion(null);
    };
    const cerrarAlRedimensionar = () => setPosicion(null);
    window.addEventListener("keydown", cerrarConEsc);
    window.addEventListener("resize", cerrarAlRedimensionar);
    return () => {
      window.removeEventListener("keydown", cerrarConEsc);
      window.removeEventListener("resize", cerrarAlRedimensionar);
    };
  }, [abierto]);

  const renderOpcion = (opcion) => (
    <button
      key={opcion.id}
      type="button"
      className="pm-item"
      role="menuitem"
      onClick={() => (opcion.ruta ? irA(opcion.ruta) : cerrar())}
    >
      {opcion.icon}
      {opcion.label}
    </button>
  );

  return (
    <>
      <CustomButton
        variant="primary"
        size="small"
        startIcon={<PersonIcon />}
        onClick={abrir}
        aria-haspopup="true"
        aria-expanded={abierto}
      >
        Perfil
      </CustomButton>

      {abierto &&
        createPortal(
          <>
            <div className="pm-overlay" onClick={cerrar} />
            <div
              className="pm-menu"
              role="menu"
              style={{ top: posicion.top, right: posicion.right }}
            >
              {!usuario ? (
                <button
                  type="button"
                  className="pm-item"
                  role="menuitem"
                  onClick={() => irA("/login")}
                >
                  <LoginIcon fontSize="small" />
                  Iniciar sesión
                </button>
              ) : (
                <>
                  {opcionesUsuario.map(renderOpcion)}

                  {esVendedor && (
                    <>
                      <hr className="pm-divider" />
                      {opcionesVendedor.map(renderOpcion)}
                    </>
                  )}

                  <hr className="pm-divider" />

                  <button
                    type="button"
                    className="pm-item"
                    role="menuitem"
                    onClick={handleCerrarSesion}
                  >
                    <LogoutIcon fontSize="small" />
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default ProfileMenu;