import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

const ROJO = "#EC3333";

// La categoría se elige en el menú "Categorías" del Header (llega como /catalogo?categoria=ID)
// y se muestra como una etiqueta sobre los resultados, por eso no hay selector aquí.
// Cada selector lleva su título visible y una primera opción que significa "sin filtro".
// Los filtros se aplican al cambiarlos: no hace falta un botón "Aplicar".

const Selector = ({ nombre, titulo, sinFiltro, valor, opciones, onChange, ocultas = [] }) => (
  <FormControl size="small" sx={{ minWidth: 170 }}>
    <InputLabel shrink id={`catalogo-${nombre}-etiqueta`}>
      {titulo}
    </InputLabel>
    <Select
      labelId={`catalogo-${nombre}-etiqueta`}
      label={titulo}
      notched
      displayEmpty
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      sx={{ fontSize: 13 }}
    >
      <MenuItem value="">{sinFiltro}</MenuItem>
      {opciones.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
      {/* Opciones que solo se muestran como valor actual (por ejemplo "Personalizado"), no se pueden elegir */}
      {ocultas.map((o) => (
        <MenuItem key={o.value} value={o.value} sx={{ display: "none" }}>
          {o.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const CampoPrecio = ({ titulo, valor, error, onChange }) => (
  <TextField
    size="small"
    label={titulo}
    value={valor}
    error={error}
    onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
    slotProps={{
      inputLabel: { shrink: true },
      input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
      htmlInput: { inputMode: "numeric", "aria-label": `Precio ${titulo.toLowerCase()}` },
    }}
    sx={{ width: 120, "& input": { fontSize: 13 } }}
  />
);

const CatalogToolbar = ({
  filtros,
  opciones,
  rangoPrecio, // id del atajo que coincide con el mínimo y máximo escritos ("" si no hay, "personalizado" si son otros)
  errorRango,
  etiquetaOrdenBase,
  onCambio,
  onCambios,
  onElegirRango,
  onLimpiar,
  hayFiltros,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
      <Selector
        nombre="estado"
        titulo="Tipo"
        sinFiltro="Todos"
        valor={filtros.estado}
        opciones={opciones.estado}
        onChange={(v) => onCambio("estado", v)}
      />

      {/* Atajos de precio: llenan el mínimo y el máximo, que también se pueden escribir a mano */}
      <Selector
        nombre="precio"
        titulo="Rango de precio"
        sinFiltro="Cualquier precio"
        valor={rangoPrecio}
        opciones={opciones.precio}
        ocultas={[{ value: "personalizado", label: "Personalizado" }]}
        onChange={onElegirRango}
      />
      <CampoPrecio titulo="Mínimo" valor={filtros.precioMin} error={errorRango} onChange={(v) => onCambio("precioMin", v)} />
      <CampoPrecio titulo="Máximo" valor={filtros.precioMax} error={errorRango} onChange={(v) => onCambio("precioMax", v)} />

      <Selector
        nombre="orden"
        titulo="Ordenar por"
        sinFiltro={etiquetaOrdenBase}
        valor={filtros.orden}
        opciones={opciones.orden}
        onChange={(v) => onCambio("orden", v)}
      />

      {/* "En oferta" es un filtro aparte del tipo: se puede ver, por ejemplo, solo los productos en oferta */}
      <FormControlLabel
        control={
          <Switch
            checked={filtros.oferta}
            onChange={(e) => onCambio("oferta", e.target.checked)}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: ROJO },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: ROJO },
            }}
          />
        }
        label="Solo en oferta"
        sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
      />

      <Box sx={{ marginLeft: "auto" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onLimpiar}
          disabled={!hayFiltros}
          sx={{ color: "#000", borderColor: "#999" }}
        >
          Limpiar filtros
        </Button>
      </Box>
    </Box>
  );
};

export default CatalogToolbar;