import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

const formatearFecha = (fechaISO) => {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const coloresEstado = {
  activo: { backgroundColor: "#DFF3EA", color: "#1B8A5A" },
  inactivo: { backgroundColor: "#e6cad1", color: "#EC3333" },
};

const AdminUserTable = ({ usuarios, onVer, onEliminar }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Rut</TableCell>
          <TableCell>Nombre</TableCell>
          <TableCell>Correo Electrónico</TableCell>
          <TableCell>Tipo</TableCell>
          <TableCell>Estado</TableCell>
          <TableCell>Registro</TableCell>
          <TableCell align="center">Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {usuarios.map((u) => (
          <TableRow key={u.id} hover>
            <TableCell>{u.rut}</TableCell>
            <TableCell>{u.nombre}</TableCell>
            <TableCell>{u.correo}</TableCell>
            <TableCell>{capitalizar(u.tipo)}</TableCell>
            <TableCell>
              <Chip label={capitalizar(u.estado)} size="small" sx={coloresEstado[u.estado]} />
            </TableCell>
            <TableCell>{formatearFecha(u.registro)}</TableCell>
            <TableCell align="center">
              <IconButton size="small" onClick={() => onVer(u)} title="Ver">
                <VisibilityIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onEliminar(u)} title="Eliminar">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminUserTable;