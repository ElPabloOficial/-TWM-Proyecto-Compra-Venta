import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Header from "../../components/organisms/Header/Header";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import { authService } from "../../services/authService";
import {
  obtenerDirecciones,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion,
  obtenerComunas,
} from "../../services/addressService";
import "../../styles/Addresses.css";

// Direcciones de despacho del usuario, guardadas en la base de datos.
// - Se pueden crear, editar y eliminar.
// - La región y la provincia salen de la comuna: se elige la región y después una de sus comunas.

const formVacio = {
  calle: "",
  numero: "",
  pasaje: "",
  sector: "",
  region: "",
  idComuna: "",
  descripcion: "",
};

const AddressesScreen = () => {
  const haySesion = Boolean(authService.getCurrentUser());

  const [direcciones, setDirecciones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  // Sube para volver a pedir las direcciones (al pedir "Reintentar" y después de guardar)
  const [version, setVersion] = useState(0);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null); // dirección que espera confirmación
  const [errorEliminar, setErrorEliminar] = useState("");
  const formRef = useRef(null);

  const editando = editandoId !== null;

  useEffect(() => {
    if (!haySesion) return;
    let activo = true; // evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta

    const cargar = async () => {
      try {
        const [lista, listaComunas] = await Promise.all([obtenerDirecciones(), obtenerComunas()]);
        if (!activo) return;
        setDirecciones(lista);
        setComunas(listaComunas);
      } catch (e) {
        if (activo) setErrorCarga(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [haySesion, version]);

  const reintentar = () => {
    setCargando(true);
    setErrorCarga("");
    setVersion((n) => n + 1);
  };

  const regiones = [...new Set(comunas.map((c) => c.region))].sort((a, b) => a.localeCompare(b));
  const comunasDeLaRegion = comunas.filter((c) => c.region === form.region);

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  // El número solo admite dígitos (la base de datos lo guarda como entero)
  const cambiarNumero = (e) => {
    setForm({ ...form, numero: e.target.value.replace(/\D/g, "").slice(0, 6) });
  };

  // Al cambiar de región, la comuna se vuelve a elegir
  const cambiarRegion = (e) => {
    setForm({ ...form, region: e.target.value, idComuna: "" });
  };

  const abrirForm = () => {
    setMostrarForm(true);
    setError("");
    setAviso("");
    // Espera a que el formulario aparezca para bajar hasta él
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const abrirNueva = () => {
    setEditandoId(null);
    setForm(formVacio);
    abrirForm();
  };

  const abrirEditar = (d) => {
    setEditandoId(d.id);
    setForm({
      calle: d.calle,
      numero: d.numero,
      pasaje: d.pasaje,
      sector: d.sector,
      region: d.region,
      idComuna: String(d.idComuna),
      descripcion: d.descripcion,
    });
    abrirForm();
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setForm(formVacio);
    setError("");
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.calle.trim() || !form.numero || !form.region || !form.idComuna) {
      setError("Completa todos los campos obligatorios (*).");
      return;
    }
    if (Number(form.numero) <= 0) {
      setError("El número de la dirección debe ser mayor a 0.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      /* console.log(editando ? "[Direcciones] Actualizar dirección:" : "[Direcciones] Crear dirección:", {
        ...(editando && { id: editandoId }),
        ...form,
      }); */

      if (editando) await actualizarDireccion(editandoId, form);
      else await crearDireccion(form);

      cerrarForm();
      setAviso(editando ? "Dirección actualizada." : "Dirección guardada.");
      setVersion((n) => n + 1); // vuelve a pedir la lista para mostrar lo guardado
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // "Eliminar" solo abre el diálogo de confirmación; el borrado ocurre en confirmarEliminar
  const eliminar = (d) => setPorEliminar(d);

  const confirmarEliminar = async () => {
    const d = porEliminar;
    setPorEliminar(null);
    if (!d) return;
    try {
      setEliminandoId(d.id);
      setAviso("");
      setErrorEliminar("");
      await eliminarDireccion(d.id);
      if (editandoId === d.id) cerrarForm();
      setAviso("Dirección eliminada.");
      setVersion((n) => n + 1);
    } catch (err) {
      setAviso("");
      setErrorEliminar(err.message);
    } finally {
      setEliminandoId(null);
    }
  };

  if (!haySesion) return <Navigate to="/login" replace />;

  return (
    <>
      <Header />

      <ConfirmDialog
        open={Boolean(porEliminar)}
        titulo="Eliminar dirección"
        mensaje={porEliminar ? `¿Eliminar la dirección ${porEliminar.calle} ${porEliminar.numero}?` : ""}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />

      <div className="dir-page">
        <div className="dir-content">
          <div className="dir-head">
            <div>
              <h1 className="dir-title">Mis direcciones</h1>
              <div className="dir-subtitle">
                Guarda tus direcciones de despacho para comprar más rápido.
              </div>
            </div>

            <button type="button" className="dir-btn" onClick={abrirNueva} disabled={cargando || Boolean(errorCarga)}>
              + Nueva dirección
            </button>
          </div>

          {aviso && <div className="dir-ok">{aviso}</div>}
          {errorEliminar && <div className="dir-error">{errorEliminar}</div>}

          {/* ---------- Formulario: crear o editar ---------- */}
          {mostrarForm && (
            <form className="dir-form" ref={formRef} onSubmit={guardar}>
              <div className="dir-form-titulo">{editando ? "Editar dirección" : "Nueva dirección"}</div>

              <div className="dir-fila">
                <label className="dir-campo dir-ancho">
                  <span className="dir-label">Calle *</span>
                  <input
                    type="text"
                    className="dir-input"
                    placeholder="Ej. Av. Real"
                    maxLength={100}
                    value={form.calle}
                    onChange={handleChange("calle")}
                  />
                </label>

                <label className="dir-campo">
                  <span className="dir-label">Número *</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="dir-input"
                    placeholder="Ej. 1234"
                    value={form.numero}
                    onChange={cambiarNumero}
                  />
                </label>
              </div>

              <div className="dir-fila">
                <label className="dir-campo">
                  <span className="dir-label">Pasaje / Depto</span>
                  <input
                    type="text"
                    className="dir-input"
                    placeholder="Ej. Pasaje Los Aromos, Depto 302"
                    maxLength={100}
                    value={form.pasaje}
                    onChange={handleChange("pasaje")}
                  />
                </label>

                <label className="dir-campo">
                  <span className="dir-label">Sector / Villa</span>
                  <input
                    type="text"
                    className="dir-input"
                    placeholder="Ej. Villa Los Lagos"
                    maxLength={100}
                    value={form.sector}
                    onChange={handleChange("sector")}
                  />
                </label>
              </div>

              <div className="dir-fila">
                <label className="dir-campo">
                  <span className="dir-label">Región *</span>
                  <select className="dir-input" value={form.region} onChange={cambiarRegion}>
                    <option value="">Seleccionar región</option>
                    {regiones.map((r) => (
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
                    value={form.idComuna}
                    onChange={handleChange("idComuna")}
                    disabled={!form.region}
                  >
                    <option value="">{form.region ? "Seleccionar comuna" : "Primero elige la región"}</option>
                    {comunasDeLaRegion.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
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
                  maxLength={100}
                  placeholder="Ej. Portón negro, dejar con conserjería."
                  value={form.descripcion}
                  onChange={handleChange("descripcion")}
                />
              </label>

              {error && <div className="dir-error">{error}</div>}

              <div className="dir-acciones-form">
                <button type="button" className="dir-btn-secundario" onClick={cerrarForm} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="dir-btn" disabled={guardando}>
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar dirección"}
                </button>
              </div>
            </form>
          )}

          {/* ---------- Lista de direcciones ---------- */}
          {cargando ? (
            <div className="dir-vacio">Cargando tus direcciones...</div>
          ) : errorCarga ? (
            <ErrorState titulo="No pudimos cargar tus direcciones" detalle={errorCarga} onReintentar={reintentar} />
          ) : (
            <div className="dir-lista">
              {direcciones.length === 0 && <div className="dir-vacio">Aún no tienes direcciones guardadas.</div>}

              {direcciones.map((d) => (
                <article key={d.id} className="dir-card">
                  <div className="dir-card-head">
                    <div className="dir-alias">
                      <LocationOnIcon fontSize="small" />
                      {d.calle} {d.numero}
                    </div>
                  </div>

                  {(d.pasaje || d.sector) && (
                    <div className="dir-linea">{[d.pasaje, d.sector].filter(Boolean).join(", ")}</div>
                  )}
                  <div className="dir-linea">{[d.comuna, d.region].filter(Boolean).join(", ")}</div>
                  {d.descripcion && <div className="dir-ref">{d.descripcion}</div>}

                  <div className="dir-acciones">
                    <button type="button" className="dir-link" onClick={() => abrirEditar(d)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="dir-link"
                      onClick={() => eliminar(d)}
                      disabled={eliminandoId === d.id}
                    >
                      {eliminandoId === d.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddressesScreen;