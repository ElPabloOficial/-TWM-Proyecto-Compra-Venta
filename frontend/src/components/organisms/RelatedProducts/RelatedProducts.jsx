import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

export default function RelatedProducts({
  products = [],
  services = [],
}) {
  const navigate = useNavigate();

  const renderLista = (items, tipo) => {
    const isService = tipo === "service";

    return (
      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          pb: 2,
        }}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <Box
              key={`${tipo}-${item.id}`}
              onClick={() =>
                navigate(
                  isService
                    ? `/servicepage/${item.id}`
                    : `/productpage/${item.id}`
                )
              }
              sx={{
                flex: "0 0 160px",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                },
              }}
            >
              {/* IMAGEN */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 115,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    color: "#999",
                    gap: 0.5,
                  }}
                >
                  <ImageOutlinedIcon sx={{ fontSize: 32 }} />

                  <Typography sx={{ fontSize: 10 }}>
                    Imagen no disponible
                  </Typography>
                </Box>

                {item.imagen && (
                  <Box
                    component="img"
                    src={item.imagen}
                    alt={item.nombre}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      backgroundColor: "white",
                    }}
                  />
                )}
              </Box>

              {/* NOMBRE */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: "bold",
                  mt: 1,
                }}
              >
                {item.nombre}
              </Typography>

              {/* PRECIO */}
              <Typography
                sx={{
                  color: "#16A34A",
                  fontSize: 13,
                  fontWeight: "bold",
                  mt: 0.5,
                }}
              >
                ${Number(item.precio ?? 0).toLocaleString("es-CL")}
                {isService && " / hora"}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography sx={{ fontSize: 13, color: "#777" }}>
            No hay {isService ? "servicios" : "productos"} relacionados.
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        p: 2,
        mt: 1,
        borderRadius: 1,
      }}
    >
      {/* PRODUCTOS RELACIONADOS */}
      <Typography
        component="h2"
        sx={{
          fontSize: 16,
          fontWeight: "bold",
          mb: 2,
        }}
      >
        Productos relacionados
      </Typography>

      {renderLista(products, "product")}

      {/* SERVICIOS RELACIONADOS */}
      <Box sx={{ mt: 2 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: 16,
            fontWeight: "bold",
            mb: 2,
          }}
        >
          Servicios relacionados
        </Typography>

        {renderLista(services, "service")}
      </Box>
    </Box>
  );
}