import Box from "@mui/material/Box";
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
    <Box
      component="nav"
      sx={{
        width: 160,
        flexShrink: 0,
        backgroundColor: "#2b2b2b",
        color: "#fff",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        <img src={logo} alt="Logo" width={50} />
        <Box sx={{ fontSize: 12 }}>Menú</Box>
      </Box>

      {items.map((item) => (
        <Box
          key={item.id}
          component="button"
          type="button"
          onClick={() => onSelect?.(item.id)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "6px 10px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: 12,
            textAlign: "left",
            color: "#fff",
            backgroundColor: item.id === activo ? "#EC3333" : "transparent",
            "&:hover": {
              backgroundColor: item.id === activo ? "#EC3333" : "rgba(255,255,255,0.12)",
            },
          }}
        >
          {item.icon}
          {item.label}
        </Box>
      ))}
    </Box>
  );
};

export default Sidebar;