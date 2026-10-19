import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";

const AdminUserTools = ({ busqueda, onBusqueda, tipo, onTipo, estado, onEstado }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", marginBottom: 2 }}>
      <TextField
        size="small"
        placeholder="Buscar usuario por nombre o rut"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        sx={{ minWidth: 280 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Select size="small" displayEmpty value={tipo} onChange={(e) => onTipo(e.target.value)} sx={{ fontSize: 13 }}>
        <MenuItem value="">Tipo: Todos</MenuItem>
        <MenuItem value="vendedor">Vendedor</MenuItem>
        <MenuItem value="cliente">Cliente</MenuItem>
      </Select>

      <Select size="small" displayEmpty value={estado} onChange={(e) => onEstado(e.target.value)} sx={{ fontSize: 13 }}>
        <MenuItem value="">Estado: Todos</MenuItem>
        <MenuItem value="activo">Activo</MenuItem>
        <MenuItem value="inactivo">Inactivo</MenuItem>
      </Select>
    </Box>
  );
};

export default AdminUserTools;