import { useState, useRef } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Header from "../../components/organisms/Header/Header";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import "../../styles/Addresses.css";

// TEMPORAL: las regiones y comunas vendrán de la base de datos cuando se conecte el backend.
const regiones = {
  "Los Lagos": ["Osorno", "Puerto Montt", "Puerto Varas", "Castro"],
  "Los Ríos": ["Valdivia", "La Unión"],
  "La Araucanía": ["Temuco", "Villarrica"],
  "Biobío": ["Concepción", "Los Ángeles"],
  Metropolitana: ["Santiago", "Providencia", "Las Condes", "Ñuñoa"],
};

const alias = ["Casa", "Trabajo", "Otro"];

// TEMPORAL: estas direcciones son de ejemplo y viven solo en memoria (se pierden al recargar).
// Con el backend se cargan desde la API (las direcciones del usuario que inició sesión).
const direccionesIniciales = [
  {
    id: 1,
    alias: "Casa",
    destinatario: "Juan Pérez",
    telefono: "+56 9 1234 5678",
    calle: "Mackenna",
    numero: "850",
    complemento: "Depto 302",
    region: "Los Lagos",
    comuna: "Osorno",
    referencias: "Portón negro, tocar el timbre.",
    principal: true,
  },
  {
    id: 2,
    alias: "Trabajo",
    destinatario: "Juan Pérez",
    telefono: "+56 9 8765 4321",
    calle: "Av. Diego Portales",
    numero: "1200",
    complemento: "Oficina 5",
    region: "Los Lagos",
    comuna: "Puerto Montt",
    referencias: "",
    principal: false,
  },
];

const formVacio = {
  alias: "Casa",
  destinatario: "",
  telefono: "",
  calle: "",
  numero: "",
  complemento: "",
  region: "",
  comuna: "",
  referencias: "",
  principal: false,
};

const AddressesScreen = () => {
  const [direcciones, setDirecciones] = useState(direccionesIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [direccionAEliminar, setDireccionAEliminar] = useState(null);
  const formRef = useRef(null);

  const editando = editandoId !== null;
  // Si la dirección que se edita ya es la principal, no se puede quitar esa marca desde aquí
  const esLaPrincipal = editando && direcciones.find((d) => d.id === editandoId)?.principal;

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  // Al cambiar de región, la comuna se vuelve a elegir
  const cambiarRegion = (e) => {
    setForm({ ...form, region: e.target.value, comuna: "" });
  };

  const abrirForm = () => {
    setMostrarForm(true);
    setError("");
    // Espera a que el formulario aparezca para bajar hasta él
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  // ---------- Acciones ----------
  // TEMPORAL: crear, editar, eliminar y marcar como principal solo modifican el estado local.
  // Con el backend pasan a ser llamadas a la API (POST, PUT, DELETE).
  const abrirNueva = () => {
    setEditandoId(null);
    // La primera dirección que se guarda queda como principal
    setForm({ ...formVacio, principal: direcciones.length === 0 });
    abrirForm();
  };

  const abrirEditar = (d) => {
    setEditandoId(d.id);
    setForm({
      alias: d.alias,
      destinatario: d.destinatario,
      telefono: d.telefono,
      calle: d.calle,
      numero: d.numero,
      complemento: d.complemento,
      region: d.region,
      comuna: d.comuna,
      referencias: d.referencias,
      principal: d.principal,
    });
    abrirForm();
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setForm(formVacio);
    setError("");
  };

  const guardar = (e) => {
    e.preventDefault();

    if (
      !form.destinatario.trim() ||
      !form.telefono.trim() ||
      !form.calle.trim() ||
      !form.numero.trim() ||
      !form.region ||
      !form.comuna
    ) {
      setError("Completa todos los campos obligatorios (*).");
      return;
    }

    // Acepta "+56 9 1234 5678", "56912345678" o "912345678"
    const telefonoLimpio = form.telefono.replace(/[\s-]/g, "");
    if (!/^(\+?56)?9\d{8}$/.test(telefonoLimpio)) {
      setError("Ingresa un teléfono móvil válido, por ejemplo +56 9 1234 5678.");
      return;
    }

    const datos = {
      alias: form.alias,
      destinatario: form.destinatario.trim(),
      telefono: form.telefono.trim(),
      calle: form.calle.trim(),
      numero: form.numero.trim(),
      complemento: form.complemento.trim(),
      region: form.region,
      comuna: form.comuna,
      referencias: form.referencias.trim(),
      principal: form.principal || esLaPrincipal || direcciones.length === 0,
    };

    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados.
    // Con el backend esto se reemplaza por la llamada a la API (POST al crear, PUT al editar).
    console.log(
      editando ? "[Direcciones] Actualizar dirección:" : "[Direcciones] Crear dirección:",
      editando ? { id: editandoId, ...datos } : datos
    );

    // TEMPORAL: el id de una dirección nueva lo genera la base de datos, no Date.now()
    const guardada = { ...datos, id: editando ? editandoId : Date.now() };
    const lista = editando
      ? direcciones.map((d) => (d.id === editandoId ? guardada : d))
      : [...direcciones, guardada];

    // Solo puede haber una dirección principal
    setDirecciones(
      guardada.principal
        ? lista.map((d) => (d.id === guardada.id ? d : { ...d, principal: false }))
        : lista
    );
    cerrarForm();
  };

  const marcarPrincipal = (direccion) => {
    // SIMULACIÓN (solo frontend): con el backend pasa a ser una llamada PUT
    console.log("[Direcciones] Marcar como principal:", direccion);
    setDirecciones(direcciones.map((d) => ({ ...d, principal: d.id === direccion.id })));
  };

  const confirmarEliminar = () => {
    // SIMULACIÓN (solo frontend): con el backend pasa a ser una llamada DELETE
    console.log("[Direcciones] Eliminar dirección:", direccionAEliminar);

    const restantes = direcciones.filter((d) => d.id !== direccionAEliminar.id);
    // Si se borra la principal, la primera que quede pasa a ser la principal
    if (direccionAEliminar.principal && restantes.length > 0) {
      restantes[0] = { ...restantes[0], principal: true };
    }
    setDirecciones(restantes);

    // Si justo se estaba editando la dirección borrada, se cierra el formulario
    if (editandoId === direccionAEliminar.id) cerrarForm();
    setDireccionAEliminar(null);
  };

  // La principal siempre aparece primero
  const ordenadas = [...direcciones].sort((a, b) => Number(b.principal) - Number(a.principal));

  return (
    <>
      <Header />

      <div className="dir-page">
        <div className="dir-content">
          <div className="dir-head">
            <div>
              <h1 className="dir-title">Mis direcciones</h1>
              <div className="dir-subtitle">
                Guarda tus direcciones de despacho para comprar más rápido.
              </div>
            </div>

            <button type="button" className="dir-btn" onClick={abrirNueva}>
              + Nueva dirección
            </button>
          </div>

          {/* ---------- Formulario: crear o editar ---------- */}
          {mostrarForm && (
            <form className="dir-form" ref={formRef} onSubmit={guardar}>
              <div className="dir-form-titulo">
                {editando ? "Editar dirección" : "Nueva dirección"}
              </div>

              <div className="dir-fila">
                <label className="dir-campo">
                  <span className="dir-label">Nombre de la dirección</span>
                  <select className="dir-input" value={form.alias} onChange={handleChange("alias")}>
                    {alias.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dir-campo">
                  <span className="dir-label">Quién recibe *</span>
                  <input
                    type="text"
                    className="dir-input"
                    placeholder="Nombre completo"
                    value={form.destinatario}
                    onChange={handleChange("destinatario")}
                  />
                </label>

                <label className="dir-campo">
                  <span className="dir-label">Teléfono de contacto *</span>
                  <input
                    type="tel"
                    className="dir-input"
                    placeholder="+56 9 1234 5678"
                    value={form.telefono}
                    onChange={handleChange("telefono")}
                  />
                </label>
              </div>

              <div className="dir-fila">
                <label className="dir-campo dir-ancho">
                  <span className="dir-label">Calle *</span>
                  <input
                    type="text"
                    className="dir-input"
                    placeholder="Ej. Av. Real"
                    value={form.calle}
                    onChange={handleChange("calle")}
                  />
                </label>

                <label className="dir-campo">
                  <span className="dir-label">Número *</span>
                  <input
                    type="text"
                    className="dir-input"
                    placeholder="Ej. 1234"
                    value={form.numero}
                    onChange={handleChange("numero")}
                  />
                </label>

                <label className="dir-campo">
                  <span className="dir-label">Depto / Casa / Oficina</span>
                  <input
                    type="text"
                    className="dir-input"
                    placeholder="Ej. Depto 302"
                    value={form.complemento}
                    onChange={handleChange("complemento")}
                  />
                </label>
              </div>

              <div className="dir-fila">
                <label className="dir-campo">
                  <span className="dir-label">Región *</span>
                  <select className="dir-input" value={form.region} onChange={cambiarRegion}>
                    <option value="">Seleccionar región</option>
                    {Object.keys(regiones).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dir-campo">
                  <span className="dir-label">Comuna *</span>
                  <select
                    className="dir-input"
                    value={form.comuna}
                    onChange={handleChange("comuna")}
                    disabled={!form.region}
                  >
                    <option value="">
                      {form.region ? "Seleccionar comuna" : "Primero elige la región"}
                    </option>
                    {(regiones[form.region] ?? []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="dir-campo">
                <span className="dir-label">Indicaciones para el despacho</span>
                <textarea
                  className="dir-input"
                  rows={2}
                  placeholder="Ej. Portón negro, dejar con conserjería."
                  value={form.referencias}
                  onChange={handleChange("referencias")}
                />
              </label>

              <label className="dir-check">
                <input
                  type="checkbox"
                  checked={form.principal || Boolean(esLaPrincipal)}
                  disabled={Boolean(esLaPrincipal)}
                  onChange={(e) => setForm({ ...form, principal: e.target.checked })}
                />
                <span>
                  Usar como dirección principal
                  {esLaPrincipal && " (para cambiarla, marca otra dirección como principal)"}
                </span>
              </label>

              {error && <div className="dir-error">{error}</div>}

              <div className="dir-acciones-form">
                <button type="button" className="dir-btn-secundario" onClick={cerrarForm}>
                  Cancelar
                </button>
                <button type="submit" className="dir-btn">
                  {editando ? "Guardar cambios" : "Guardar dirección"}
                </button>
              </div>
            </form>
          )}

          {/* ---------- Lista de direcciones ---------- */}
          <div className="dir-lista">
            {ordenadas.length === 0 && (
              <div className="dir-vacio">Aún no tienes direcciones guardadas.</div>
            )}

            {ordenadas.map((d) => (
              <article key={d.id} className={`dir-card ${d.principal ? "principal" : ""}`}>
                <div className="dir-card-head">
                  <div className="dir-alias">
                    <LocationOnIcon fontSize="small" />
                    {d.alias}
                  </div>
                  {d.principal && <span className="dir-badge">Principal</span>}
                </div>

                <div className="dir-nombre">
                  {d.destinatario} · {d.telefono}
                </div>
                <div className="dir-linea">
                  {d.calle} {d.numero}
                  {d.complemento ? `, ${d.complemento}` : ""}
                </div>
                <div className="dir-linea">
                  {d.comuna}, {d.region}
                </div>
                {d.referencias && <div className="dir-ref">{d.referencias}</div>}

                <div className="dir-acciones">
                  <button type="button" className="dir-link" onClick={() => abrirEditar(d)}>
                    Editar
                  </button>
                  <button type="button" className="dir-link" onClick={() => setDireccionAEliminar(d)}>
                    Eliminar
                  </button>
                  {!d.principal && (
                    <button type="button" className="dir-link" onClick={() => marcarPrincipal(d)}>
                      Marcar como principal
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(direccionAEliminar)}
        titulo="Eliminar dirección"
        mensaje={`¿Seguro que quieres eliminar la dirección "${direccionAEliminar?.alias ?? ""}" (${direccionAEliminar?.calle ?? ""} ${direccionAEliminar?.numero ?? ""})? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setDireccionAEliminar(null)}
      />
    </>
  );
};

export default AddressesScreen;
