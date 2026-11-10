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

// Diálogo para que un cliente pase a ser vendedor. Los datos de empresa son opcionales:
// si escribe algo, deben ir el RUT y el nombre juntos; si no escribe nada, se omiten y los puede
// agregar después desde su perfil. Un vendedor también puede comprar, así que no pierde nada de lo que ya tenía.
//
// onGuardar(empresa) llama a la API; si falla, el mensaje se muestra dentro del diálogo.
const BecomeSellerDialog = ({ open, onClose, onGuardar }) => {
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
    const hayEmpresa = Boolean(form.rut.trim() || form.nombre.trim());
    if (hayEmpresa) {
      if (!isValidRut(form.rut)) {
        setError("Ingresa un RUT de empresa válido, por ejemplo 76.123.456-7.");
        return;
      }
      if (form.nombre.trim().length < 2) {
        setError("Ingresa el nombre de la empresa.");
        return;
      }
    }
    if (form.paginaWeb.trim() && !esUrlValida(form.paginaWeb)) {
      setError("La página web debe empezar con http:// o https://, por ejemplo https://mitienda.cl");
      return;
    }

    const empresa = {
      rut: limpiarRut(form.rut), // sin puntos y con guion, el formato que recibe la API
      nombre: form.nombre.trim(),
      giro: form.giro.trim(),
      paginaWeb: form.paginaWeb.trim(),
    };

    setError("");
    setGuardando(true);
    console.log("[Perfil] Convertir cuenta en vendedor:", empresa);

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
      <DialogTitle>Convertirme en vendedor</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "8px !important" }}>
        <span style={{ fontSize: 14, color: "#555" }}>
          Los datos de empresa son opcionales: puedes dejarlos en blanco y agregarlos después desde tu perfil.
          Seguirás pudiendo comprar como hasta ahora.
        </span>
        <TextField
          label="RUT de la empresa (opcional)"
          placeholder="76.123.456-7"
          size="small"
          value={form.rut}
          onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
          slotProps={{ htmlInput: { maxLength: 12 } }}
        />
        <TextField
          label="Nombre de la empresa (opcional)"
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
          {guardando ? "Guardando..." : "Convertirme en vendedor"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default BecomeSellerDialog;