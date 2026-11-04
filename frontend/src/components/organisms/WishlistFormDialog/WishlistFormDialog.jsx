import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import CustomButton from "../../atoms/Button/CustomButton";

const MAX_NOMBRE = 50;
const MAX_DESCRIPCION = 150;

const vacio = { nombre: "", descripcion: "", visibilidad: "privada" };

const radioRojo = {
  color: "#EC3333",
  "&.Mui-checked": { color: "#EC3333" },
};

/*
 * Formulario para crear una lista de deseos.
 * `nombres` son los nombres de las listas que ya existen, para no repetirlos.
 * `onGuardar` debe devolver una promesa; si se rechaza, el mensaje se muestra en el formulario.
 */
const WishlistFormDialog = ({ open, nombres = [], onClose, onGuardar }) => {
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setForm(vacio);
    setError("");
    setGuardando(false);
  }, [open]);

  const handleChange = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const handleGuardar = async () => {
    const nombre = form.nombre.trim();

    if (!nombre) {
      setError("Escribe un nombre para la lista.");
      return;
    }
    if (nombres.some((n) => n.trim().toLowerCase() === nombre.toLowerCase())) {
      setError("Ya tienes una lista con ese nombre.");
      return;
    }

    setError("");
    setGuardando(true);
    try {
      await onGuardar({
        nombre,
        descripcion: form.descripcion.trim(),
        publica: form.visibilidad === "publica",
      });
    } catch (e) {
      setError(e.message);
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={guardando ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nueva lista de deseos</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "8px !important" }}>
        <TextField
          label="Nombre de la lista"
          size="small"
          autoFocus
          value={form.nombre}
          onChange={handleChange("nombre")}
          slotProps={{ htmlInput: { maxLength: MAX_NOMBRE } }}
          helperText={`${form.nombre.length}/${MAX_NOMBRE}`}
        />

        <TextField
          label="Descripción (opcional)"
          size="small"
          multiline
          minRows={2}
          value={form.descripcion}
          onChange={handleChange("descripcion")}
          slotProps={{ htmlInput: { maxLength: MAX_DESCRIPCION } }}
          helperText={`${form.descripcion.length}/${MAX_DESCRIPCION}`}
        />

        <FormControl>
          <FormLabel sx={{ fontSize: 13, color: "#000 !important", fontWeight: 700 }}>¿Quién puede ver esta lista?</FormLabel>
          <RadioGroup value={form.visibilidad} onChange={handleChange("visibilidad")}>
            <FormControlLabel
              value="privada"
              control={<Radio size="small" sx={radioRojo} />}
              label={
                <span>
                  <strong>Privada</strong>
                  <br />
                  <span style={{ fontSize: 12, color: "#666" }}>Solo tú puedes verla.</span>
                </span>
              }
              sx={{ alignItems: "flex-start", marginTop: 0.5 }}
            />
            <FormControlLabel
              value="publica"
              control={<Radio size="small" sx={radioRojo} />}
              label={
                <span>
                  <strong>Pública</strong>
                  <br />
                  <span style={{ fontSize: 12, color: "#666" }}>Cualquier persona con el enlace puede verla.</span>
                </span>
              }
              sx={{ alignItems: "flex-start", marginTop: 0.5 }}
            />
          </RadioGroup>
        </FormControl>

        {error && <span style={{ color: "#EF4444", fontSize: 13 }}>{error}</span>}
      </DialogContent>

      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={onClose} disabled={guardando}>
          Cancelar
        </CustomButton>
        <CustomButton variant="primary" size="small" onClick={handleGuardar} disabled={guardando} sx={{ border: "2px solid #EC3333" }}>
          {guardando ? "Guardando..." : "Crear lista"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default WishlistFormDialog;
