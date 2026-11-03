import Skeleton from "@mui/material/Skeleton";

// Cuadrícula de tarjetas en esqueleto: un bloque para la imagen y debajo
// un círculo con dos líneas de texto. Se usa mientras llegan los productos o servicios.
const CardGridSkeleton = ({ cantidad = 8, alturaImagen = 160 }) => (
  <div
    role="status"
    aria-label="Cargando"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
      gap: 20,
    }}
  >
    {Array.from({ length: cantidad }, (_, i) => (
      <div key={i}>
        <Skeleton animation="wave" variant="rounded" height={alturaImagen} />

        <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "flex-start" }}>
          <Skeleton animation="wave" variant="circular" width={36} height={36} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton animation="wave" variant="text" width="90%" />
            <Skeleton animation="wave" variant="text" width="60%" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default CardGridSkeleton;
