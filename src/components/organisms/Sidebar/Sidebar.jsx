import logo from "../../../assets/logo.png";
import InventoryIcon from "@mui/icons-material/Inventory2";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import ChatIcon from "@mui/icons-material/Chat";
import StarIcon from "@mui/icons-material/Star";
import CalculateIcon from "@mui/icons-material/Calculate";
import UndoIcon from "@mui/icons-material/Undo";

const items = [
  { id: "productos", label: "Productos", icon: <InventoryIcon fontSize="small" /> },
  { id: "servicios", label: "Servicios", icon: <BuildIcon fontSize="small" /> },
  { id: "pedidos", label: "Pedidos", icon: <ShoppingCartIcon fontSize="small" /> },
  { id: "reportes", label: "Reportes", icon: <BarChartIcon fontSize="small" /> },
  { id: "mensajes", label: "Mensajes", icon: <ChatIcon fontSize="small" /> },
  { id: "resenas", label: "Reseñas", icon: <StarIcon fontSize="small" /> },
  { id: "cotizacion", label: "Cotización", icon: <CalculateIcon fontSize="small" /> },
  { id: "devoluciones", label: "Devoluciones", icon: <UndoIcon fontSize="small" /> },
];

const Sidebar = ({ activo = "productos", onSelect }) => {
  return (
    <nav className="inv-sidebar">
      <div className="inv-sidebar-brand">
        <img src={logo} alt="Logo" width={50} />
        <div>Menú</div>
      </div>

      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`inv-sidebar-item ${item.id === activo ? "activo" : ""}`}
          onClick={() => onSelect?.(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;