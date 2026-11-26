import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import CustomDialog from "../../components/atoms/CustomDialog/CustomDialog";
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

const POR_PAGINA = 6;

const formVacio = { nombre: "", alto: "", ancho: "", fondo: "", peso: "", divisor: "5000", tarifaKg: "", tarifaMinima: "", dias: "" };

const numero = (n) => Number(n).toLocaleString("es-CL");

const ShippingCostsScreen = () => {
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [pagina, setPagina] = useState(1);

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState(""); // error dentro del formulario
  const [errorAccion, setErrorAccion] = useState(""); // error al eliminar
  const [guardando, setGuardando] = useState(false);
  const [porEliminar, setPorEliminar] = useState(null); // empresa que espera confirmación

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

  // El volumen máximo es alto × ancho × fondo (se calcula, no se escribe)
  const volumen = Number(form.alto || 0) * Number(form.ancho || 0) * Number(form.fondo || 0);

  // ---------- Paginación ----------
  const totalPaginas = Math.max(1, Math.ceil(empresas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = empresas.slice(inicio, inicio + POR_PAGINA);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const desde = empresas.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  // ---------- Totales ----------
  const conDespachos = empresas.filter((e) => e.despachos > 0).length;

  // ---------- Acciones ----------
  const nuevaEmpresa = () => {
    setEditandoId(null);
    setForm(formVacio);
    setError("");
    setDialogoAbierto(true);
  };

  const editarEmpresa = (e) => {
    setEditandoId(e.id);
    setForm({
      nombre: e.nombre,
      alto: String(e.alto),
      ancho: String(e.ancho),
      fondo: String(e.fondo),
      peso: String(e.peso),
      divisor: String(e.divisor || 5000),
      tarifaKg: e.tarifaKg ? String(e.tarifaKg) : "",
      tarifaMinima: e.tarifaMinima != null ? String(e.tarifaMinima) : "",
      dias: e.dias ? String(e.dias) : "",
    });
    setError("");
    setDialogoAbierto(true);
  };

  const cerrarDialogo = () => {
    if (guardando) return;
    setDialogoAbierto(false);
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
    if (!(Number(form.divisor) > 0)) return setError("El divisor volumétrico debe ser mayor a 0 (lo habitual es 5000).");
    if (!(Number(form.tarifaKg) > 0)) return setError("La tarifa por kg debe ser mayor a 0.");
    if (form.tarifaMinima === "") return setError("Indica la tarifa mínima (puede ser 0).");
    if (!(Number(form.dias) > 0)) return setError("El plazo de entrega debe ser de al menos 1 día.");

    const datos = { ...(editando ? { id: editandoId } : {}), ...form, nombre };

    // Requisito del proyecto: se muestra en la consola lo que se envía a la API
    console.log(editando ? "[Envíos] Actualizar empresa:" : "[Envíos] Crear empresa:", datos);

    setGuardando(true);
    setError("");
    try {
      if (editando) await shippingService.actualizarEmpresa(datos);
      else await shippingService.crearEmpresa(datos);

      setDialogoAbierto(false);
      setEditandoId(null);
      setForm(formVacio);
      setErrorAccion("");
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
    setErrorAccion("");
    try {
      await shippingService.eliminarEmpresa(empresa.id);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErrorAccion(err.message);
    }
  };

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Empresas de despacho</h1>
          <div className="inv-subtitle">
            Define el tamaño y el peso máximos de un paquete y la tarifa de cada empresa de despacho.
            El comprador elige entre las empresas que pueden llevar su pedido y paga la tarifa al comprar.
          </div>
        </div>

        <CustomButton variant="primary" onClick={nuevaEmpresa} sx={{ border: "2px solid #EC3333" }}>
          + Nueva empresa
        </CustomButton>
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
        <>
          <div className="inv-stats">
            <StatCard titulo="Total de empresas" valor={empresas.length} />
            <StatCard titulo="Con despachos registrados" valor={conDespachos} />
            <StatCard titulo="Sin despachos" valor={empresas.length - conDespachos} />
          </div>

          {errorAccion && (
            <div className="env-error env-error-pagina" role="alert">
              {errorAccion}
            </div>
          )}

          <div className="inv-panel">
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Alto máx.</th>
                    <th>Ancho máx.</th>
                    <th>Fondo máx.</th>
                    <th>Peso máx.</th>
                    <th>Tarifa por kg</th>
                    <th>Mínimo</th>
                    <th>Plazo</th>
                    <th>Despachos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.length === 0 && (
                    <tr>
                      <td colSpan={10} className="inv-empty">
                        No hay empresas de despacho registradas.
                      </td>
                    </tr>
                  )}

                  {visibles.map((e) => (
                    <tr key={e.id}>
                      <td className="env-nombre">{e.nombre}</td>
                      <td>{numero(e.alto)} cm</td>
                      <td>{numero(e.ancho)} cm</td>
                      <td>{numero(e.fondo)} cm</td>
                      <td>{numero(e.peso)} g</td>
                      <td>${numero(e.tarifaKg)}</td>
                      <td>${numero(e.tarifaMinima)}</td>
                      <td>{e.dias} {e.dias === 1 ? "día" : "días"}</td>
                      <td>{numero(e.despachos)}</td>
                      <td>
                        <button
                          type="button"
                          className="inv-icon-btn"
                          onClick={() => editarEmpresa(e)}
                          aria-label={`Editar ${e.nombre}`}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          className="inv-icon-btn"
                          onClick={() => setPorEliminar(e)}
                          disabled={e.despachos > 0}
                          aria-label={`Eliminar ${e.nombre}`}
                          title={e.despachos > 0 ? "Tiene despachos registrados: no se puede eliminar" : "Eliminar"}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="inv-footer">
              <div>
                Mostrando {desde}-{hasta} de {empresas.length} empresas
              </div>

              <div className="inv-pagination">
                <button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>
                  ‹
                </button>
                {paginas.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === paginaActual ? "activa" : ""}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPagina(paginaActual + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- Formulario: nueva empresa o edición ---------- */}
      <CustomDialog
        open={dialogoAbierto}
        onClose={cerrarDialogo}
        title={editando ? "Editar empresa de despacho" : "Nueva empresa de despacho"}
        maxWidth="sm"
        actions={
          <>
            <CustomButton variant="secondary" size="small" onClick={cerrarDialogo} disabled={guardando}>
              Cancelar
            </CustomButton>
            <CustomButton
              variant="primary"
              size="small"
              type="submit"
              form="form-empresa-despacho"
              disabled={guardando}
              sx={{ border: "2px solid #EC3333" }}
            >
              {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar empresa"}
            </CustomButton>
          </>
        }
      >
        <form id="form-empresa-despacho" className="env-form" onSubmit={guardar} noValidate>
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
                autoFocus
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

          <div className="env-subtitulo">Tarifa del envío</div>
          <div className="env-fila">
            <label className="env-campo">
              <span className="env-label">Tarifa por kg ($) *</span>
              <input type="text" inputMode="numeric" className="env-input" placeholder="1900" value={form.tarifaKg} onChange={handleNumero("tarifaKg", 7)} />
            </label>
            <label className="env-campo">
              <span className="env-label">Tarifa mínima ($) *</span>
              <input type="text" inputMode="numeric" className="env-input" placeholder="3990" value={form.tarifaMinima} onChange={handleNumero("tarifaMinima", 7)} />
            </label>
          </div>
          <div className="env-fila">
            <label className="env-campo">
              <span className="env-label">Divisor volumétrico *</span>
              <input type="text" inputMode="numeric" className="env-input" placeholder="5000" value={form.divisor} onChange={handleNumero("divisor", 5)} />
            </label>
            <label className="env-campo">
              <span className="env-label">Plazo de entrega (días) *</span>
              <input type="text" inputMode="numeric" className="env-input" placeholder="3" value={form.dias} onChange={handleNumero("dias", 2)} />
            </label>
          </div>

          <div className="env-ayuda">
            El volumen máximo es alto × ancho × fondo. El peso va en gramos, igual que el peso de los productos
            (por ejemplo, 25.000 g = 25 kg). El comprador paga el mayor entre el peso real y el peso volumétrico
            (alto × ancho × fondo ÷ divisor), por la tarifa por kg, con un mínimo.
          </div>

          {error && (
            <div className="env-error" role="alert">
              {error}
            </div>
          )}
        </form>
      </CustomDialog>

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
