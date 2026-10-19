
import { Box } from "@mui/material";

import CustomButton from "../../atoms/Button/CustomButton";
import CustomIconButton from "../../atoms/IconButton/CustomIconButton";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function ProductInfo({
  type = "product",
  product,
  quantity,
  aumentarCantidad,
  disminuirCantidad,
  date,
  setDate,
  time,
  setTime,
}) {
  const isService = type === "service";

  const inputSx = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: 12,
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "white",
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        p: 3,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, md: 5 },
        minHeight: 280,
      }}
    >
      {/* IMAGEN */}
      <Box
        sx={{
          width: { xs: "100%", md: "45%" },
          minHeight: 220,
          backgroundColor: "#d9d9d9",
          flexShrink: 0,
        }}
      />

      {/* INFORMACIÓN */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* NOMBRE */}
        <Box
          component="h1"
          sx={{
            fontSize: 20,
            m: 0,
            fontWeight: "bold",
          }}
        >
          {product.nombre}
        </Box>

        {/* RATING */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ color: "#F5B400" }}>★★★★★</Box>

          <Box>{product.rating}</Box>

          <Box sx={{ color: "#777", fontSize: 12 }}>
            ({product.cantidadResenas} reseñas de clientes)
          </Box>
        </Box>

        {/* RESTRICCIÓN DE EDAD PARA SERVICIOS */}
        {isService && product.mayoresEdad && (
          <Box sx={{ fontSize: 13, mt: 2 }}>
            Servicio apto solo para mayores de 18 años
          </Box>
        )}

        {/* PRECIO */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 1,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              color: "#16A34A",
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            ${product.precio.toLocaleString("es-CL")}
            {isService && (
              <Box
                component="span"
                sx={{ fontSize: 13, fontWeight: "normal" }}
              >
                {" "}la hora
              </Box>
            )}
          </Box>

          {!isService && product.precioAnterior != null && (
            <Box
              sx={{
                color: "#777",
                fontSize: 12,
                textDecoration: "line-through",
              }}
            >
              ${product.precioAnterior.toLocaleString("es-CL")}
            </Box>
          )}
        </Box>

        {/* STOCK PARA PRODUCTOS */}
        {!isService && (
          <Box
            sx={{
              color: "#16A34A",
              fontSize: 13,
              mt: 1,
            }}
          >
            Stock disponible ({product.stock} unidades)
          </Box>
        )}

        {/* CONTROLES: DEBAJO DEL PRECIO */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            mt: 3,
            flexWrap: "wrap",
          }}
        >
          {/* CANTIDAD DE UNIDADES U HORAS */}
          <Box sx={{ minWidth: 85 }}>
            <Box sx={{ fontSize: 12, mb: 0.5 }}>
              {isService ? "Cantidad de horas" : "Cantidad"}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CustomIconButton
                onClick={disminuirCantidad}
                ariaLabel="Disminuir cantidad"
              >
                <RemoveIcon />
              </CustomIconButton>

              <Box sx={{ minWidth: 12, textAlign: "center" }}>
                {quantity}
              </Box>

              <CustomIconButton
                onClick={aumentarCantidad}
                ariaLabel="Aumentar cantidad"
              >
                <AddIcon />
              </CustomIconButton>
            </Box>
          </Box>

          {/* FECHA Y HORARIO SOLO PARA SERVICIOS */}
          {isService && (
            <>
              <Box sx={{ flex: 1, minWidth: 105 }}>
                <Box sx={{ fontSize: 12, mb: 0.5 }}>
                  Fecha
                </Box>

                <Box
                  component="input"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  sx={inputSx}
                  aria-label="Fecha del servicio"
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 90 }}>
                <Box sx={{ fontSize: 12, mb: 0.5 }}>
                  Horario
                </Box>

                <Box
                  component="input"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  sx={inputSx}
                  aria-label="Horario del servicio"
                />
              </Box>
            </>
          )}
        </Box>

        {/* BOTONES DEBAJO DE LOS CONTROLES */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            flexWrap: "wrap",
          }}
        >
          <CustomButton
            sx={{ flex: "1 1 130px" }}
            onClick={() => {
              if (isService && (!date || !time)) {
                console.log("Selecciona la fecha y el horario.");
                return;
              }

              console.log("Agregar al carrito:", {
                tipo: type,
                id: product.id,
                cantidad: quantity,
                fecha: isService ? date : null,
                horario: isService ? time : null,
              });
            }}
          >
            Agregar al Carrito
          </CustomButton>

          <CustomButton
            variant="tertiary"
            sx={{ flex: "1 1 145px" }}
            onClick={() => {
              console.log("Solicitar cotización:", {
                tipo: type,
                id: product.id,
                cantidad: quantity,
              });
            }}
          >
            Solicitar Cotización
          </CustomButton>

          <CustomIconButton
            ariaLabel="Agregar a favoritos"
            onClick={() => {
              console.log("Agregar a favoritos:", product.id);
            }}
          >
            <FavoriteBorderIcon />
          </CustomIconButton>
        </Box>
      </Box>
    </Box>
  );
}
