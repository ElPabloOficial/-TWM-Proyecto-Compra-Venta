import { useEffect, useRef } from "react";
import Skeleton from "@mui/material/Skeleton";
// import CloudOffIcon from "@mui/icons-material/CloudOff";
// import CustomButton from "../../atoms/Button/CustomButton";

const REINTENTO_AUTOMATICO_MS = 5000;

// Antes mostraba un recuadro con el mensaje de error y un botón "Reintentar".
// Ahora no muestra ningún mensaje: deja un esqueleto gris (como al cargar) y reintenta sola
// cada 5 segundos hasta que la API responda.

const ErrorState = ({ titulo = "No pudimos cargar los datos", detalle, onReintentar }) => {
  // Se guarda la última función de reintento para que el temporizador no se reinicie en cada render
  const reintentarRef = useRef(onReintentar);
  useEffect(() => {
    reintentarRef.current = onReintentar;
  }, [onReintentar]);

  useEffect(() => {
    const temporizador = setTimeout(() => reintentarRef.current?.(), REINTENTO_AUTOMATICO_MS);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <div role="status" aria-label="Cargando" style={{ margin: "16px 0" }}>
      <Skeleton animation="wave" variant="rounded" height={120} />
      <Skeleton animation="wave" variant="text" width="90%" style={{ marginTop: 12 }} />
      <Skeleton animation="wave" variant="text" width="60%" />
    </div>
  );

  /* --- MENSAJE DE ERROR ---
  return (
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
  */
};

export default ErrorState;