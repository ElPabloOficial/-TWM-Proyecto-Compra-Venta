import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const columnas = ["SKU", "Producto", "Categoría", "Stock", "Precio Unitario", "Oferta", "Estado", "Acciones"];

const textosOferta = {
  vigente: "Vigente",
  programada: "Programada",
  vencida: "Vencida",
};

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

// Precio con el descuento aplicado, redondeado a peso entero
// TEMPORAL: se calcula en el frontend. Con la base de datos puede venir como
// campo precio_final desde la API (columna generada o calculado en la consulta).
const precioConDescuento = (precio, oferta) =>
  Math.round(Number(precio) * (1 - Number(oferta) / 100));

// 2026-10-31  -> 31/10/2026
const formatoFecha = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

const ProductTable = ({ productos, categorias = [], onEditar, onEliminar }) => {
  const nombreCategoria = (id) =>
    categorias.find((c) => c.id === id)?.nombre ?? "-";

  return (
    <div className="inv-table-wrap">
      <table className="inv-table">
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="inv-empty">
                No hay productos registrados.
              </td>
            </tr>
          )}

          {productos.map((p) => {
            const tieneOferta = p.oferta > 0;
            const ofertaVigente = tieneOferta && p.estadoOferta === "vigente";
            const claseEstado = p.estadoOferta ? `inv-oferta-${p.estadoOferta}` : "";

            return (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.nombre}</td>
                <td>{nombreCategoria(p.categoriaId)}</td>
                <td>{p.stock}</td>
                <td>
                  {ofertaVigente ? (
                    <>
                      <div className="inv-precio-original">{formatoPrecio(p.precio)}</div>
                      <div className="inv-precio-final">
                        {formatoPrecio(precioConDescuento(p.precio, p.oferta))}
                      </div>
                    </>
                  ) : (
                    formatoPrecio(p.precio)
                  )}
                </td>
                <td>
                  {!tieneOferta ? (
                    "-"
                  ) : (
                    <>
                      <div className={`inv-oferta-pct ${claseEstado}`}>-{p.oferta}%</div>
                      <div className="inv-oferta-fechas">
                        {formatoFecha(p.ofertaInicio)} al {formatoFecha(p.ofertaFin)}
                      </div>
                      {textosOferta[p.estadoOferta] && (
                        <div className={`inv-oferta-estado ${claseEstado}`}>
                          {textosOferta[p.estadoOferta]}
                        </div>
                      )}
                    </>
                  )}
                </td>
                <td className={`inv-estado ${p.stock > 0 ? "ok" : "sin"}`}>
                  {p.stock > 0 ? "En Stock" : "Sin stock"}
                </td>
                <td>
                  <button
                    type="button"
                    className="inv-icon-btn"
                    onClick={() => onEditar(p)}
                    aria-label="Editar"
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    type="button"
                    className="inv-icon-btn"
                    onClick={() => onEliminar(p)}
                    aria-label="Eliminar"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;