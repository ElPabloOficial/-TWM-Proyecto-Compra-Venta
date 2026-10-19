import Box from "@mui/material/Box";

const ROJO = "#EC3333";
const ROJO_SUAVE = "#FDE7E7";
const formatearPrecio = (numero) => `$${numero.toLocaleString("es-CL")}`;
const tarjeta = { border: "1px solid #E0E0E0", borderRadius: 2, padding: 2, backgroundColor: "#fff" };

const ConfirmPurchaseTools = ({ direccion, onCambiarDireccion, opcionesEnvio, opcionEnvio, onOpcionEnvio }) => {
  return (
    <>
      {/* Dirección */}
      <Box sx={tarjeta}>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <Box component="span">Enviar a</Box>
          <Box component="span" onClick={onCambiarDireccion} sx={{ color: ROJO, cursor: "pointer" }}>
            Cambiar dirección
          </Box>
        </Box>
        <Box sx={{ fontSize: 12, color: "#666", marginTop: 1 }}>{direccion}</Box>
      </Box>

      {/* Opciones de envío */}
      <Box sx={tarjeta}>
        <Box sx={{ fontSize: 13, marginBottom: 1.5 }}>Opciones de envío disponibles</Box>

        {opcionesEnvio.map((o) => {
          const activa = o.id === opcionEnvio;
          return (
            <Box
              key={o.id}
              component="button"
              type="button"
              aria-pressed={activa}
              onClick={() => onOpcionEnvio(o.id)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 1.5,
                marginBottom: 1,
                borderRadius: 1,
                border: `1px solid ${activa ? ROJO : "#E0E0E0"}`,
                backgroundColor: activa ? ROJO_SUAVE : "#fff",
              }}
            >
              <Box>
                <Box sx={{ fontSize: 14 }}>{o.nombre}</Box>
                <Box sx={{ fontSize: 12, color: "#666" }}>{o.detalle}</Box>
              </Box>
              <Box sx={{ fontSize: 13 }}>{formatearPrecio(o.precio)}</Box>
            </Box>
          );
        })}

        <Box sx={{ fontSize: 11, color: "#888" }}>
          Calculado automáticamente por el emprendedor según tu comuna de despacho.
        </Box>
      </Box>
    </>
  );
};

export default ConfirmPurchaseTools;