import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import AdminUserTools from "../../components/molecules/AdminUserTools/AdminUserTools";
import AdminUserTable from "../../components/organisms/AdminUserTable/AdminUserTable";
import UserFormDialog from "../../components/organisms/UserFormDialog/UserFormDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { listarUsuarios, crearUsuario as crearUsuarioApi, eliminarUsuario as eliminarUsuarioApi } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";

const POR_PAGINA = 5;

const normalizar = (texto) =>  // texto en minusculas y sin tildes
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const limpiarRut = (rut) => rut.replace(/[.-]/g, ""); //rut sin puntos ni guion

const AdminUserAdministrationScreen = () => {
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  const cambiarFiltro = (setter) => (valor) => {
    setter(valor);
    setPagina(1);
  };

  const cargar = () => {
    setCargando(true);
    setErrorCarga("");
    listarUsuarios()
      .then(setUsuarios)
      .catch((e) => setErrorCarga(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const crearUsuario = async (datos) => {
    const nuevo = await crearUsuarioApi(datos); // si falla, el formulario muestra el error
    setUsuarios([...usuarios, nuevo]);
    // Se limpian los filtros y se va a la última página para que se vea el usuario nuevo
    setBusqueda("");
    setTipo("");
    setEstado("");
    setPagina(Math.ceil((usuarios.length + 1) / POR_PAGINA));
    setDialogoAbierto(false);
  };

  // El ojo abre la ficha completa del usuario
  const verUsuario = (usuario) => {
    navigate(`/usuarios/${encodeURIComponent(usuario.rut)}`);
  };

  const eliminarUsuario = async (usuario) => {
    if (!window.confirm(`¿Eliminar a "${usuario.nombre}"?`)) return;
    setErrorAccion("");
    try {
      await eliminarUsuarioApi(usuario.rut);
      setUsuarios((actuales) => actuales.filter((u) => u.id !== usuario.id));
      mostrarToast("Usuario eliminado correctamente");
    } catch (e) {
      setErrorAccion(e.message);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", marginBottom: 3 }}>
        <Box>
          <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
            Gestión de Usuarios
          </Box>
          <Box sx={{ fontSize: 13, marginTop: 0.5, color: "#666" }}>
            Administra los roles, estados y credenciales de los usuarios.
          </Box>
        </Box>

        <CustomButton variant="primary" onClick={() => setDialogoAbierto(true)} sx={{ border: "2px solid #EC3333" }}>
          + Nuevo
        </CustomButton>
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

        {errorAccion && (
          <Alert severity="error" onClose={() => setErrorAccion("")} sx={{ marginBottom: 2 }}>
            {errorAccion}
          </Alert>
        )}

        {errorCarga ? (
          <ErrorState detalle={errorCarga} onReintentar={cargar} />
        ) : cargando ? (
          <Box sx={{ padding: 3, textAlign: "center", color: "#666", fontSize: 13 }}>Cargando usuarios...</Box>
        ) : (
          <AdminUserTable usuarios={visibles} onVer={verUsuario} onEliminar={eliminarUsuario} />
        )}

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

      <UserFormDialog
        open={dialogoAbierto}
        ruts={usuarios.map((u) => u.rut)}
        onClose={() => setDialogoAbierto(false)}
        onGuardar={crearUsuario}
      />
    </AdminTemplate>
  );
};

export default AdminUserAdministrationScreen;