import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { useProductos } from "../../context/ProductContext";
import { useServicios, modalidades } from "../../context/ServiceContext";
import "../../styles/AddProduct.css";

const inicial = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoriaId: "",
  modalidad: "",
  duracion: "",
  precio: "",
  restriccionEdad: false,
  oferta: 0,
  ofertaInicio: "",
  ofertaFin: "",
};

// Misma plantilla para agregar (/servicios/nuevo) y editar (/servicios/editar/:id)
const ServiceFormScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { categorias } = useProductos();
  const { servicios, agregarServicio, actualizarServicio } = useServicios();

  const editando = Boolean(id);
  const servicio = editando ? servicios.find((s) => s.id === Number(id)) : null;

  const [form, setForm] = useState(servicio ? { ...inicial, ...servicio } : inicial);
  const [error, setError] = useState("");

  if (editando && !servicio) {
    return <Navigate to="/servicios" replace />;
  }

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const handleGuardar = () => {
    const precio = Number(form.precio);
    const duracion = Number(form.duracion);

    if (!form.codigo.trim() || !form.nombre.trim() || form.categoriaId === "" || !form.modalidad) {
      setError("Código, nombre, categoría y modalidad son obligatorios.");
      return;
    }
    if (form.precio === "" || form.duracion === "" || precio < 0 || duracion <= 0) {
      setError("El precio debe ser 0 o más y la duración mayor a 0 minutos.");
      return;
    }

    const oferta = Number(form.oferta || 0);
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
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoriaId: Number(form.categoriaId),
      precio,
      duracion,
      oferta,
      ofertaInicio: oferta > 0 ? form.ofertaInicio : "",
      ofertaFin: oferta > 0 ? form.ofertaFin : "",
    };
    console.log(
      `[ServiceFormScreen] handleGuardar() - ${editando ? "ACTUALIZAR" : "CREAR"} servicio:`,
      datos
    );

    if (editando) {
      actualizarServicio({ ...datos, id: servicio.id });
    } else {
      agregarServicio(datos);
    }
    navigate("/servicios");
  };

  const titulo = editando ? "Editar Servicio" : "Agregar Servicio";

  return (
    <div className="addp-page">
      <Header />

      <div className="addp-content">
        <div className="addp-top">
          <nav className="addp-breadcrumb">
            <Link to="/servicios">Servicios</Link>
            <span className="sep">›</span>
            <span className="actual">{titulo}</span>
          </nav>
          <h1 className="addp-title">{titulo}</h1>
        </div>

        <div className="addp-card">
          <div className="addp-section-title primero">Información General</div>
          <div className="addp-section-desc">
            Detalles que identifican el servicio que ofreces.
          </div>

          <div className="addp-row">
            <div className="addp-field">
              <label className="addp-label" htmlFor="nombre">Nombre del servicio</label>
              <input id="nombre" className="addp-input" type="text" placeholder="Ej. Instalación de redes" value={form.nombre} onChange={cambiar("nombre")} />
            </div>
            <div className="addp-field">
              <label className="addp-label" htmlFor="codigo">Código</label>
              <input id="codigo" className="addp-input" type="text" placeholder="SRV-001" value={form.codigo} onChange={cambiar("codigo")} />
            </div>
          </div>

          <div className="addp-row">
            <div className="addp-field">
              <label className="addp-label" htmlFor="descripcion">Descripción del servicio</label>
              <input id="descripcion" className="addp-input" type="text" placeholder="Describe en qué consiste el servicio..." value={form.descripcion} onChange={cambiar("descripcion")} />
            </div>
          </div>

          <div className="addp-row">
            <div className="addp-field">
              <label className="addp-label" htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                className={`addp-input ${form.categoriaId === "" ? "vacio" : ""}`}
                value={form.categoriaId}
                onChange={cambiar("categoriaId")}
              >
                <option value="" disabled>Selecciona la categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="addp-field">
              <label className="addp-label" htmlFor="modalidad">Modalidad</label>
              <select
                id="modalidad"
                className={`addp-input ${form.modalidad === "" ? "vacio" : ""}`}
                value={form.modalidad}
                onChange={cambiar("modalidad")}
              >
                <option value="" disabled>Selecciona la modalidad</option>
                {modalidades.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="addp-section-title">Precio y Duración</div>
          <div className="addp-section-desc">
            Valor comercial del servicio y tiempo estimado de atención.
          </div>

          <div className="addp-row">
            <div className="addp-field">
              <label className="addp-label" htmlFor="precio">Precio</label>
              <div className="addp-money">
                <span>$</span>
                <input id="precio" className="addp-input" type="number" placeholder="0" value={form.precio} onChange={cambiar("precio")} />
              </div>
            </div>
            <div className="addp-field">
              <label className="addp-label" htmlFor="duracion">Duración (minutos)</label>
              <input id="duracion" className="addp-input" type="number" placeholder="60" value={form.duracion} onChange={cambiar("duracion")} />
            </div>
          </div>

          <div className="addp-section-title">Oferta</div>
          <div className="addp-section-desc">
            Porcentaje de descuento y fechas en que estará vigente (0 = sin oferta).
          </div>
          <div className="addp-row">
            <div className="addp-field">
              <label className="addp-label" htmlFor="oferta">Oferta (%)</label>
              <input id="oferta" className="addp-input" type="number" placeholder="0" value={form.oferta} onChange={cambiar("oferta")} />
            </div>
          </div>
          {Number(form.oferta) > 0 && (
            <div className="addp-row">
              <div className="addp-field">
                <label className="addp-label" htmlFor="ofertaInicio">Inicio de la oferta</label>
                <input id="ofertaInicio" className="addp-input" type="date" value={form.ofertaInicio} onChange={cambiar("ofertaInicio")} />
              </div>
              <div className="addp-field">
                <label className="addp-label" htmlFor="ofertaFin">Término de la oferta</label>
                <input id="ofertaFin" className="addp-input" type="date" value={form.ofertaFin} onChange={cambiar("ofertaFin")} />
              </div>
            </div>
          )}

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

          {error && <div className="addp-error">{error}</div>}

          <div className="addp-actions">
            <CustomButton
              variant="secondary"
              size="small"
              onClick={() => navigate("/servicios")}
              sx={{ borderRadius: "999px", textTransform: "none" }}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              variant="primary"
              size="small"
              onClick={handleGuardar}
              sx={{ border: "2px solid #EC3333", borderRadius: "999px", textTransform: "none", fontWeight: 700 }}
            >
              {editando ? "Guardar Cambios" : "Guardar Servicio"}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormScreen;