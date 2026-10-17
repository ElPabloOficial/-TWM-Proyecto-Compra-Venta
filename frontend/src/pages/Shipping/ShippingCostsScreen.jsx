import { useState, useRef } from "react";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import "../../styles/Inventory.css";
import "../../styles/Shipping.css";

// TEMPORAL: estos catálogos vendrán de la base de datos cuando se conecte el backend.
const transportistas = ["Chilexpress", "Starken", "Correos de Chile", "Blue Express"];

const comunas = [
  { nombre: "Osorno", region: "Los Lagos" },
  { nombre: "Puerto Montt", region: "Los Lagos" },
  { nombre: "Puerto Varas", region: "Los Lagos" },
  { nombre: "Valdivia", region: "Los Ríos" },
  { nombre: "Temuco", region: "La Araucanía" },
  { nombre: "Santiago", region: "Metropolitana" },
];

// TEMPORAL: estas tarifas son de ejemplo y viven solo en memoria (se pierden al recargar).
// Con el backend se cargan desde la API.
const tarifasIniciales = [
  { id: 1, empresa: "Chilexpress", comuna: "Osorno", region: "Los Lagos", costoFijo: 2500, tarifaBase: 0, costoMinimo: 0, tiempo: "1-2 días", estado: "Activa" },
  { id: 2, empresa: "Starken", comuna: "Osorno", region: "Los Lagos", costoFijo: 2100, tarifaBase: 0, costoMinimo: 0, tiempo: "1 día", estado: "Activa" },
  { id: 3, empresa: "Chilexpress", comuna: "Puerto Montt", region: "Los Lagos", costoFijo: 3800, tarifaBase: 0, costoMinimo: 0, tiempo: "2-3 días", estado: "Activa" },
];

const formVacio = {
  empresa: "",
  comuna: "Todas",
  costoFijo: "",
  tarifaBase: "",
  costoMinimo: "",
  tiempo: "",
  estado: "Activa",
};

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

const ShippingCostsScreen = () => {
  const [tarifas, setTarifas] = useState(tarifasIniciales);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const editando = editandoId !== null;

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  const irAlFormulario = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ---------- Acciones ----------
  // TEMPORAL: crear y editar solo modifican el estado local.
  // Con el backend pasan a ser llamadas a la API (POST / PUT de la tarifa).
  const nuevaTarifa = () => {
    setEditandoId(null);
    setForm(formVacio);
    setError("");
    irAlFormulario();
  };

  const editarTarifa = (t) => {
    setEditandoId(t.id);
    setForm({
      empresa: t.empresa,
      comuna: t.comuna,
      costoFijo: String(t.costoFijo),
      tarifaBase: String(t.tarifaBase),
      costoMinimo: String(t.costoMinimo),
      tiempo: t.tiempo,
      estado: t.estado,
    });
    setError("");
    irAlFormulario();
  };

  const cancelar = () => {
    setEditandoId(null);
    setForm(formVacio);
    setError("");
  };

  const guardar = (e) => {
    e.preventDefault();

    const costoFijo = Number(form.costoFijo || 0);
    const tarifaBase = Number(form.tarifaBase || 0);
    const costoMinimo = Number(form.costoMinimo || 0);

    if (!form.empresa) {
      setError("Selecciona la empresa de despacho.");
      return;
    }
    if ([costoFijo, tarifaBase, costoMinimo].some((n) => Number.isNaN(n) || n < 0)) {
      setError("Los costos deben ser números mayores o iguales a 0.");
      return;
    }
    if (costoFijo === 0 && tarifaBase === 0) {
      setError("Indica un costo fijo o una tarifa base por kg.");
      return;
    }

    // TEMPORAL: validación de duplicados en el frontend. Con la base de datos
    // la respalda una restricción UNIQUE (empresa, comuna).
    const repetida = tarifas.some(
      (t) => t.empresa === form.empresa && t.comuna === form.comuna && t.id !== editandoId
    );
    if (repetida) {
      setError("Ya existe una tarifa para esa empresa y esa comuna.");
      return;
    }

    // La región se deduce de la comuna; "Todas" es la regla general de respaldo
    const region =
      form.comuna === "Todas"
        ? "Todas"
        : comunas.find((c) => c.nombre === form.comuna)?.region ?? "";

    const datos = {
      ...(editando ? { id: editandoId } : {}),
      empresa: form.empresa,
      comuna: form.comuna,
      region,
      costoFijo,
      tarifaBase,
      costoMinimo,
      tiempo: form.tiempo.trim(),
      estado: form.estado,
    };

    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados.
    // Con el backend esto se reemplaza por la llamada a la API (POST al crear, PUT al editar).
    console.log(editando ? "[Envíos] Actualizar tarifa:" : "[Envíos] Crear tarifa:", datos);

    if (editando) {
      setTarifas(tarifas.map((t) => (t.id === editandoId ? datos : t)));
    } else {
      // TEMPORAL: el id lo genera la base de datos, no Date.now()
      setTarifas([...tarifas, { ...datos, id: Date.now() }]);
    }

    setEditandoId(null);
    setForm(formVacio);
    setError("");
  };

  return (
    <SellerTemplate>
      <div className="env-content">
        <div className="env-head">
          <div>
            <h1 className="env-title">Gestión de costos de envío</h1>
            <div className="env-subtitle">
              Configura tarifas fijas por comuna/región y un método de respaldo por cálculo dinámico.
            </div>
          </div>

          <button type="button" className="env-btn-nueva" onClick={nuevaTarifa}>
            + Nueva tarifa
          </button>
        </div>

        {/* ---------- Tabla de tarifas ---------- */}
        <div className="env-card env-tabla-wrap">
          <table className="env-tabla">
            <thead>
              <tr>
                <th>Empresa despacho</th>
                <th>Región</th>
                <th>Comuna</th>
                <th>Costo fijo</th>
                <th>Tiempo est.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarifas.length === 0 && (
                <tr>
                  <td colSpan={7} className="env-vacio">
                    No hay tarifas registradas.
                  </td>
                </tr>
              )}

              {tarifas.map((t) => (
                <tr key={t.id}>
                  <td>{t.empresa}</td>
                  <td>{t.region}</td>
                  <td>{t.comuna}</td>
                  <td>
                    {t.costoFijo > 0 ? formatoPrecio(t.costoFijo) : "-"}
                    {t.tarifaBase > 0 && (
                      <div className="env-dinamico">
                        + {formatoPrecio(t.tarifaBase)}/kg (mín. {formatoPrecio(t.costoMinimo)})
                      </div>
                    )}
                  </td>
                  <td>{t.tiempo || "-"}</td>
                  <td>
                    <span className={`env-estado ${t.estado === "Activa" ? "activa" : "inactiva"}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="env-link" onClick={() => editarTarifa(t)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------- Formulario: nueva tarifa o regla dinámica ---------- */}
        <form className="env-form" ref={formRef} onSubmit={guardar}>
          <div className="env-form-titulo">
            {editando ? "Editar tarifa" : "Nueva tarifa / regla dinámica"}
          </div>

          <div className="env-card env-form-card">
            <div className="env-fila">
              <label className="env-campo">
                <span className="env-label">Empresa de despacho *</span>
                <select
                  className="env-input"
                  value={form.empresa}
                  onChange={handleChange("empresa")}
                >
                  <option value="">Seleccionar transportista</option>
                  {transportistas.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="env-campo">
                <span className="env-label">Comuna</span>
                <select
                  className="env-input"
                  value={form.comuna}
                  onChange={handleChange("comuna")}
                >
                  <option value="Todas">Todas / seleccionar</option>
                  {comunas.map((c) => (
                    <option key={c.nombre} value={c.nombre}>
                      {c.nombre} ({c.region})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="env-fila">
              <label className="env-campo">
                <span className="env-label">Costo fijo</span>
                <input
                  type="number"
                  min="0"
                  className="env-input"
                  placeholder="$0"
                  value={form.costoFijo}
                  onChange={handleChange("costoFijo")}
                />
              </label>

              <label className="env-campo">
                <span className="env-label">Tarifa base ($/kg)</span>
                <input
                  type="number"
                  min="0"
                  className="env-input"
                  placeholder="$0"
                  value={form.tarifaBase}
                  onChange={handleChange("tarifaBase")}
                />
              </label>

              <label className="env-campo">
                <span className="env-label">Costo mínimo</span>
                <input
                  type="number"
                  min="0"
                  className="env-input"
                  placeholder="$0"
                  value={form.costoMinimo}
                  onChange={handleChange("costoMinimo")}
                />
              </label>
            </div>

            <div className="env-fila">
              <label className="env-campo">
                <span className="env-label">Tiempo estimado</span>
                <input
                  type="text"
                  className="env-input"
                  placeholder="Ej. 1-2 días"
                  value={form.tiempo}
                  onChange={handleChange("tiempo")}
                />
              </label>

              <label className="env-campo">
                <span className="env-label">Estado</span>
                <select
                  className="env-input"
                  value={form.estado}
                  onChange={handleChange("estado")}
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </label>
            </div>

            <div className="env-ayuda">
              Si la comuna es "Todas", la regla funciona como método de respaldo: el costo se
              calcula como tarifa base × kg, sin bajar del costo mínimo.
            </div>

            {error && <div className="env-error">{error}</div>}

            <div className="env-acciones">
              {editando && (
                <button type="button" className="env-btn-secundario" onClick={cancelar}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="env-btn-nueva">
                {editando ? "Guardar cambios" : "Guardar tarifa"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </SellerTemplate>
  );
};

export default ShippingCostsScreen;
