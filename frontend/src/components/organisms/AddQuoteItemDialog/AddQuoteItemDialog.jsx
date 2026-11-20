import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import CustomButton from "../../atoms/Button/CustomButton";
import { listarCatalogo } from "../../../services/catalogService";
import { urlImagen } from "../../../services/cartService";

const formatoCLP = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

/*
 * Selector del catálogo para "Solicitar cotización": lista los productos y servicios (GET /catalogo),
 * con buscador, y deja agregar los que se quiera a la solicitud sin salir de la pantalla.
 *
 * `clavesAgregadas`: claves ("producto-5", "servicio-2") que ya están en la solicitud.
 * `onAgregar(item)`: recibe el ítem del catálogo que se eligió.
 */
const AddQuoteItemDialog = ({ open, onClose, clavesAgregadas = [], onAgregar }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    if (!open) return;
    let activo = true;

    setCargando(true);
    setError("");
    listarCatalogo()
      .then((items) => {
        if (activo) setCatalogo(items);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [open, recarga]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return catalogo;
    return catalogo.filter((i) => `${i.nombre} ${i.categoria} ${i.vendedor}`.toLowerCase().includes(texto));
  }, [catalogo, busqueda]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        sx={{ position: "absolute", top: 12, right: 12, color: "#9CA3AF" }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, pt: 4, pb: 3 }}>
        <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, color: "#1F2937", mb: 0.5 }}>
          Agregar a la solicitud
        </Typography>
        <Typography sx={{ color: "#555", fontSize: 14, mb: 2 }}>
          Elige los productos o servicios que quieres cotizar.
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre o categoría"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ mb: 2 }}
        />

        {cargando ? (
          <Typography role="status" sx={{ color: "#555", fontSize: 14, py: 3, textAlign: "center" }}>
            Cargando el catálogo...
          </Typography>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography sx={{ color: "#B91C1C", fontSize: 14, mb: 1.5 }}>{error}</Typography>
            <CustomButton variant="primary" size="medium" onClick={() => setRecarga((n) => n + 1)} sx={{ textTransform: "none" }}>
              Reintentar
            </CustomButton>
          </Box>
        ) : filtrados.length === 0 ? (
          <Typography sx={{ color: "#555", fontSize: 14, py: 3, textAlign: "center" }}>
            {catalogo.length === 0 ? "Todavía no hay productos ni servicios en el catálogo." : "No encontramos resultados para tu búsqueda."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 360, overflowY: "auto", pr: 0.5 }}>
            {filtrados.map((item) => {
              const agregado = clavesAgregadas.includes(item.clave);
              const imagen = urlImagen(item.imagen);

              return (
                <Box
                  key={item.clave}
                  sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, border: "1px solid #E5E7EB", borderRadius: 2 }}
                >
                  <Box
                    sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: 1, backgroundColor: "#e0e0e0", overflow: "hidden" }}
                  >
                    {imagen && (
                      <Box component="img" src={imagen} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }} noWrap>
                      {item.nombre}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#777" }} noWrap>
                      {item.tipo === "servicio" ? "Servicio" : "Producto"}
                      {item.categoria && ` • ${item.categoria}`}
                      {item.precio != null && ` • ${formatoCLP(item.precio)}`}
                    </Typography>
                  </Box>

                  <CustomButton
                    variant={agregado ? "secondary" : "primary"}
                    size="small"
                    disabled={agregado}
                    onClick={() => onAgregar(item)}
                    sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                  >
                    {agregado ? "Agregado" : "Agregar"}
                  </CustomButton>
                </Box>
              );
            })}
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <CustomButton variant="primary" size="medium" onClick={onClose} sx={{ textTransform: "none", minWidth: 120 }}>
            Listo
          </CustomButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuoteItemDialog;