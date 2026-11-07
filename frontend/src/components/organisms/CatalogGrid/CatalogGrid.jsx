import Box from "@mui/material/Box";
import CatalogCard from "./CatalogCard";

const CatalogGrid = ({ items, onVerDetalle, onAgregar, vacio = "No se encontraron resultados con esos filtros." }) => {
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
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
      }}
    >
      {items.map((item) => (
        <CatalogCard key={item.clave ?? item.id} item={item} onVerDetalle={onVerDetalle} onAgregar={onAgregar} />
      ))}
    </Box>
  );
};

export default CatalogGrid;