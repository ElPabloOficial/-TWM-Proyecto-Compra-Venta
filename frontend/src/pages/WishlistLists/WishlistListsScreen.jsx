import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import WishlistFormDialog from "../../components/organisms/WishlistFormDialog/WishlistFormDialog";
import { listarListasDeseos, crearListaDeseos } from "../../services/wishlistService";
import { useToast } from "../../context/ToastContext";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";

import "../../styles/WishlistLists.css";

const WishlistListsScreen = () => {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [listas, setListas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    listarListasDeseos()
      .then((datos) => activo && setListas(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, []);

  const abrirLista = (id) => navigate(`/listadedeseos?lista=${id}`);

  const crearLista = async (datos) => {
    const nueva = await crearListaDeseos(datos); // si falla, el formulario muestra el error
    setListas((actuales) => [...actuales, nueva]);
    setDialogoAbierto(false);
    mostrarToast("Lista creada correctamente");
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
          {!cargando && !error && (
            <div className="wl-acciones">
              <div className="wl-contador">
                {listas.length} {listas.length === 1 ? "lista" : "listas"}
              </div>
              <CustomButton
                variant="primary"
                size="medium"
                onClick={() => setDialogoAbierto(true)}
                sx={{ border: "2px solid #EC3333", textTransform: "none" }}
              >
                + Nuevo
              </CustomButton>
            </div>
          )}
        </section>

        {cargando && <p className="wl-mensaje">Cargando tus listas...</p>}
        {error && <p className="wl-mensaje wl-error">{error}</p>}

        {!cargando && !error && listas.length === 0 && (
          <section className="wl-vacio">
            <FavoriteIcon className="wl-vacio-icono" />
            <h2>Todavía no tienes listas de deseos</h2>
            <p>Guarda productos o servicios con el corazón y aparecerán aquí.</p>
            <CustomButton variant="primary" size="medium" onClick={() => navigate("/inicio")} sx={{ textTransform: "none" }}>
              Seguir comprando
            </CustomButton>
          </section>
        )}

        {!cargando && !error && listas.length > 0 && (
          <ul className="wl-grid">
            {listas.map((lista) => (
              <li key={lista.id}>
                <button type="button" className="wl-tarjeta" onClick={() => abrirLista(lista.id)}>
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
              </li>
            ))}
          </ul>
        )}
      </main>

      <WishlistFormDialog
        open={dialogoAbierto}
        nombres={listas.map((l) => l.nombre)}
        onClose={() => setDialogoAbierto(false)}
        onGuardar={crearLista}
      />
    </>
  );
};

export default WishlistListsScreen;
