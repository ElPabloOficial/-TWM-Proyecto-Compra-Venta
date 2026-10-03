import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const columnas = ["SKU", "Producto", "Categoría", "Stock", "Precio Unitario", "Oferta", "Estado", "Acciones"];

const coloresOferta = {
  vigente: "#EC3333",
  programada: "#F59E0B",
  vencida: "#9CA3AF",
};

const textosOferta = {
  vigente: "Vigente",
  programada: "Programada",
  vencida: "Vencida",
};

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

// TEMPORAL: Precio con el descuento aplicado, redondeado a peso entero
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
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columnas.map((col) => (
              <TableCell key={col} sx={{ fontWeight: 700 }}>
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.length === 0 && (
            <TableRow>
              <TableCell colSpan={columnas.length} align="center">
                No hay productos registrados.
              </TableCell>
            </TableRow>
          )}

          {productos.map((p) => {
            const tieneOferta = p.oferta > 0;
            const ofertaVigente = tieneOferta && p.estadoOferta === "vigente";
            const color = coloresOferta[p.estadoOferta] ?? "inherit";

            return (
              <TableRow key={p.id}>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{p.nombre}</TableCell>
                <TableCell>{nombreCategoria(p.categoriaId)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  {ofertaVigente ? (
                    <>
                      <Box
                        sx={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          textDecoration: "line-through",
                        }}
                      >
                        {formatoPrecio(p.precio)}
                      </Box>
                      <Box sx={{ fontWeight: 700, color }}>
                        {formatoPrecio(precioConDescuento(p.precio, p.oferta))}
                      </Box>
                    </>
                  ) : (
                    formatoPrecio(p.precio)
                  )}
                </TableCell>
                <TableCell>
                  {!tieneOferta ? (
                    "-"
                  ) : (
                    <>
                      <Box sx={{ color, fontWeight: 700 }}>-{p.oferta}%</Box>
                      <Box sx={{ fontSize: 11 }}>
                        {formatoFecha(p.ofertaInicio)} al {formatoFecha(p.ofertaFin)}
                      </Box>
                      {textosOferta[p.estadoOferta] && (
                        <Box sx={{ fontSize: 11, color }}>
                          {textosOferta[p.estadoOferta]}
                        </Box>
                      )}
                    </>
                  )}
                </TableCell>
                <TableCell sx={{ color: p.stock > 0 ? "#16A34A" : "#EF4444", fontWeight: 700 }}>
                  {p.stock > 0 ? "En Stock" : "Sin stock"}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => onEditar(p)} aria-label="Editar">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onEliminar(p)} aria-label="Eliminar">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTable;