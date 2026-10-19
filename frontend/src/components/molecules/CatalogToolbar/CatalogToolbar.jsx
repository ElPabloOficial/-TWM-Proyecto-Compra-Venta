import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const ROJO = "#EC3333";

const campos = [
  { nombre: "categoria", titulo: "Categoría" },
  { nombre: "precio", titulo: "Precio" },
  { nombre: "ubicacion", titulo: "Ubicación" },
  { nombre: "estado", titulo: "Estado" },
  { nombre: "orden", titulo: "Ordenar por" },
]; // selectores de filtros

const CatalogToolbar = ({ filtros, opciones, onCambio, onAplicar, onLimpiar }) => {
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
      {campos.map((c) => (
        <Select
          key={c.nombre}
          size="small"
          displayEmpty
          value={filtros[c.nombre]}
          onChange={(e) => onCambio(c.nombre, e.target.value)}
          sx={{ fontSize: 13, minWidth: 130 }}
        >
          <MenuItem value="">{c.titulo}</MenuItem>
          {opciones[c.nombre].map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </Select>
      ))}

      <Box sx={{ marginLeft: "auto", display: "flex", gap: 1.5 }}>
        <Button variant="outlined" size="small" onClick={onLimpiar} sx={{ color: "#000", borderColor: "#999" }}>
          Limpiar filtros
        </Button>
        <Button
          variant="contained"
          size="small"
          disableElevation
          onClick={onAplicar}
          sx={{ backgroundColor: ROJO, "&:hover": { backgroundColor: "#D42B2B" } }}
        >
          Aplicar filtros
        </Button>
      </Box>
    </Box>
  );
};

export default CatalogToolbar;