import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import WishlistFormDialog from "../../components/organisms/WishlistFormDialog/WishlistFormDialog";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import {
  listarListasDeseos,
  crearListaDeseos,
  actualizarListaDeseos,
  eliminarListaDeseos,
} from "../../services/wishlistService";
import { useToast } from "../../context/ToastContext";
import useCart from "../../context/useCart";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";

import "../../styles/WishlistLists.css";

const WishlistListsScreen = () => {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const { user } = useCart(); // se actualiza solo si la sesión se cierra automáticamente
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [listaEditando, setListaEditando] = useState(null); // null = creando una nueva
  const [listaAEliminar, setListaAEliminar] = useState(null);
  const [listas, setListas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      // Sin sesión no se consulta la API: se muestra "Inicia sesión" en vez de un error
      setListas([]);
      setError("");
      setCargando(false);
      return undefined;
    }
    let activo = true;
    setCargando(true);
    listarListasDeseos()
      .then((datos) => activo && setListas(datos))
      .catch((e) => activo && !e.sesionCerrada && setError(e.message))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [user]);

  const abrirLista = (id) => navigate(`/listadedeseos?lista=${id}`);

  const abrirNueva = () => {
    setListaEditando(null);
    setDialogoAbierto(true);
  };

  const abrirEditar = (lista) => {
    setListaEditando(lista);
    setDialogoAbierto(true);
  };

  // Crea o edita según el formulario; si falla, el formulario muestra el error
  const guardarLista = async (datos) => {
    console.log(listaEditando ? "[Listas de deseos] Actualizar lista:" : "[Listas de deseos] Crear lista:", {
      ...(listaEditando && { id: listaEditando.id }),
      ...datos,
    });
    if (listaEditando) {
      const actualizada = await actualizarListaDeseos(listaEditando.id, datos);
      setListas((actuales) => actuales.map((l) => (l.id === actualizada.id ? { ...actualizada } : l)));
      mostrarToast("Lista actualizada correctamente");
    } else {
      const nueva = await crearListaDeseos(datos);
      setListas((actuales) => [...actuales, nueva]);
      mostrarToast("Lista creada correctamente");
    }
    setDialogoAbierto(false);
  };

  const confirmarEliminar = async () => {
    console.log("[Listas de deseos] Eliminar lista:", { id: listaAEliminar.id, nombre: listaAEliminar.nombre });
    try {
      await eliminarListaDeseos(listaAEliminar.id);
      setListas((actuales) => actuales.filter((l) => l.id !== listaAEliminar.id));
      mostrarToast("Lista eliminada correctamente");
    } catch (e) {
      mostrarToast(e.message, "error");
    }
    setListaAEliminar(null);
  };

  return (
    <>
      <Header />

      <main className="wl-page">
        <CustomButton
          variant="secondary"
          size="medium"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            border: "none",
            backgroundColor: "transparent",
            padding: "8px 0",
            marginBottom: "20px",
            justifyContent: "flex-start",
            textTransform: "none",
            "&:hover": { backgroundColor: "transparent", color: "#EC3333" },
          }}
        >
          Volver
        </CustomButton>

        <section className="wl-cabecera">
          <div>
            <h1>Mis listas de deseos</h1>
            <p className="wl-subtitulo">Elige una lista para ver los productos y servicios que guardaste.</p>
          </div>
          {user && !cargando && !error && (
            <div className="wl-acciones">
              <div className="wl-contador">
                {listas.length} {listas.length === 1 ? "lista" : "listas"}
              </div>
              <CustomButton
                variant="primary"
                size="medium"
                onClick={abrirNueva}
                sx={{ border: "2px solid #EC3333", textTransform: "none" }}
              >
                + Nuevo
              </CustomButton>
            </div>
          )}
        </section>

        {!user && (
          <section className="wl-vacio">
            <FavoriteIcon className="wl-vacio-icono" />
            <h2>Inicia sesión para ver tus listas</h2>
            <p>Tus productos y servicios guardados aparecen aquí cuando entras a tu cuenta.</p>
            <CustomButton variant="primary" size="medium" onClick={() => navigate("/login")} sx={{ textTransform: "none" }}>
              Iniciar sesión
            </CustomButton>
          </section>
        )}

        {user && cargando && <p className="wl-mensaje">Cargando tus listas...</p>}
        {user && error && <p className="wl-mensaje wl-error">{error}</p>}

        {user && !cargando && !error && listas.length === 0 && (
          <section className="wl-vacio">
            <FavoriteIcon className="wl-vacio-icono" />
            <h2>Todavía no tienes listas de deseos</h2>
            <p>Guarda productos o servicios con el corazón y aparecerán aquí.</p>
            <CustomButton variant="primary" size="medium" onClick={() => navigate("/inicio")} sx={{ textTransform: "none" }}>
              Seguir comprando
            </CustomButton>
          </section>
        )}

        {user && !cargando && !error && listas.length > 0 && (
          <ul className="wl-grid">
            {listas.map((lista) => (
              <li key={lista.id}>
                <div className="wl-tarjeta">
                  <button type="button" className="wl-tarjeta-abrir" onClick={() => abrirLista(lista.id)}>
                    <span className="wl-tarjeta-icono">
                      <FavoriteIcon fontSize="small" />
                    </span>

                    <span className="wl-tarjeta-texto">
                      <span className="wl-tarjeta-nombre">{lista.nombre}</span>
                      <span className="wl-tarjeta-desc">{lista.descripcion || "Sin descripción"}</span>
                    </span>

                    <span className="wl-tarjeta-pie">
                      <span className="wl-tarjeta-cantidad">
                        {lista.cantidad} {lista.cantidad === 1 ? "elemento" : "elementos"}
                      </span>
                      <span className={`wl-etiqueta ${lista.publica ? "publica" : "privada"}`}>
                        {lista.publica ? "Pública" : "Privada"}
                      </span>
                    </span>
                  </button>

                  <div className="wl-tarjeta-acciones">
                    <button type="button" className="wl-link" onClick={() => abrirEditar(lista)}>
                      Editar
                    </button>
                    <button type="button" className="wl-link" onClick={() => setListaAEliminar(lista)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <WishlistFormDialog
        open={dialogoAbierto}
        lista={listaEditando}
        nombres={listas.filter((l) => l.id !== listaEditando?.id).map((l) => l.nombre)}
        onClose={() => setDialogoAbierto(false)}
        onGuardar={guardarLista}
      />

      <ConfirmDialog
        open={Boolean(listaAEliminar)}
        titulo="Eliminar lista"
        mensaje={`¿Seguro que quieres eliminar la lista "${listaAEliminar?.nombre ?? ""}"? Se quitarán también los elementos que guardaste en ella. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setListaAEliminar(null)}
      />
    </>
  );
};

export default WishlistListsScreen;