import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChatIcon from "@mui/icons-material/Chat";
import StarIcon from "@mui/icons-material/Star";
import UndoIcon from "@mui/icons-material/Undo";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import InventoryIcon from "@mui/icons-material/Inventory2";
import ServicesIcon from "@mui/icons-material/MiscellaneousServices";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { authService } from "../../../services/authService";
import CustomButton from "../../atoms/Button/CustomButton";
import "../../../styles/ProfileMenu.css";

// Este menú es lo que ve un CLIENTE (comprador). Un vendedor también es cliente, así que ve
// exactamente las mismas opciones, y además un único acceso a su gestión ("Gestión de inventario").
// Todo lo que hace como vendedor (productos, servicios, pedidos, despachos, mensajes recibidos,
// reseñas recibidas, cotizaciones recibidas, devoluciones...) está en el menú lateral de esa gestión.
//
// Tipos de usuario (campo "tipousuario" de la base de datos):
//   cliente  -> solo compra
//   vendedor -> vende, y además compra
//   ambos    -> vende y compra (se trata igual que vendedor)
//   admin    -> caso aparte: ve el menú de cliente + el panel de administración
const opciones = [
  {
    id: "perfil",
    label: "Mi perfil",
    icon: <AccountCircleIcon fontSize="small" />,
    ruta: "/perfil",
  },
  {
    id: "compras",
    label: "Mis compras",
    icon: <ShoppingBagIcon fontSize="small" />,
    ruta: "/historial",
  },
  {
    id: "cotizaciones",
    label: "Mis Cotizaciones", // las que pidió como cliente (la del vendedor está en su menú de gestión)
    icon: <ReceiptLongIcon fontSize="small" />,
    ruta: "/mis-cotizaciones",
  },
  {
    id: "favoritos",
    label: "Mis favoritos",
    icon: <FavoriteIcon fontSize="small" />,
    ruta: "/listasdedeseos",
  },
  {
    id: "direcciones",
    label: "Mis direcciones",
    icon: <LocationOnIcon fontSize="small" />,
    ruta: "/direcciones",
  },
  {
    id: "mensajes",
    label: "Mensajes",
    icon: <ChatIcon fontSize="small" />,
    ruta: "/mensajes/cliente", // escribe a los vendedores de sus compras (los que recibe como vendedor están en su gestión)
  },
  {
    id: "resenas",
    label: "Mis reseñas", // las que escribió como cliente
    icon: <StarIcon fontSize="small" />,
    ruta: "/mis-resenas",
  },
];

// Panel de gestión: solo para vendedores (aparece separado por una línea)
const opcionesVendedor = [
  {
    id: "inventario",
    label: "Gestión de inventario",
    icon: <InventoryIcon fontSize="small" />,
    ruta: "/inventario",
  },
];

// Panel de administración: solo para administradores
const opcionAdmin = {
  id: "admin",
  label: "Panel de administración",
  icon: <AdminPanelSettingsIcon fontSize="small" />,
  ruta: "/admin",
};

const ProfileMenu = () => {
  const [usuario, setUsuario] = useState(() => authService.getCurrentUser());
  // "tipousuario" viene de la base de datos. Las sesiones guardadas antes de este cambio
  // solo tienen "role"; para esas se usa "role".
  const tipo = usuario?.tipousuario ?? usuario?.role;
  // Un vendedor también puede comprar, así que ve todo lo de cliente y además el acceso a su gestión.
  // "ambos" es el usuario que vende y compra.
  const esVendedor = ["vendedor", "ambos"].includes(String(tipo ?? "").toLowerCase());
  const admin = Boolean(usuario) && authService.esAdmin();

  const visible = (opcion) => opcion.para !== "vendedor" || esVendedor;
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

  const renderOpcion = (opcion) => {
    // El vendedor va a su versión de la pantalla, si la opción tiene una
    const ruta = esVendedor && opcion.rutaVendedor ? opcion.rutaVendedor : opcion.ruta;

    return (
      <button
        key={opcion.id}
        type="button"
        className="pm-item"
        role="menuitem"
        onClick={() => (ruta ? irA(ruta) : cerrar())}
      >
        {opcion.icon}
        {opcion.label}
      </button>
    );
  };

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
                  {admin && (
                    <>
                      {renderOpcion(opcionAdmin)}
                      <hr className="pm-divider" />
                    </>
                  )}

                  {opciones.filter(visible).map(renderOpcion)}

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