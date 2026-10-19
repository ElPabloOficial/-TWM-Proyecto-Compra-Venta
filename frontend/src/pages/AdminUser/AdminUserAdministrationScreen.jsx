import { useState } from "react";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import AdminUserTools from "../../components/molecules/AdminUserTools/AdminUserTools";
import AdminUserTable from "../../components/organisms/AdminUserTable/AdminUserTable";

const POR_PAGINA = 5;

//Para probar:
const usuariosIniciales = [
  { id: 1, rut: "12345678-9", nombre: "María José Henríquez", correo: "m.henriquez@ahorraton.cl", tipo: "vendedor", estado: "activo", registro: "2025-04-12" },
];

const normalizar = (texto) =>  // texto en minusculas y sin tildes
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const limpiarRut = (rut) => rut.replace(/[.-]/g, ""); //rut sin puntos ni guion

const AdminUserAdministrationScreen = () => {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);

  const cambiarFiltro = (setter) => (valor) => {
    setter(valor);
    setPagina(1);
  };

  const verUsuario = (usuario) => {
    //... Pendiente (Conectar con otra pantalla)
  };

  const eliminarUsuario = (usuario) => {
    if (window.confirm(`¿Eliminar a "${usuario.nombre}"?`)) {
      setUsuarios(usuarios.filter((u) => u.id !== usuario.id));
      //sujeto a cambios despues
    }
  };
  const texto = normalizar(busqueda.trim()); //filtros nombre, rut, tipo o estado
  const textoRut = limpiarRut(texto);

  const filtrados = usuarios.filter((u) => {
    const coincideBusqueda =
      texto === "" ||
      normalizar(u.nombre).includes(texto) ||
      (textoRut !== "" && limpiarRut(u.rut).includes(textoRut));
    const coincideTipo = tipo === "" || u.tipo === tipo;
    const coincideEstado = estado === "" || u.estado === estado;
    return coincideBusqueda && coincideTipo && coincideEstado;
  });
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));  //paginas
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);

  return (
    <AdminTemplate>
      <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
        Gestión de Usuarios
      </Box>
      <Box sx={{ fontSize: 13, marginTop: 0.5, marginBottom: 3, color: "#666" }}>
        Administra los roles, estados y credenciales de los usuarios.
      </Box>

      <Box sx={{ backgroundColor: "#fff", borderRadius: 1, padding: 2 }}>
        <AdminUserTools
          busqueda={busqueda}
          onBusqueda={cambiarFiltro(setBusqueda)}
          tipo={tipo}
          onTipo={cambiarFiltro(setTipo)}
          estado={estado}
          onEstado={cambiarFiltro(setEstado)}
        />

        <AdminUserTable
          usuarios={visibles}
          onVer={verUsuario}
          onEliminar={eliminarUsuario}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2, fontSize: 12 }}>
          <Box>Total: {filtrados.length} usuario{filtrados.length !== 1 ? "s" : ""}</Box>
          <Pagination
            count={totalPaginas}
            page={paginaActual}
            onChange={(_, valor) => setPagina(valor)}
            size="small"
            shape="rounded"
            sx={{ "& .Mui-selected": { backgroundColor: "#EC3333 !important", color: "#fff" } }}
          />
        </Box>
      </Box>
    </AdminTemplate>
  );
};

export default AdminUserAdministrationScreen;