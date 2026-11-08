import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CustomButton from "../../atoms/Button/CustomButton";

const MAX_NOMBRE = 50; // largo de Categoria.Nombre en la BD

/*
 * Formulario para crear o editar el nombre de una categoría.
 *   dialogo   -> null (cerrado) | { modo: "crear", padre } | { modo: "editar", categoria }
 *   hermanos  -> nombres de las otras categorías del mismo nivel, para no repetirlos
 *   onGuardar -> recibe el nombre y devuelve una promesa; si se rechaza, el mensaje se muestra aquí
 */
const CategoryFormDialog = ({ dialogo, hermanos = [], onClose, onGuardar }) => {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setNombre(dialogo?.modo === "editar" ? dialogo.categoria.nombre : "");
    setError("");
    setGuardando(false);
  }, [dialogo]);

  if (!dialogo) return null;

  const editando = dialogo.modo === "editar";

  const guardar = async () => {
    const limpio = nombre.trim();
    if (!limpio) {
      setError("Escribe un nombre para la categoría.");
      return;
    }
    if (hermanos.some((h) => h.trim().toLowerCase() === limpio.toLowerCase())) {
      setError("Ya existe una categoría con ese nombre en este nivel.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onGuardar(limpio);
    } catch (e) {
      setError(e.message);
      setGuardando(false);
    }
  };

  return (
    <Dialog open onClose={guardando ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {editando ? "Editar categoría" : "Nueva subcategoría"}
        {!editando && (
          <div style={{ fontSize: 13, fontWeight: 400, color: "#666", marginTop: 4 }}>
            Dentro de “{dialogo.padre.nombre}”
          </div>
        )}
      </DialogTitle>

      <DialogContent sx={{ paddingTop: "12px !important" }}>
        <TextField
          label="Nombre de la categoría"
          size="small"
          fullWidth
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guardar()}
          slotProps={{ htmlInput: { maxLength: MAX_NOMBRE } }}
          helperText={`${nombre.length}/${MAX_NOMBRE}`}
        />
        {error && <div style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}>{error}</div>}
      </DialogContent>

      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={onClose} disabled={guardando}>
          Cancelar
        </CustomButton>
        <CustomButton variant="primary" size="small" onClick={guardar} disabled={guardando} sx={{ border: "2px solid #EC3333" }}>
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;
