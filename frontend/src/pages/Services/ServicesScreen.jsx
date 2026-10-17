import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import CustomButton from "../../components/atoms/Button/CustomButton";
import CustomDialog from "../../components/atoms/CustomDialog/CustomDialog";
import { useProductos } from "../../context/ProductContext";
import { useServicios } from "../../context/ServiceContext";
import "../../styles/Inventory.css";

const POR_PAGINA = 6;
const columnas = ["Código", "Servicio", "Categoría", "Modalidad", "Duración", "Precio", "Oferta", "Edad", "Acciones"];

const comparadores = {
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  precioAsc: (a, b) => a.precio - b.precio,
  precioDesc: (a, b) => b.precio - a.precio,
  duracionAsc: (a, b) => a.duracion - b.duracion,
  duracionDesc: (a, b) => b.duracion - a.duracion,
};

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

// 2026-10-31 -> 31/10/2026
const formatoFecha = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

const textosOferta = { vigente: "Vigente", programada: "Programada", vencida: "Vencida" };

// Calcula si la oferta está vigente, programada o vencida según la fecha de hoy
const estadoOferta = (s) => {
  if (!(s.oferta > 0)) return "";
  const hoy = new Date().toISOString().slice(0, 10);
  if (hoy < s.ofertaInicio) return "programada";
  if (hoy > s.ofertaFin) return "vencida";
  return "vigente";
};

const ServicesScreen = () => {
  const navigate = useNavigate();
  const { categorias } = useProductos();
  const { servicios, eliminarServicio } = useServicios();

  const [servicioEliminar, setServicioEliminar] = useState(null);
  const [orden, setOrden] = useState("");
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  const nombreCategoria = (id) => categorias.find((c) => c.id === id)?.nombre ?? "-";

  // Al presionar el icono de eliminar se abre el diálogo
  const confirmarEliminar = (servicio) => setServicioEliminar(servicio);

  // Al presionar "Eliminar" en el diálogo se borra el servicio
  const eliminar = () => {
    console.log("[ServicesScreen] confirmarEliminar() - ELIMINAR servicio:", servicioEliminar);
    eliminarServicio(servicioEliminar.id);
    setServicioEliminar(null);
  };

  const cambiarOrden = (valor) => { setOrden(valor); setPagina(1); };
  const cambiarFiltro = (valor) => { setFiltro(valor); setPagina(1); };
  const verTodos = () => { setOrden(""); setFiltro(""); setPagina(1); };

  const filtrados = servicios.filter((s) => {
    if (filtro === "oferta") return estadoOferta(s) === "vigente";
    if (filtro === "mayores") return s.restriccionEdad;
    if (filtro === "todos") return !s.restriccionEdad;
    if (filtro === "online") return s.modalidad === "Online";
    return true;
  });
  const ordenados = orden ? [...filtrados].sort(comparadores[orden]) : filtrados;

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const desde = ordenados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

  const mayores = servicios.filter((s) => s.restriccionEdad).length;
  const precioPromedio = servicios.length
    ? Math.round(servicios.reduce((acc, s) => acc + s.precio, 0) / servicios.length)
    : 0;
  const enOferta = servicios.filter((s) => estadoOferta(s) === "vigente").length;

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Gestión de Servicios</h1>
          <div className="inv-subtitle">
            Administra los servicios que ofreces, su precio, duración y disponibilidad.
          </div>
        </div>

        <CustomButton
          variant="primary"
          onClick={() => navigate("/servicios/nuevo")}
          sx={{ border: "2px solid #EC3333" }}
        >
          + Nuevo Servicio
        </CustomButton>
      </div>

      <div className="inv-stats">
        <StatCard titulo="Total de Servicios" valor={servicios.length} />
        <StatCard titulo="Solo mayores de 18" valor={mayores} />
        <StatCard titulo="Precio Promedio" valor={`$ ${precioPromedio.toLocaleString("es-CL")}`} />
        <StatCard titulo="Servicios en oferta" valor={enOferta} />
      </div>

      <div className="inv-panel">
        <div className="inv-toolbar">
          <div>
            <b>Servicios</b>
            <span className="inv-toolbar-count">{ordenados.length} servicios</span>
          </div>

          <div className="inv-toolbar-actions">
            <button type="button" className="inv-link-red" onClick={verTodos}>
              Ver Todos
            </button>

            <select className="inv-select" value={orden} onChange={(e) => cambiarOrden(e.target.value)}>
              <option value="">Ordenar</option>
              <option value="nombre">Nombre (A-Z)</option>
              <option value="precioAsc">Precio: menor a mayor</option>
              <option value="precioDesc">Precio: mayor a menor</option>
              <option value="duracionAsc">Duración: menor a mayor</option>
              <option value="duracionDesc">Duración: mayor a menor</option>
            </select>

            <select className="inv-select" value={filtro} onChange={(e) => cambiarFiltro(e.target.value)}>
              <option value="">Filtros</option>
              <option value="oferta">En oferta</option>
              <option value="mayores">Solo mayores de 18</option>
              <option value="todos">Para todas las edades</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>{columnas.map((col) => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={columnas.length} className="inv-empty">
                    No hay servicios registrados.
                  </td>
                </tr>
              )}

              {visibles.map((s) => (
                <tr key={s.id}>
                  <td>{s.codigo}</td>
                  <td>{s.nombre}</td>
                  <td>{nombreCategoria(s.categoriaId)}</td>
                  <td>{s.modalidad}</td>
                  <td>{s.duracion} min</td>
                  <td>{formatoPrecio(s.precio)}</td>
                  <td>
                    {!(s.oferta > 0) ? (
                      "-"
                    ) : (
                      <>
                        <div className={`inv-oferta-pct inv-oferta-${estadoOferta(s)}`}>-{s.oferta}%</div>
                        <div className="inv-oferta-fechas">
                          {formatoFecha(s.ofertaInicio)} al {formatoFecha(s.ofertaFin)}
                        </div>
                        <div className={`inv-oferta-estado inv-oferta-${estadoOferta(s)}`}>
                          {textosOferta[estadoOferta(s)]}
                        </div>
                      </>
                    )}
                  </td>
                  <td>{s.restriccionEdad ? "+18" : "Todo público"}</td>
                  <td>
                    <button
                      type="button"
                      className="inv-icon-btn"
                      onClick={() => navigate(`/servicios/editar/${s.id}`)}
                      aria-label="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      type="button"
                      className="inv-icon-btn"
                      onClick={() => confirmarEliminar(s)}
                      aria-label="Eliminar"
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
          <div>Mostrando {desde}-{hasta} de {ordenados.length} servicios</div>

          <div className="inv-pagination">
            <button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>‹</button>
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
            <button type="button" disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}>›</button>
          </div>
        </div>
      </div>

      <CustomDialog
        open={Boolean(servicioEliminar)}
        onClose={() => setServicioEliminar(null)}
        title="Eliminar servicio"
        maxWidth="xs"
        actions={
          <>
            <CustomButton variant="secondary" size="small" onClick={() => setServicioEliminar(null)}>
              Cancelar
            </CustomButton>
            <CustomButton
              variant="primary"
              size="small"
              onClick={eliminar}
              sx={{ border: "2px solid #EC3333" }}
            >
              Eliminar
            </CustomButton>
          </>
        }
      >
        ¿Seguro que quieres eliminar "{servicioEliminar?.nombre}"?
      </CustomDialog>
    </SellerTemplate>
  );
};

export default ServicesScreen;