import Skeleton from "@mui/material/Skeleton";
import CardGridSkeleton from "../CardGridSkeleton/CardGridSkeleton";

// Esqueleto de la ficha de producto o servicio: imagen a la izquierda, datos a la derecha
// y una fila de productos relacionados debajo.
const ProductSheetSkeleton = () => (
  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", minHeight: "60vh" }}>
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      <Skeleton
        animation="wave"
        variant="rounded"
        style={{ flex: "1 1 360px", maxWidth: 520 }}
        height={380}
      />

      <div style={{ flex: "1 1 320px" }}>
        <Skeleton animation="wave" variant="text" width="70%" height={44} />
        <Skeleton animation="wave" variant="text" width="35%" height={34} />
        <Skeleton animation="wave" variant="text" width="95%" />
        <Skeleton animation="wave" variant="text" width="90%" />
        <Skeleton animation="wave" variant="text" width="60%" />
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Skeleton animation="wave" variant="rounded" width={140} height={42} />
          <Skeleton animation="wave" variant="rounded" width={140} height={42} />
        </div>
      </div>
    </div>

    <Skeleton animation="wave" variant="text" width={220} height={36} style={{ margin: "40px 0 16px" }} />
    <CardGridSkeleton cantidad={4} alturaImagen={140} />
  </div>
);

export default ProductSheetSkeleton;
