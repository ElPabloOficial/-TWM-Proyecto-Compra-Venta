import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton, Popover, Box, Chip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

const acortar = (texto, max = 25) =>
  texto.length > max ? texto.slice(0, max) + "..." : texto;

const formatearFecha = (fechaISO) => {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
};

const MessageModerationTable = ({ mensajes, ocupado = null, onEliminar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const abrirBurbuja = (event, mensaje) => {
    setAnchorEl(event.currentTarget);
    setMensajeSeleccionado(mensaje);
  };
  const cerrarBurbuja = () => {
    setAnchorEl(null);
    setMensajeSeleccionado(null);
  };
  const abierto = Boolean(anchorEl);
    return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Mensaje</TableCell>
            <TableCell>Palabras detectadas</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mensajes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ color: "#666", padding: 3 }}>
                No hay mensajes ni reseñas con palabras ofensivas para mostrar.
              </TableCell>
            </TableRow>
          )}

          {mensajes.map((m) => (
            <TableRow key={m.clave} hover>
              <TableCell>{m.id}</TableCell>
              <TableCell>{m.cliente}</TableCell>
              <TableCell>{m.tipo}</TableCell>
              <TableCell>{m.mensaje ? acortar(m.mensaje) : <em style={{ color: "#888" }}>Sin comentario</em>}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {m.palabras.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      size="small"
                      sx={{ backgroundColor: "#e6cad1", color: "#EC3333", fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell>{formatearFecha(m.fecha)}</TableCell>

              <TableCell align="center">
                <IconButton size="small" onClick={(e) => abrirBurbuja(e, m)} title="Ver">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onEliminar(m)} disabled={ocupado === m.clave} title="Eliminar">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Popover
        open={abierto}
        anchorEl={anchorEl}
        onClose={cerrarBurbuja}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box sx={{ position: "relative", padding: 2, maxWidth: 300 }}>
          <IconButton
            size="small"
            onClick={cerrarBurbuja}
            sx={{ position: "absolute", top: 4, right: 4 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box sx={{ fontWeight: 600, paddingRight: 3 }}>
            {mensajeSeleccionado?.cliente}
          </Box>
          {mensajeSeleccionado?.detalle && (
            <Box sx={{ fontSize: 12, color: "#888", marginBottom: 1 }}>
              {mensajeSeleccionado.detalle}
            </Box>
          )}
          <Box sx={{ fontSize: 14 }}>
            {mensajeSeleccionado?.mensaje || "Sin comentario"}
          </Box>
          {mensajeSeleccionado?.palabras?.length > 0 && (
            <Box sx={{ fontSize: 12, color: "#EC3333", marginTop: 1 }}>
              Palabras detectadas: {mensajeSeleccionado.palabras.join(", ")}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default MessageModerationTable;