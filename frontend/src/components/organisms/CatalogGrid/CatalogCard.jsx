import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { urlImagen } from "../../../services/cartService";

const ROJO = "#EC3333";
const formatearPrecio = (numero) => `$${numero.toLocaleString("es-CL")}`;

// vista "lista": la tarjeta se muestra horizontal (imagen a la izquierda); en pantallas angostas vuelve a ser vertical
// onGuardarEnLista (opcional): muestra un corazón sobre la imagen para guardar en una lista de deseos; `guardado` lo llena
const CatalogCard = ({ item, onVerDetalle, onAgregar, onGuardarEnLista, guardado = false, vista = "cuadricula" }) => {
  const lista = vista === "lista";
  // Un producto con precio se agrega directo al carro. Un servicio se agenda (fecha y horario) en su ficha.
  const puedeAgregar = item.tipo === "producto" && item.precio != null && Boolean(onAgregar);

  return (
    // Toda la tarjeta lleva al detalle del producto o servicio
    <Box
      role="link"
      tabIndex={0}
      aria-label={`Ver ${item.nombre}`}
      onClick={() => onVerDetalle(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) onVerDetalle(item);
      }}
      sx={{
        position: "relative",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": { boxShadow: "0 4px 14px rgba(0,0,0,0.12)", transform: "translateY(-2px)" },
        display: "flex",
        flexDirection: { xs: "column", sm: lista ? "row" : "column" },
        border: "1px solid #E0E0E0",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {item.imagen ? (
        <Box
          component="img"
          src={urlImagen(item.imagen)}
          alt={item.nombre}
          sx={{ width: { xs: "100%", sm: lista ? 220 : "100%" }, height: { xs: 160, sm: lista ? "auto" : 160 }, minHeight: lista ? { sm: 140 } : undefined, flexShrink: 0, objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{ width: { xs: "100%", sm: lista ? 220 : "100%" }, height: { xs: 160, sm: lista ? "auto" : 160 }, minHeight: lista ? { sm: 140 } : undefined, flexShrink: 0, backgroundColor: "#E5E7EB" }}
        />
      )}

      {onGuardarEnLista && (
        <IconButton
          size="small"
          aria-label={guardado ? `Editar listas de deseos de ${item.nombre}` : `Guardar ${item.nombre} en una lista de deseos`}
          onClick={(e) => {
            e.stopPropagation(); // el corazón no debe abrir también el detalle de la tarjeta
            onGuardarEnLista(item);
          }}
          onKeyDown={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "rgba(255,255,255,0.92)",
            "&:hover": { backgroundColor: "#fff" },
          }}
        >
          {guardado ? <FavoriteIcon fontSize="small" sx={{ color: ROJO }} /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, padding: 1.5, flexGrow: 1 }}>
        {/* minHeight: sin comuna ni etiqueta la fila quedaba vacía y el título subía respecto de las otras tarjetas */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 20 }}>
          {item.etiqueta ? (
            <Chip label={item.etiqueta} size="small" sx={{ backgroundColor: ROJO, color: "#fff", fontSize: 11, height: 20 }} />
          ) : (
            <Box />
          )}
          <Box sx={{ fontSize: 11, color: "#666" }}>{item.ubicacion}</Box>
        </Box>

        <Box sx={{ fontSize: 16, fontWeight: 700 }}>{item.nombre}</Box>

        <Box
          sx={{
            fontSize: 12,
            color: "#666",
            minHeight: 34,
            display: "-webkit-box",
            WebkitLineClamp: lista ? 3 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.descripcion}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 1 }}>
          <Box>
            {item.precioAnterior != null && (
              <Box sx={{ fontSize: 11, color: "#888", textDecoration: "line-through" }}>
                {formatearPrecio(item.precioAnterior)}
              </Box>
            )}
            <Box sx={{ fontSize: item.precio != null ? 18 : 13, fontWeight: 700 }}>
              {item.precio != null ? formatearPrecio(item.precio) : "Consultar precio"}
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            disableElevation
            onClick={(e) => {
              e.stopPropagation(); // el botón no debe abrir también el detalle de la tarjeta
              if (puedeAgregar) onAgregar(item);
              else onVerDetalle(item);
            }}
            sx={{ backgroundColor: ROJO, "&:hover": { backgroundColor: "#D42B2B" } }}
          >
            {puedeAgregar ? "Agregar al carro" : "Ver detalle"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CatalogCard;