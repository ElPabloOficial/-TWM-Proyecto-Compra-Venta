import CloudOffIcon from "@mui/icons-material/CloudOff";
import CustomButton from "../../atoms/Button/CustomButton";

// Se muestra cuando la API no responde o rechaza la carga. En vez de una línea roja suelta
// ofrece un botón para reintentar. "detalle" es el mensaje técnico (opcional, en letra chica).
const ErrorState = ({ titulo = "No pudimos cargar los datos", detalle, onReintentar }) => (
  <div
    role="alert"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "28px 16px",
      margin: "16px 0",
      textAlign: "center",
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 8,
    }}
  >
    <CloudOffIcon style={{ color: "#9CA3AF", fontSize: 40 }} />
    <strong>{titulo}</strong>
    {detalle && <span style={{ fontSize: 12, color: "#6B7280", maxWidth: 520 }}>{detalle}</span>}
    {onReintentar && (
      <CustomButton
        variant="primary"
        size="small"
        onClick={onReintentar}
        sx={{ border: "2px solid #EC3333", marginTop: 1 }}
      >
        Reintentar
      </CustomButton>
    )}
  </div>
);

export default ErrorState;
