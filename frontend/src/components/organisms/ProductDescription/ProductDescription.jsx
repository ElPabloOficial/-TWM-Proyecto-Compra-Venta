
import { Box } from "@mui/material";

export default function ProductDescription({
  product,
  type = "product",
}) {
  const isService = type === "service";

  return (
    <Box
      sx={{
        backgroundColor: "white",
        p: 2,
        mt: 1,
        borderRadius: 1,
      }}
    >
      <Box
        component="h2"
        sx={{
          fontSize: 16,
          m: 0,
          mb: 1,
        }}
      >
        {isService
          ? "Descripción del Servicio"
          : "Descripción del Producto"}
      </Box>

      <Box sx={{ fontSize: 13, color: "#333" }}>
        {product.descripcion}
      </Box>
    </Box>
  );
}
