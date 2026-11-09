import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CustomButton from "../../atoms/Button/CustomButton";
import formatRut, { isValidRut } from "../../../services/format";
import { limpiarRut } from "../../../services/authService";
import { soloLetras, esNombreValido, esCorreoValido } from "../../../services/validaciones";

const vacio = {
  rut: "",
  nombre: "",
  correo: "",
  clave: "",
  fechaNacimiento: "",
  tipo: "cliente",
};

const hoyISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Escribe la fecha como dd/mm/aaaa: agrega las barras solas mientras se teclean los números
const aplicarMascaraFecha = (texto) => {
  const d = texto.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

// "25/12/1999" -> "1999-12-25". Devuelve null si no es una fecha real.
const fechaAISO = (texto) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const [, dd, mm, aaaa] = m;
  const fecha = new Date(Number(aaaa), Number(mm) - 1, Number(dd));
  const esReal =
    fecha.getFullYear() === Number(aaaa) &&
    fecha.getMonth() === Number(mm) - 1 &&
    fecha.getDate() === Number(dd);
  return esReal && Number(aaaa) >= 1940 ? `${aaaa}-${mm}-${dd}` : null;
};

const normalizarRut = (rut) => rut.trim().replace(/\./g, "").toLowerCase();


/*
 * Formulario para crear un usuario desde el panel de administración.
 * `ruts` es la lista de RUT ya registrados, para avisar si se repite.
 * `onGuardar` debe devolver una promesa; si se rechaza, el mensaje se muestra en el formulario.
 * No tiene campo "Estado": la API lo calcula (Activo = tiene la sesión iniciada).
 */
const UserFormDialog = ({ open, ruts = [], onClose, onGuardar }) => {
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setForm(vacio);
    setError("");
    setGuardando(false);
  }, [open]);

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  const handleGuardar = async () => {
    const rut = form.rut.trim();

    if (!rut || !form.nombre.trim() || !form.correo.trim() || !form.clave || !form.fechaNacimiento) {
      setError("Rut, nombre, correo, contraseña y fecha de nacimiento son obligatorios.");
      return;
    }
    if (!isValidRut(rut)) {
      setError("Ingresa un RUT válido, por ejemplo 12.345.678-5.");
      return;
    }
    if (!esNombreValido(form.nombre)) {
      setError("El nombre solo puede tener letras y debe tener al menos 3 caracteres.");
      return;
    }
    if (ruts.some((r) => normalizarRut(r) === normalizarRut(rut))) {
      setError("Ya existe un usuario con ese RUT.");
      return;
    }
    if (!esCorreoValido(form.correo)) {
      setError("El correo electrónico no es válido.");
      return;
    }
    if (form.clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const fechaISO = fechaAISO(form.fechaNacimiento);
    if (!fechaISO) {
      setError("La fecha de nacimiento debe ser real, desde 1940, y tener el formato dd/mm/aaaa.");
      return;
    }
    if (fechaISO > hoyISO()) {
      setError("La fecha de nacimiento no puede ser futura.");
      return;
    }

    const datos = {
      rut: limpiarRut(rut), // sin puntos y con guion, el formato que recibe la API
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      clave: form.clave,
      fechaNacimiento: fechaISO, // formato aaaa-mm-dd, el que recibe la API
      tipo: form.tipo,
    };

    setError("");
    setGuardando(true);
    // La contraseña nunca se imprime: solo se confirma que se capturó
    console.log("[Usuarios] Crear usuario:", { ...datos, clave: "[oculta]" });

    try {
      await onGuardar(datos); // la pantalla llama a la API; si falla, el mensaje se muestra aquí
    } catch (e) {
      setError(e.message);
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nuevo usuario</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "8px !important" }}>
        <TextField
          label="Rut"
          placeholder="12.345.678-5"
          size="small"
          value={form.rut}
          onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
          slotProps={{ htmlInput: { maxLength: 12 } }}
        />
        <TextField
          label="Nombre completo"
          size="small"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: soloLetras(e.target.value) })}
        />
        <TextField
          label="Correo electrónico"
          type="email"
          size="small"
          value={form.correo}
          onChange={handleChange("correo")}
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <TextField
          label="Contraseña"
          type="password"
          size="small"
          autoComplete="new-password"
          value={form.clave}
          onChange={handleChange("clave")}
        />
        <TextField
          label="Fecha de nacimiento"
          placeholder="dd/mm/aaaa"
          size="small"
          value={form.fechaNacimiento}
          onChange={(e) => setForm({ ...form, fechaNacimiento: aplicarMascaraFecha(e.target.value) })}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { inputMode: "numeric", maxLength: 10 },
          }}
        />

        <TextField select label="Tipo de usuario" size="small" value={form.tipo} onChange={handleChange("tipo")}>
          <MenuItem value="cliente">Cliente</MenuItem>
          <MenuItem value="vendedor">Vendedor</MenuItem>
          <MenuItem value="administrador">Administrador</MenuItem>
        </TextField>

        {error && <span style={{ color: "#EF4444", fontSize: 13 }}>{error}</span>}
      </DialogContent>
      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={onClose} disabled={guardando}>
          Cancelar
        </CustomButton>
        <CustomButton variant="primary" size="small" onClick={handleGuardar} disabled={guardando} sx={{ border: "2px solid #EC3333" }}>
          {guardando ? "Guardando..." : "Guardar"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;