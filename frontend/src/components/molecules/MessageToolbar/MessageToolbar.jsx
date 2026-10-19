import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const MessageToolbar = ({ titulo, total, orden, onOrden, onVerTodos }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Box component="span" sx={{ fontWeight: 600 }}>{titulo}</Box>
        <Box component="span" sx={{ fontSize: 12, color: "#888" }}>{total} Mensajes</Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          component="span"
          onClick={onVerTodos}
          sx={{ color: "#EC3333", cursor: "pointer", fontSize: 13 }}
        >
          Ver Todos
        </Box>

        <Select
          size="small"
          displayEmpty
          value={orden}
          onChange={(e) => onOrden(e.target.value)}
          sx={{ fontSize: 13 }}
        >
          <MenuItem value="">Ordenar</MenuItem>
          <MenuItem value="fechaDesc">Más recientes</MenuItem>
          <MenuItem value="fechaAsc">Más antiguos</MenuItem>
          <MenuItem value="cliente">Cliente (A-Z)</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default MessageToolbar;