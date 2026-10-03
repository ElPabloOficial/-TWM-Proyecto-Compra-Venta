import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const ProductToolbar = ({ total, orden, onOrden, filtro, onFiltro, onVerTodos }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        padding: "4px 12px",
        marginBottom: 1,
      }}
    >
      <Box>
        <b>Productos</b>
        <Box component="span" sx={{ fontSize: 11, marginLeft: 1 }}>
          {total} productos
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          size="small"
          onClick={onVerTodos}
          sx={{ color: "#EC3333", textTransform: "none", fontWeight: 700 }}
        >
          Ver Todos
        </Button>

        <Select
          size="small"
          variant="standard"
          disableUnderline
          displayEmpty
          value={orden}
          onChange={(e) => onOrden(e.target.value)}
          sx={{ fontSize: 14, fontWeight: 700 }}
        >
          <MenuItem value="">Ordenar</MenuItem>
          <MenuItem value="nombre">Nombre (A-Z)</MenuItem>
          <MenuItem value="precioAsc">Precio: menor a mayor</MenuItem>
          <MenuItem value="precioDesc">Precio: mayor a menor</MenuItem>
          <MenuItem value="stockAsc">Stock: menor a mayor</MenuItem>
          <MenuItem value="stockDesc">Stock: mayor a menor</MenuItem>
        </Select>

        <Select
          size="small"
          variant="standard"
          disableUnderline
          displayEmpty
          value={filtro}
          onChange={(e) => onFiltro(e.target.value)}
          sx={{ fontSize: 14, fontWeight: 700 }}
        >
          <MenuItem value="">Filtros</MenuItem>
          <MenuItem value="oferta">En oferta</MenuItem>
          <MenuItem value="bajo">Stock bajo (3 o menos)</MenuItem>
          <MenuItem value="sin">Sin stock</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default ProductToolbar;