import { useState } from "react";
import CustomButton from "../../atoms/Button/CustomButton";
import ImageUpload from "../../molecules/ImageUpload/ImageUpload";

const inicial = {
  nombre: "",
  sku: "",
  descripcion: "",
  categoriaId: "",
  precio: "",
  stock: "",
  imagen: null,
  restriccionEdad: false,
  oferta: 0,
  ofertaInicio: "",
  ofertaFin: "",
};

// Si recibe "producto", el formulario se abre con sus datos (modo edición).
const ProductForm = ({ producto = null, categorias = [], onGuardar, onCancelar }) => {
  const editando = Boolean(producto);
  const [form, setForm] = useState(producto ? { ...inicial, ...producto } : inicial);
  const [error, setError] = useState("");

  const cambiar = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  const cambiarCategoria = (e) => {
    const valor = e.target.value;
    setForm({ ...form, categoriaId: valor === "" ? "" : Number(valor) });
  };

  const handleGuardar = () => {
    const precio = Number(form.precio);
    const stock = Number(form.stock);

    if (!form.nombre.trim() || !form.sku.trim() || form.categoriaId === "") {
      setError("Nombre, SKU y categoría son obligatorios.");
      return;
    }
    if (form.precio === "" || form.stock === "" || precio < 0 || stock < 0) {
      setError("El precio y la cantidad deben ser números mayores o iguales a 0.");
      return;
    }
    if (!Number.isInteger(stock)) {
      setError("La cantidad en stock debe ser un número entero.");
      return;
    }

    const oferta = editando ? Number(form.oferta || 0) : 0;
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

    setError("");
    const datos = {
      ...form,
      nombre: form.nombre.trim(),
      sku: form.sku.trim(),
      descripcion: (form.descripcion || "").trim(),
      precio,
      stock,
      oferta,
      ofertaInicio: oferta > 0 ? form.ofertaInicio : "",
      ofertaFin: oferta > 0 ? form.ofertaFin : "",
    };
    console.log(
      `[ProductForm] handleGuardar() - ${editando ? "ACTUALIZAR" : "CREAR"} producto:`,
      datos
    );
    onGuardar(datos);
  };

  return (
    <div className="addp-card">
      <div className="addp-section-title primero">Información General</div>
      <div className="addp-section-desc">
        Detalles primarios que identifican de forma única el producto en el sistema.
      </div>

      <div className="addp-row">
        <div className="addp-field">
          <label className="addp-label" htmlFor="nombre">Nombre del producto</label>
          <input
            id="nombre"
            className="addp-input"
            type="text"
            placeholder="Ej. Laptop Industrial Pro X"
            value={form.nombre}
            onChange={cambiar("nombre")}
          />
        </div>
        <div className="addp-field">
          <label className="addp-label" htmlFor="sku">SKU / Código</label>
          <input
            id="sku"
            className="addp-input"
            type="text"
            placeholder="LAP-IND-PROX"
            value={form.sku}
            onChange={cambiar("sku")}
          />
        </div>
      </div>

      <div className="addp-row">
        <div className="addp-field">
          <label className="addp-label" htmlFor="descripcion">Descripción del producto</label>
          <input
            id="descripcion"
            className="addp-input"
            type="text"
            placeholder="Escribe aquí los detalles técnicos, componentes y características primarias..."
            value={form.descripcion}
            onChange={cambiar("descripcion")}
          />
        </div>
      </div>

      <div className="addp-row">
        <div className="addp-field mitad">
          <label className="addp-label" htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            className={`addp-input ${form.categoriaId === "" ? "vacio" : ""}`}
            value={form.categoriaId}
            onChange={cambiarCategoria}
          >
            <option value="" disabled>Selecciona las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="addp-section-title">Precios e Inventario</div>
      <div className="addp-section-desc">
        Configuración de valores comerciales y niveles de almacenamiento de stock.
      </div>

      <div className="addp-row">
        <div className="addp-field">
          <label className="addp-label" htmlFor="precio">Precio unitario</label>
          <div className="addp-money">
            <span>$</span>
            <input
              id="precio"
              className="addp-input"
              type="number"
              placeholder="0"
              value={form.precio}
              onChange={cambiar("precio")}
            />
          </div>
        </div>
        <div className="addp-field">
          <label className="addp-label" htmlFor="stock">Cantidad en stock</label>
          <input
            id="stock"
            className="addp-input"
            type="number"
            placeholder="0"
            value={form.stock}
            onChange={cambiar("stock")}
          />
        </div>
      </div>

      <div className="addp-subtitle">Imagen del Producto</div>
      <ImageUpload
        value={form.imagen}
        onChange={(archivo) => setForm({ ...form, imagen: archivo })}
      />

      <div className="addp-section-title">Requiere restricción de edad</div>
      <div className="addp-section-desc">
        Activa o desactiva la venta para usuarios menores de 18 años.
      </div>
      <div className="addp-switch-row">
        <input
          className="addp-switch"
          type="checkbox"
          checked={form.restriccionEdad}
          onChange={(e) => setForm({ ...form, restriccionEdad: e.target.checked })}
        />
        <div>
          <div className="addp-switch-estado">
            {form.restriccionEdad ? "Sí" : "No"}
          </div>
          <div className="addp-switch-texto">
            {form.restriccionEdad
              ? "Este producto o servicio es solo para mayores de 18 años."
              : "Este producto o servicio es para todas las edades."}
          </div>
        </div>
      </div>

      {editando && (
        <>
          <div className="addp-section-title">Oferta</div>
          <div className="addp-section-desc">
            Porcentaje de descuento y fechas en que estará vigente (0 = sin oferta).
          </div>
          <div className="addp-row">
            <div className="addp-field">
              <label className="addp-label" htmlFor="oferta">Oferta (%)</label>
              <input
                id="oferta"
                className="addp-input"
                type="number"
                placeholder="0"
                value={form.oferta}
                onChange={cambiar("oferta")}
              />
            </div>
          </div>
          {Number(form.oferta) > 0 && (
            <div className="addp-row">
              <div className="addp-field">
                <label className="addp-label" htmlFor="ofertaInicio">Inicio de la oferta</label>
                <input
                  id="ofertaInicio"
                  className="addp-input"
                  type="date"
                  value={form.ofertaInicio}
                  onChange={cambiar("ofertaInicio")}
                />
              </div>
              <div className="addp-field">
                <label className="addp-label" htmlFor="ofertaFin">Término de la oferta</label>
                <input
                  id="ofertaFin"
                  className="addp-input"
                  type="date"
                  value={form.ofertaFin}
                  onChange={cambiar("ofertaFin")}
                />
              </div>
            </div>
          )}
        </>
      )}

      {error && <div className="addp-error">{error}</div>}

      <div className="addp-actions">
        <CustomButton
          variant="secondary"
          size="small"
          onClick={onCancelar}
          sx={{ borderRadius: "999px", textTransform: "none" }}
        >
          Cancelar
        </CustomButton>
        <CustomButton
          variant="primary"
          size="small"
          onClick={handleGuardar}
          sx={{
            border: "2px solid #EC3333",
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {editando ? "Guardar Cambios" : "Guardar Producto"}
        </CustomButton>
      </div>
    </div>
  );
};

export default ProductForm;