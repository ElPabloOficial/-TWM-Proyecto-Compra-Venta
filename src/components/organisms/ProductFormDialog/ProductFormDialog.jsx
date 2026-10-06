import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CustomButton from "../../atoms/Button/CustomButton";

const vacio = {
  sku: "",
  nombre: "",
  categoriaId: "",
  stock: "",
  precio: "",
  oferta: "",
  ofertaInicio: "",
  ofertaFin: "",
};

const ProductFormDialog = ({ open, producto, categorias = [], onClose, onGuardar }) => {
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(producto ? { ...vacio, ...producto } : vacio);
    setError("");
  }, [producto, open]);

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  const tieneOferta = Number(form.oferta) > 0;

  const handleGuardar = () => {
    const stock = Number(form.stock);
    const precio = Number(form.precio);
    const oferta = Number(form.oferta || 0);

    if (!form.sku.trim() || !form.nombre.trim() || form.categoriaId === "") {
      setError("SKU, producto y categoría son obligatorios.");
      return;
    }
    if (form.stock === "" || form.precio === "" || stock < 0 || precio < 0) {
      setError("Stock y precio deben ser números mayores o iguales a 0.");
      return;
    }
    if (oferta < 0 || oferta > 100) {
      setError("La oferta debe estar entre 0 y 100.");
      return;
    }
    if (oferta > 0) {
      if (!form.ofertaInicio || !form.ofertaFin) {
        setError("Si hay oferta, indica la fecha de inicio y la de término.");
        return;
      }
      if (form.ofertaFin < form.ofertaInicio) {
        setError("La fecha de término no puede ser anterior a la de inicio.");
        return;
      }
    }

    const datos = {
      ...form,
      sku: form.sku.trim(),
      nombre: form.nombre.trim(),
      stock,
      precio,
      oferta,
      ofertaInicio: oferta > 0 ? form.ofertaInicio : "",
      ofertaFin: oferta > 0 ? form.ofertaFin : "",
    };

    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados.
    // Con el backend esto se reemplaza por la llamada a la API (PUT al editar, POST al crear).
    console.log(
      producto ? "[Productos] Actualizar producto:" : "[Productos] Crear producto:",
      datos
    );

    onGuardar(datos);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "8px !important" }}>
        <TextField label="SKU" size="small" value={form.sku} onChange={handleChange("sku")} />
        <TextField label="Producto" size="small" value={form.nombre} onChange={handleChange("nombre")} />

        <TextField
          select
          label="Categoría"
          size="small"
          value={form.categoriaId}
          onChange={handleChange("categoriaId")}
        >
          {categorias.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Stock" type="number" size="small" value={form.stock} onChange={handleChange("stock")} />
        <TextField label="Precio unitario" type="number" size="small" value={form.precio} onChange={handleChange("precio")} />
        <TextField label="Oferta (%)" type="number" size="small" value={form.oferta} onChange={handleChange("oferta")} />

        {tieneOferta && (
          <>
            <TextField
              label="Inicio de la oferta"
              type="date"
              size="small"
              value={form.ofertaInicio}
              onChange={handleChange("ofertaInicio")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Término de la oferta"
              type="date"
              size="small"
              value={form.ofertaFin}
              onChange={handleChange("ofertaFin")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        )}

        {error && <span style={{ color: "#EF4444", fontSize: 13 }}>{error}</span>}
      </DialogContent>
      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={onClose}>
          Cancelar
        </CustomButton>
        <CustomButton
          variant="primary"
          size="small"
          onClick={handleGuardar}
          sx={{ border: "2px solid #EC3333" }}
        >
          Guardar
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormDialog;