import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { urlImagen } from "../../../services/cartService";

const ROJO = "#EC3333";
const formatearPrecio = (numero) => `$${numero.toLocaleString("es-CL")}`;

const CatalogCard = ({ item, onVerDetalle, onAgregar }) => {
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
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": { boxShadow: "0 4px 14px rgba(0,0,0,0.12)", transform: "translateY(-2px)" },
        display: "flex",
        flexDirection: "column",
        border: "1px solid #E0E0E0",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {item.imagen ? (
        <Box component="img" src={urlImagen(item.imagen)} alt={item.nombre} sx={{ width: "100%", height: 160, objectFit: "cover" }} />
      ) : (
        <Box sx={{ width: "100%", height: 160, backgroundColor: "#E5E7EB" }} />
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, padding: 1.5, flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            WebkitLineClamp: 2,
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