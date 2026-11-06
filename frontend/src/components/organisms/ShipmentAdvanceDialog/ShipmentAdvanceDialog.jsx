import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CustomButton from "../../atoms/Button/CustomButton";
import { ETAPAS_DESPACHO, ETIQUETA_ESTADO, TRANSPORTISTAS } from "../../../services/despachoService";

/*
 * Ventana del vendedor para pasar un despacho a la etapa siguiente.
 * Para pasar a "Despachado" pide la empresa de transporte y el número de seguimiento.
 * `onConfirmar` debe devolver una promesa; si se rechaza, el mensaje se muestra en la ventana.
 */
const ShipmentAdvanceDialog = ({ despacho, onClose, onConfirmar }) => {
  const [transportista, setTransportista] = useState("");
  const [seguimiento, setSeguimiento] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setTransportista(despacho?.transportista ?? "");
    setSeguimiento(despacho?.seguimiento ?? "");
    setError("");
    setGuardando(false);
  }, [despacho]);

  if (!despacho) return null;

  const siguiente = ETAPAS_DESPACHO[ETAPAS_DESPACHO.indexOf(despacho.estado) + 1];
  const pideDatos = siguiente === "Despachado";

  const confirmar = async () => {
    if (pideDatos && (!transportista || !seguimiento.trim())) {
      setError("Elige la empresa de transporte e indica el número de seguimiento.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onConfirmar({ transportista, seguimiento });
    } catch (e) {
      setError(e.message);
      setGuardando(false);
    }
  };

  return (
    <Dialog open onClose={guardando ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Marcar como {ETIQUETA_ESTADO[siguiente].toLowerCase()}
        <div style={{ fontSize: 13, fontWeight: 400, color: "#666", marginTop: 4 }}>
          Pedido #{despacho.idVenta} · {despacho.cliente}
        </div>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "12px !important" }}>
        {pideDatos ? (
          <>
            <TextField
              select
              label="Empresa de transporte"
              size="small"
              value={transportista}
              onChange={(e) => setTransportista(e.target.value)}
            >
              {TRANSPORTISTAS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Número de seguimiento"
              size="small"
              value={seguimiento}
              onChange={(e) => setSeguimiento(e.target.value)}
            />
            <div style={{ fontSize: 12, color: "#777" }}>El cliente verá este número en el seguimiento de su pedido.</div>
          </>
        ) : (
          <div style={{ fontSize: 14 }}>
            El pedido pasará de <strong>{ETIQUETA_ESTADO[despacho.estado]}</strong> a{" "}
            <strong>{ETIQUETA_ESTADO[siguiente]}</strong> y el cliente lo verá en su seguimiento. Este cambio no se puede deshacer.
          </div>
        )}

        {error && <span style={{ color: "#EF4444", fontSize: 13 }}>{error}</span>}
      </DialogContent>

      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={onClose} disabled={guardando}>
          Cancelar
        </CustomButton>
        <CustomButton variant="primary" size="small" onClick={confirmar} disabled={guardando} sx={{ border: "2px solid #EC3333" }}>
          {guardando ? "Guardando..." : "Confirmar"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ShipmentAdvanceDialog;
