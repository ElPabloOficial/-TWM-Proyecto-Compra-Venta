import { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import CustomButton from "../../atoms/Button/CustomButton";
import WishlistFormDialog from "../WishlistFormDialog/WishlistFormDialog";
import { obtenerListasDeItem, guardarItemEnListas } from "../../../services/wishlistService";

/*
 * Diálogo "Agregar a una lista": muestra las listas de deseos del usuario con una casilla por lista
 * y guarda el producto o servicio en las que quede marcadas (y lo quita de las desmarcadas).
 * Las listas nuevas se crean al presionar "Guardar", con este producto o servicio como primero
 * (en la base de datos una lista pertenece al usuario mientras tenga algo guardado).
 *
 * `tipo`: "producto" | "servicio".
 * `onGuardado({ enAlguna, cantidad })`: se llama después de guardar, para actualizar el corazón y mostrar un aviso.
 */
const AddToListDialog = ({ open, onClose, tipo = "producto", itemId, onGuardado }) => {
  const [listas, setListas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [iniciales, setIniciales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [nuevaListaAbierta, setNuevaListaAbierta] = useState(false);
  const contadorNuevas = useRef(0);

  const nombreItem = tipo === "servicio" ? "este servicio" : "este producto";

  // Una lista nueva todavía no existe en la API: lleva un id temporal ("nueva-1") y `nueva: true`
  const nuevaLista = (datos) => {
    contadorNuevas.current += 1;
    return { ...datos, id: `nueva-${contadorNuevas.current}`, nueva: true };
  };

  const aplicarDatos = (datos) => {
    setIniciales(datos.seleccionadas);
    if (datos.listas.length === 0) {
      // Primera vez del usuario: se propone "Mis Favoritos", que se crea al guardar
      const favoritos = nuevaLista({ nombre: "Mis Favoritos", descripcion: "Lista por defecto", publica: false });
      setListas([favoritos]);
      setSeleccionadas([favoritos.id]);
    } else {
      setListas(datos.listas);
      setSeleccionadas(datos.seleccionadas);
    }
  };

  useEffect(() => {
    if (!open) return;
    let activo = true; // evita actualizar el estado si el diálogo se cerró antes de que llegue la respuesta

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const datos = await obtenerListasDeItem(tipo, itemId);
        if (!activo) return;
        aplicarDatos(datos);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tipo, itemId]);

  const alternar = (idLista) => {
    setSeleccionadas((actuales) =>
      actuales.includes(idLista) ? actuales.filter((id) => id !== idLista) : [...actuales, idLista]
    );
  };

  // La lista se agrega marcada; se crea de verdad al presionar "Guardar"
  const crearLista = async (datos) => {
    const nueva = nuevaLista(datos);
    setListas((actuales) => [...actuales, nueva]);
    setSeleccionadas((actuales) => [...actuales, nueva.id]);
    setNuevaListaAbierta(false);
  };

  const guardar = async () => {
    const existentes = seleccionadas.filter((id) => typeof id === "number");
    const nuevas = listas.filter((l) => l.nueva && seleccionadas.includes(l.id));
    const sinCambios =
      nuevas.length === 0 &&
      iniciales.length === existentes.length &&
      iniciales.every((id) => existentes.includes(id));
    if (sinCambios) {
      onClose();
      return;
    }

    try {
      setGuardando(true);
      setError("");
      const resultado = await guardarItemEnListas(tipo, itemId, existentes, nuevas);
      onGuardado?.({ enAlguna: resultado.enAlguna, cantidad: existentes.length + nuevas.length });
      onClose();
    } catch (e) {
      setError(e.message);
      // Puede que una parte ya se haya guardado: se vuelve a leer cómo quedaron las listas
      try {
        aplicarDatos(await obtenerListasDeItem(tipo, itemId));
      } catch {
        /* se deja el mensaje de error */
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={guardando ? undefined : onClose}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          disabled={guardando}
          sx={{ position: "absolute", top: 12, right: 12, color: "#9CA3AF" }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, pt: 4, pb: 3 }}>
          <Typography component="h2" sx={{ fontSize: 24, fontWeight: 700, color: "#1F2937", mb: 1.5 }}>
            Agregar a una lista
          </Typography>

          <Typography sx={{ color: "#374151", fontSize: 15, pb: 2, borderBottom: "1px solid #E5E7EB" }}>
            Selecciona la lista a la cual deseas agregar {nombreItem}.
          </Typography>

          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1F2937", mt: 2.5, mb: 1.5 }}>
            Mis listas
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {cargando ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#EC3333" }} />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 260, overflowY: "auto", pr: 0.5 }}>
              {listas.length === 0 && !error && (
                <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
                  Todavía no tienes listas. Crea una para guardar {nombreItem}.
                </Typography>
              )}

              {listas.map((lista) => {
                const marcada = seleccionadas.includes(lista.id);
                return (
                  <Box
                    key={lista.id}
                    component="label"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 1.5,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: marcada ? "#EC3333" : "#D9E2EC",
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "#F8FAFC" },
                    }}
                  >
                    <Checkbox
                      checked={marcada}
                      onChange={() => alternar(lista.id)}
                      disabled={guardando}
                      sx={{ p: 0.5, color: "#1F2937", "&.Mui-checked": { color: "#EC3333" } }}
                    />
                    <Typography sx={{ fontSize: 17, color: "#1F2937" }}>{lista.nombre}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          <Box
            component="button"
            type="button"
            onClick={() => setNuevaListaAbierta(true)}
            disabled={cargando || guardando}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 3,
              p: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 15,
              color: "#1F2937",
              "& span": { textDecoration: "underline" },
              "&:disabled": { opacity: 0.5, cursor: "default" },
            }}
          >
            <AddIcon />
            <span>Crear una nueva lista</span>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CustomButton
              variant="primary"
              onClick={guardar}
              disabled={cargando || guardando}
              sx={{ minWidth: 240, borderRadius: 999, py: 1.2, fontSize: 18 }}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </CustomButton>
          </Box>
        </DialogContent>
      </Dialog>

      <WishlistFormDialog
        open={nuevaListaAbierta}
        nombres={listas.map((l) => l.nombre)}
        onClose={() => setNuevaListaAbierta(false)}
        onGuardar={crearLista}
      />
    </>
  );
};

export default AddToListDialog;