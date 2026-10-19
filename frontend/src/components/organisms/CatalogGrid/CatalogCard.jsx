import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

const ROJO = "#EC3333";
const formatearPrecio = (numero) => `$${numero.toLocaleString("es-CL")}`;

const CatalogCard = ({ item, onVerDetalle }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #E0E0E0",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {item.imagen ? (
        <Box component="img" src={item.imagen} alt={item.nombre} sx={{ width: "100%", height: 160, objectFit: "cover" }} />
      ) : (
        <Box sx={{ width: "100%", height: 160, backgroundColor: "#E5E7EB" }} />
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, padding: 1.5, flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {item.etiqueta ? (
            <Chip label={item.etiqueta} size="small" sx={{ backgroundColor: ROJO, color: "#fff", fontSize: 11, height: 20 }} />
          ) : (
            <Box />
          )}
          <Box sx={{ fontSize: 11, color: "#666" }}>{item.ubicacion}</Box>
        </Box>

        <Box sx={{ fontSize: 16, fontWeight: 700 }}>{item.nombre}</Box>

        <Box
          sx={{
            fontSize: 12,
            color: "#666",
            minHeight: 34,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.descripcion}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 1 }}>
          <Box sx={{ fontSize: 18, fontWeight: 700 }}>{formatearPrecio(item.precio)}</Box>
          <Button
            variant="contained"
            size="small"
            disableElevation
            onClick={() => onVerDetalle(item)}
            sx={{ backgroundColor: ROJO, "&:hover": { backgroundColor: "#D42B2B" } }}
          >
            Ver detalle
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CatalogCard;