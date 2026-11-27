import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CustomButton from "../../atoms/Button/CustomButton";
import formatRut, { isValidRut } from "../../../services/format";
import { limpiarRut } from "../../../services/authService";
import { esUrlValida } from "../../../services/validaciones";

const vacio = { rut: "", nombre: "", giro: "", paginaWeb: "" };

// Diálogo para agregar otra empresa al vendedor. Reutiliza la misma validación
// y estilo que BecomeSellerDialog para mantener consistencia.
//
// onGuardar(empresa) llama a la API; si falla, el mensaje se muestra dentro del diálogo.
const AddCompanyDialog = ({ open, onClose, onGuardar }) => {
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cerrar = () => {
    if (guardando) return;
    setForm(vacio);
    setError("");
    onClose();
  };

  const handleGuardar = async () => {
    if (!isValidRut(form.rut)) {
      setError("Ingresa un RUT de empresa válido, por ejemplo 76.123.456-7.");
      return;
    }
    if (form.nombre.trim().length < 2) {
      setError("Ingresa el nombre de la empresa.");
      return;
    }
    if (form.paginaWeb.trim() && !esUrlValida(form.paginaWeb)) {
      setError("La página web debe empezar con http:// o https://, por ejemplo https://mitienda.cl");
      return;
    }

    const empresa = {
      rut: limpiarRut(form.rut),
      nombre: form.nombre.trim(),
      giro: form.giro.trim(),
      paginaWeb: form.paginaWeb.trim(),
    };

    setError("");
    setGuardando(true);

    try {
      await onGuardar(empresa);
      setForm(vacio);
    } catch (e) {
      setError(e.message);
    }
    setGuardando(false);
  };

  return (
    <Dialog open={open} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>Agregar otra empresa</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "8px !important" }}>
        <span style={{ fontSize: 14, color: "#555" }}>
          Completa los datos de la nueva empresa. El RUT y el nombre son obligatorios.
        </span>
        <TextField
          label="RUT de la empresa"
          placeholder="76.123.456-7"
          size="small"
          value={form.rut}
          onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
          slotProps={{ htmlInput: { maxLength: 12 } }}
        />
        <TextField
          label="Nombre de la empresa"
          size="small"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <TextField
          label="Giro comercial (opcional)"
          size="small"
          value={form.giro}
          onChange={(e) => setForm({ ...form, giro: e.target.value })}
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <TextField
          label="Página web (opcional)"
          placeholder="https://mitienda.cl"
          size="small"
          value={form.paginaWeb}
          onChange={(e) => setForm({ ...form, paginaWeb: e.target.value })}
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        {error && <span style={{ color: "#EF4444", fontSize: 13 }}>{error}</span>}
      </DialogContent>
      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={cerrar} disabled={guardando}>
          Cancelar
        </CustomButton>
        <CustomButton variant="primary" size="small" onClick={handleGuardar} disabled={guardando} sx={{ border: "2px solid #EC3333" }}>
          {guardando ? "Guardando..." : "Agregar empresa"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddCompanyDialog;
