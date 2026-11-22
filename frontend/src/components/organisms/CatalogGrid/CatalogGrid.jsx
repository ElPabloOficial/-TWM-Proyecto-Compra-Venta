import Box from "@mui/material/Box";
import CatalogCard from "./CatalogCard";

// vista: "cuadricula" (4 por fila) o "lista" (una tarjeta horizontal por fila)
const CatalogGrid = ({
  items,
  onVerDetalle,
  onAgregar,
  vista = "cuadricula",
  vacio = "No se encontraron resultados con esos filtros.",
}) => {
  if (items.length === 0) {
    return (
      <Box sx={{ padding: 6, textAlign: "center", color: "#666" }}>
        {vacio}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns:
          vista === "lista"
            ? "1fr"
            : { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
      }}
    >
      {items.map((item) => (
        <CatalogCard
          key={item.clave ?? item.id}
          item={item}
          vista={vista}
          onVerDetalle={onVerDetalle}
          onAgregar={onAgregar}
        />
      ))}
    </Box>
  );
};

export default CatalogGrid;