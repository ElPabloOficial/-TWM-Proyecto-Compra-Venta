import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton, Popover, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

const acortar = (texto, max = 25) =>
  texto.length > max ? texto.slice(0, max) + "..." : texto;

const formatearFecha = (fechaISO) => {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
};

const MessageModerationTable = ({ mensajes, onAprobar, onEliminar }) => {
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
            <TableCell>Cliente</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Mensaje</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mensajes.map((m) => (
            <TableRow key={m.id} hover>
              <TableCell>{m.id}</TableCell>
              <TableCell>{m.cliente}</TableCell>
              <TableCell>{m.tipo}</TableCell>
              <TableCell>{acortar(m.mensaje)}</TableCell>
              <TableCell>{formatearFecha(m.fecha)}</TableCell>

              <TableCell align="center">
                <IconButton size="small" onClick={(e) => abrirBurbuja(e, m)} title="Ver">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onAprobar(m)} title="Aprobar">
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onEliminar(m)} title="Eliminar">
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
          <Box sx={{ fontWeight: 600, marginBottom: 1, paddingRight: 3 }}>
            {mensajeSeleccionado?.cliente}
          </Box>
          <Box sx={{ fontSize: 14 }}>
            {mensajeSeleccionado?.mensaje}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default MessageModerationTable;