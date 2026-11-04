import { createContext, useCallback, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

/*
 * Notificaciones flotantes (toast).
 *
 * Uso en cualquier pantalla:
 *   const { mostrarToast } = useToast();
 *   mostrarToast("Producto actualizado correctamente");          // verde (éxito)
 *   mostrarToast("No se pudo guardar", "error");                 // rojo
 *
 * El proveedor vive por encima de las rutas, así que el mensaje sigue visible
 * aunque la pantalla cambie justo después (por ejemplo al volver al inventario).
 */

const ToastContext = createContext(null);

const COLORES = {
  success: "#16A34A",
  error: "#EF4444",
  info: "#000000",
  warning: "#EC3333",
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ abierto: false, mensaje: "", tipo: "success", id: 0 });

  const mostrarToast = useCallback((mensaje, tipo = "success") => {
    setToast((anterior) => ({ abierto: true, mensaje, tipo, id: anterior.id + 1 }));
  }, []);

  const cerrar = (_, motivo) => {
    if (motivo === "clickaway") return; // solo se cierra solo o con la X
    setToast((anterior) => ({ ...anterior, abierto: false }));
  };

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <Snackbar
        key={toast.id}
        open={toast.abierto}
        autoHideDuration={3500}
        onClose={cerrar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={cerrar}
          severity={toast.tipo}
          variant="filled"
          sx={{
            width: "100%",
            minWidth: 280,
            alignItems: "center",
            fontWeight: 600,
            borderRadius: 0,
            backgroundColor: COLORES[toast.tipo],
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          }}
        >
          {toast.mensaje}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
};
