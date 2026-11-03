import Skeleton from "@mui/material/Skeleton";

// Esqueleto de un formulario: se muestra al abrir directamente la pantalla de edición,
// mientras llegan los datos del producto o servicio desde la API.
const FormSkeleton = ({ campos = 6 }) => (
  <div role="status" aria-label="Cargando formulario" style={{ maxWidth: 720 }}>
    <Skeleton animation="wave" variant="text" width="35%" height={44} />

    {Array.from({ length: campos }, (_, i) => (
      <div key={i} style={{ marginTop: 18 }}>
        <Skeleton animation="wave" variant="text" width="22%" />
        <Skeleton animation="wave" variant="rounded" height={42} />
      </div>
    ))}

    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
      <Skeleton animation="wave" variant="rounded" width={96} height={36} />
      <Skeleton animation="wave" variant="rounded" width={140} height={36} />
    </div>
  </div>
);

export default FormSkeleton;
