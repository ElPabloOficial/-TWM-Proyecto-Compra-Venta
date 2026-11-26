import { useEffect, useRef, useState } from "react";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import { shippingService } from "../../services/shippingService";
import { soloDigitos } from "../../services/validaciones";
import "../../styles/Inventory.css";
import "../../styles/Shipping.css";

// Pantalla del administrador: empresas de despacho y sus límites volumétricos
// (medidas y peso máximos de un paquete). Datos desde la API:
//   GET    /empresas-despacho        -> lista
//   POST   /empresas-despacho        -> crear
//   PUT    /empresas-despacho/{id}   -> editar
//   DELETE /empresas-despacho/{id}   -> eliminar (solo si no tiene despachos)

const formVacio = { nombre: "", alto: "", ancho: "", fondo: "", peso: "" };

const numero = (n) => Number(n).toLocaleString("es-CL");

const ShippingCostsScreen = () => {
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [porEliminar, setPorEliminar] = useState(null); // empresa que espera confirmación
  const formRef = useRef(null);

  const editando = editandoId !== null;

  // Carga las empresas de despacho
  useEffect(() => {
    let activo = true;

    setCargando(true);
    setErrorCarga("");
    shippingService
      .listarEmpresas()
      .then((lista) => {
        if (activo) setEmpresas(lista);
      })
      .catch((e) => {
        if (activo) setErrorCarga(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [recarga]);

  const handleChange = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  // Medidas y peso solo admiten dígitos
  const handleNumero = (campo, max) => (e) => setForm({ ...form, [campo]: soloDigitos(e.target.value, max) });

  const irAlFormulario = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // El volumen máximo es alto × ancho × fondo (se calcula, no se escribe)
  const volumen = Number(form.alto || 0) * Number(form.ancho || 0) * Number(form.fondo || 0);

  // ---------- Acciones ----------
  const nuevaEmpresa = () => {
    setEditandoId(null);
    setForm(formVacio);
    setError("");
    irAlFormulario();
  };

  const editarEmpresa = (e) => {
    setEditandoId(e.id);
    setForm({
      nombre: e.nombre,
      alto: String(e.alto),
      ancho: String(e.ancho),
      fondo: String(e.fondo),
      peso: String(e.peso),
    });
    setError("");
    irAlFormulario();
  };

  const cancelar = () => {
    setEditandoId(null);
    setForm(formVacio);
    setError("");
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (guardando) return;

    const nombre = form.nombre.trim();
    if (!nombre) return setError("Escribe el nombre de la empresa de despacho.");
    if (nombre.length > 50) return setError("El nombre no puede tener más de 50 caracteres.");
    if (!(Number(form.alto) > 0) || !(Number(form.ancho) > 0) || !(Number(form.fondo) > 0)) {
      return setError("El alto, el ancho y el fondo máximos deben ser mayores a 0.");
    }
    if (!(Number(form.peso) > 0)) return setError("El peso máximo debe ser mayor a 0.");

    const datos = { ...(editando ? { id: editandoId } : {}), ...form, nombre };

    // Requisito del proyecto: se muestra en la consola lo que se envía a la API
    console.log(editando ? "[Envíos] Actualizar empresa:" : "[Envíos] Crear empresa:", datos);

    setGuardando(true);
    setError("");
    try {
      if (editando) await shippingService.actualizarEmpresa(datos);
      else await shippingService.crearEmpresa(datos);

      setEditandoId(null);
      setForm(formVacio);
      setRecarga((n) => n + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    const empresa = porEliminar;
    setPorEliminar(null);
    if (!empresa) return;

    console.log("[Envíos] Eliminar empresa:", { id: empresa.id });
    setError("");
    try {
      await shippingService.eliminarEmpresa(empresa.id);
      if (editandoId === empresa.id) cancelar();
      setRecarga((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SellerTemplate>
      <div className="env-content">
        <div className="env-head">
          <div>
            <h1 className="env-title">Empresas de despacho</h1>
            <div className="env-subtitle">
              Define el tamaño y el peso máximos de un paquete para cada empresa de despacho.
              Con estos límites se valida si un producto puede enviarse.
            </div>
          </div>

          <button type="button" className="env-btn-nueva" onClick={nuevaEmpresa}>
            + Nueva empresa
          </button>
        </div>

        {cargando ? (
          <p role="status">Cargando empresas de despacho...</p>
        ) : errorCarga ? (
          <ErrorState
            titulo="No pudimos cargar las empresas de despacho"
            detalle={errorCarga}
            onReintentar={() => setRecarga((n) => n + 1)}
          />
        ) : (
          <div className="env-card env-tabla-wrap">
            <table className="env-tabla">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Alto máx.</th>
                  <th>Ancho máx.</th>
                  <th>Fondo máx.</th>
                  <th>Peso máx.</th>
                  <th>Volumen máx.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="env-vacio">
                      No hay empresas de despacho registradas.
                    </td>
                  </tr>
                )}

                {empresas.map((e) => (
                  <tr key={e.id}>
                    <td>{e.nombre}</td>
                    <td>{numero(e.alto)} cm</td>
                    <td>{numero(e.ancho)} cm</td>
                    <td>{numero(e.fondo)} cm</td>
                    <td>{numero(e.peso)} g</td>
                    <td>{numero(e.volumen)} cm³</td>
                    <td>
                      <button type="button" className="env-link" onClick={() => editarEmpresa(e)}>
                        Editar
                      </button>
                      {" · "}
                      <button
                        type="button"
                        className="env-link"
                        onClick={() => setPorEliminar(e)}
                        title={e.despachos > 0 ? "Tiene despachos registrados: no se puede eliminar" : undefined}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------- Formulario: nueva empresa o edición ---------- */}
        <form className="env-form" ref={formRef} onSubmit={guardar}>
          <div className="env-form-titulo">{editando ? "Editar empresa de despacho" : "Nueva empresa de despacho"}</div>

          <div className="env-card env-form-card">
            <div className="env-fila">
              <label className="env-campo">
                <span className="env-label">Nombre *</span>
                <input
                  type="text"
                  className="env-input"
                  placeholder="Ej. Chilexpress"
                  maxLength={50}
                  value={form.nombre}
                  onChange={handleChange("nombre")}
                />
              </label>
            </div>

            <div className="env-fila">
              <label className="env-campo">
                <span className="env-label">Alto máximo (cm) *</span>
                <input type="text" inputMode="numeric" className="env-input" placeholder="0" value={form.alto} onChange={handleNumero("alto", 4)} />
              </label>
              <label className="env-campo">
                <span className="env-label">Ancho máximo (cm) *</span>
                <input type="text" inputMode="numeric" className="env-input" placeholder="0" value={form.ancho} onChange={handleNumero("ancho", 4)} />
              </label>
              <label className="env-campo">
                <span className="env-label">Fondo máximo (cm) *</span>
                <input type="text" inputMode="numeric" className="env-input" placeholder="0" value={form.fondo} onChange={handleNumero("fondo", 4)} />
              </label>
            </div>

            <div className="env-fila">
              <label className="env-campo">
                <span className="env-label">Peso máximo (g) *</span>
                <input type="text" inputMode="numeric" className="env-input" placeholder="0" value={form.peso} onChange={handleNumero("peso", 7)} />
              </label>
              <label className="env-campo">
                <span className="env-label">Volumen máximo (cm³)</span>
                <input type="text" className="env-input" value={volumen > 0 ? numero(volumen) : ""} placeholder="Se calcula solo" readOnly />
              </label>
            </div>

            <div className="env-ayuda">
              El volumen máximo es alto × ancho × fondo. El peso va en gramos, igual que el peso de los productos
              (por ejemplo, 25.000 g = 25 kg).
            </div>

            {error && <div className="env-error" role="alert">{error}</div>}

            <div className="env-acciones">
              {editando && (
                <button type="button" className="env-btn-secundario" onClick={cancelar} disabled={guardando}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="env-btn-nueva" disabled={guardando}>
                {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar empresa"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={Boolean(porEliminar)}
        titulo="Eliminar empresa de despacho"
        mensaje={porEliminar ? `¿Eliminar la empresa ${porEliminar.nombre}?` : ""}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </SellerTemplate>
  );
};

export default ShippingCostsScreen;
