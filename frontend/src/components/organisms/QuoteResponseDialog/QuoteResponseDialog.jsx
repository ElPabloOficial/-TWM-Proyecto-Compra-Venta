import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CustomButton from "../../atoms/Button/CustomButton";

const MAX_NOTA = 200;

const formatoPrecio = (monto) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(monto);

/*
 * Ventana del vendedor para una cotización.
 *  - Si está "Solicitada": el vendedor pone el precio unitario de cada ítem y un mensaje opcional.
 *  - Si ya fue respondida (o aceptada, o expiró): se muestra solo para consultar.
 * onEnviar({ prices, note }) debe devolver una promesa o nada; la ventana se cierra desde la pantalla.
 */
const QuoteResponseDialog = ({ quote, puedeResponder, onClose, onEnviar }) => {
  const [precios, setPrecios] = useState([]);
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quote) return;
    // Si el cliente dejó un precio de referencia, parte con ese valor
    setPrecios(quote.items.map((item) => (item.unitPrice > 0 ? String(item.unitPrice) : "")));
    setNota(quote.note ?? "");
    setError("");
  }, [quote]);

  if (!quote) return null;

  const valor = (texto) => Number(texto) || 0;
  const subtotal = quote.items.reduce(
    (suma, item, i) => suma + (puedeResponder ? valor(precios[i]) : item.unitPrice) * item.quantity,
    0
  );

  const cambiarPrecio = (indice) => (e) => {
    // Solo números enteros (pesos chilenos)
    const limpio = e.target.value.replace(/\D/g, "").slice(0, 9);
    setPrecios(precios.map((p, i) => (i === indice ? limpio : p)));
  };

  const enviar = () => {
    if (precios.some((p) => valor(p) <= 0)) {
      setError("Indica el precio unitario de todos los productos o servicios.");
      return;
    }
    onEnviar({ prices: precios.map(valor), note: nota });
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ paddingBottom: 0.5 }}>
        {puedeResponder ? "Responder cotización" : "Cotización"} #{quote.id}
        <div style={{ fontSize: 13, fontWeight: 400, color: "#666", marginTop: 4 }}>
          Cliente: {quote.client?.name ?? "—"}
        </div>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "16px !important" }}>
        {quote.items.map((item, i) => (
          <div
            key={item.name}
            style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}
          >
            <div style={{ flex: "1 1 180px" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: "#777" }}>Cantidad: {item.quantity}</div>
            </div>

            {puedeResponder ? (
              <TextField
                label="Precio unitario"
                size="small"
                value={precios[i] ?? ""}
                onChange={cambiarPrecio(i)}
                slotProps={{
                  input: { startAdornment: <span style={{ marginRight: 4, color: "#666" }}>$</span> },
                  htmlInput: { inputMode: "numeric" },
                }}
                sx={{ width: 170 }}
              />
            ) : (
              <div style={{ fontWeight: 700 }}>
                {item.unitPrice > 0 ? `${formatoPrecio(item.unitPrice)} c/u` : "Sin precio"}
              </div>
            )}
          </div>
        ))}

        <div style={{ borderTop: "1px solid #ddd", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600 }}>Subtotal (neto)</span>
          <span style={{ fontWeight: 700 }}>{formatoPrecio(subtotal)}</span>
        </div>
        <div style={{ fontSize: 12, color: "#777", marginTop: -8 }}>El cliente verá el IVA (19%) sumado a este valor.</div>

        {puedeResponder ? (
          <TextField
            label="Mensaje para el cliente (opcional)"
            size="small"
            multiline
            minRows={2}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            slotProps={{ htmlInput: { maxLength: MAX_NOTA } }}
            helperText={`${nota.length}/${MAX_NOTA}`}
          />
        ) : (
          quote.note && (
            <div style={{ fontSize: 13 }}>
              <strong>Tu mensaje:</strong> {quote.note}
            </div>
          )
        )}

        {puedeResponder && (
          <div style={{ fontSize: 12, color: "#777" }}>
            Al enviar, la cotización queda vigente por 15 días para que el cliente la acepte.
          </div>
        )}

        {error && <span style={{ color: "#EF4444", fontSize: 13 }}>{error}</span>}
      </DialogContent>

      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={onClose}>
          {puedeResponder ? "Cancelar" : "Cerrar"}
        </CustomButton>
        {puedeResponder && (
          <CustomButton variant="primary" size="small" onClick={enviar} sx={{ border: "2px solid #EC3333" }}>
            Enviar respuesta
          </CustomButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuoteResponseDialog;
