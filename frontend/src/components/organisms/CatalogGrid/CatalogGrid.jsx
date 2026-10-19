import Box from "@mui/material/Box";
import CatalogCard from "./CatalogCard";

const CatalogGrid = ({ items, onVerDetalle }) => {
  if (items.length === 0) {
    return (
      <Box sx={{ padding: 6, textAlign: "center", color: "#666" }}>
        No se encontraron resultados con esos filtros.
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
        <CatalogCard key={item.id} item={item} onVerDetalle={onVerDetalle} />
      ))}
    </Box>
  );
};

export default CatalogGrid;