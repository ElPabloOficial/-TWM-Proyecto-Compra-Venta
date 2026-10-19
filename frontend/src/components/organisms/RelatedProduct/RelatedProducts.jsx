
import { Box } from "@mui/material";

export default function RelatedProducts({
  products,
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
          mb: 2,
        }}
      >
        {isService
          ? "Servicios Relacionados"
          : "Productos Relacionados"}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          pb: 1,
        }}
      >
        {products.map((item) => (
          <Box
            key={item.id}
            sx={{
              flex: "0 0 150px",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: 110,
                backgroundColor: "#d9d9d9",
                borderRadius: 1,
              }}
            />

            <Box
              sx={{
                fontSize: 12,
                fontWeight: "bold",
                mt: 1,
              }}
            >
              {item.nombre}
            </Box>

            <Box
              sx={{
                color: "#16A34A",
                fontSize: 13,
                fontWeight: "bold",
                mt: 0.5,
              }}
            >
              ${item.precio.toLocaleString("es-CL")}
              {isService && " / hora"}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
