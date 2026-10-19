import Box from "@mui/material/Box";

const ROJO = "#EC3333";
const ROJO_SUAVE = "#FDE7E7";
const formatearPrecio = (numero) => `$${numero.toLocaleString("es-CL")}`;
const tarjeta = { border: "1px solid #E0E0E0", borderRadius: 2, padding: 2, backgroundColor: "#fff" };

const Fila = ({ etiqueta, valor, negrita }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: negrita ? 700 : 400, paddingY: 0.5 }}>
    <Box component="span">{etiqueta}</Box>
    <Box component="span">{valor}</Box>
  </Box>
);

// Muestra la sección que reciba por props:
//   items   -> tarjetas de producto
//   resumen -> resumen del pedido + medio de pago
const ConfirmPurchaseTable = ({ items, resumen, mediosPago, medioPago, onMedioPago }) => {
  return (
    <>
      {items &&
        items.map((i) => (
          <Box key={i.id} sx={{ ...tarjeta, display: "flex", gap: 2, alignItems: "flex-start" }}>
            {/* TEMPORAL: reemplazar por la imagen real del producto */}
            <Box sx={{ width: 80, height: 80, backgroundColor: "#D9D9D9", flexShrink: 0 }} />

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ fontSize: 16 }}>{i.nombre}</Box>
              <Box sx={{ fontSize: 12, color: "#666", marginTop: 0.5 }}>
                Vendido por {i.vendedor} · Cantidad: {i.cantidad}
              </Box>
            </Box>

            <Box sx={{ fontSize: 14 }}>{formatearPrecio(i.precio * i.cantidad)}</Box>
          </Box>
        ))}

      {resumen && (
        <Box sx={tarjeta}>
          <Box sx={{ fontSize: 13, marginBottom: 1 }}>Resumen del pedido</Box>

          <Fila etiqueta="Subtotal (neto)" valor={formatearPrecio(resumen.neto)} />
          <Fila etiqueta="IVA (19%)" valor={formatearPrecio(resumen.iva)} />
          <Fila etiqueta="Costo de envío" valor={formatearPrecio(resumen.envio)} />

          <Box sx={{ borderTop: "1px solid #E0E0E0", marginY: 1 }} />
          <Fila etiqueta="Total a pagar" valor={formatearPrecio(resumen.total)} negrita />
          <Box sx={{ borderTop: "1px solid #E0E0E0", marginY: 1 }} />

          <Box sx={{ fontSize: 13, fontWeight: 700, marginBottom: 1 }}>Medio de pago</Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {mediosPago.map((m) => {
              const activo = m.id === medioPago;
              return (
                <Box
                  key={m.id}
                  component="button"
                  type="button"
                  aria-pressed={activo}
                  onClick={() => onMedioPago(m.id)}
                  sx={{
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 1,
                    border: `1px solid ${activo ? ROJO : "#333"}`,
                    backgroundColor: activo ? ROJO_SUAVE : "#fff",
                  }}
                >
                  {m.label}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </>
  );
};

export default ConfirmPurchaseTable;