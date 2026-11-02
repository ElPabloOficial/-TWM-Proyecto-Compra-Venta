import { Box } from "@mui/material";

import CustomButton from "../../atoms/Button/CustomButton";

const ReturnRequest = ({
  id,
  product,
  order,
  customer,
  quantity,
  price,
  reason, 
  status,
  refund,
  image,
  onStatusChange,
  actualizandoId,
}) => {
  const approved = status === "Aprobada";
  const rejected = status === "Rechazada";
  const procesando = actualizandoId === id;

  return (
    <Box
      sx={{
        width: "100%",
        border: "1px solid #e5e5e5",
        borderRadius: "6px",
        padding: "10px",
        marginBottom: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* Información del producto */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        
        {/* Imagen de evidencia */}
        <Box
          sx={{
            width: "90px",
            height: "90px",
            backgroundColor: "#f0f0f0",
            marginRight: "12px",
            flexShrink: 0,
            borderRadius: "5px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image ? (
            <Box
              component="img"
              src={image}
              alt="Evidencia de devolución"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Box
              sx={{
                fontSize: "10px",
                color: "#888",
                textAlign: "center",
                padding: "5px",
              }}
            >
              Sin evidencia
            </Box>
          )}
        </Box>

        {/* Información */}
        <Box>
          <Box
            component="h2"
            sx={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {product}
          </Box>

          <Box
            component="p"
            sx={{
              margin: "3px 0 0",
              fontSize: "9px",
              color: "#666",
            }}
          >
            Pedido {order} · {customer} · {quantity} · {price}
          </Box>
        </Box>

        {/* Estado */}
        <Box
          sx={{
            position: "absolute",
            right: "5px",
            top: "3px",
            padding: "3px 8px",
            borderRadius: "3px",
            backgroundColor: approved ? "#dff5e6" : "#fff0e5",
            color: approved ? "#16a34a" : "#f97316",
            fontSize: "9px",
          }}
        >
          {status}
        </Box>
      </Box>

      {/* Motivo */}
      <Box
        sx={{
          marginTop: "12px",
          border: "1px solid #999",
          borderRadius: "3px",
          padding: "4px 6px",
          fontSize: "9px",
        }}
      >
        Motivo: {reason}
      </Box>

      {/* Botones */}
      {status === "En Proceso" && (
        <Box
          sx={{
            display: "flex",
            gap: "30px",
            marginTop: "16px",
          }}
        >
          <CustomButton
            variant="approve"
            disabled={procesando}
            onClick={() => onStatusChange(id, "Aprobada")}
          >
            {procesando ? "Guardando..." : "Aprobar"}
          </CustomButton>
        
          <CustomButton
            variant="reject"
            disabled={procesando}
            onClick={() => onStatusChange(id, "Rechazada")}
          >
            {procesando ? "Guardando..." : "Rechazar"}
          </CustomButton>
        </Box>
      )}

      {/* Reembolso */}
      {refund && (
        <Box
          component="p"
          sx={{
            margin: "14px 0 0",
            fontSize: "11px",
            color: "#666",
          }}
        >
          {refund}
        </Box>
      )}
    </Box>
  );
};

export default ReturnRequest;
