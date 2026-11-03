import Skeleton from "@mui/material/Skeleton";

// Anchos distintos para que las filas no se vean como un bloque uniforme
const anchos = ["55%", "80%", "65%", "45%", "75%", "60%", "70%", "50%", "85%"];

// Esqueleto de una pantalla de lista del vendedor (Inventario, Servicios, Pedidos).
// Igual que YouTube mientras carga: en vez de textos y números, todo el contenido es
// de bloques grises animados con la forma de lo que va a aparecer:
// tarjetas de resumen, barra de herramientas, filas de la tabla y pie con paginación.
// Usa las clases "inv-stats" e "inv-panel", así ocupa el mismo espacio que la pantalla real.
const ListPageSkeleton = ({ columnas = 6, filas = 6, tarjetas = 4 }) => (
  <div role="status" aria-label="Cargando">
    <div className="inv-stats">
      {Array.from({ length: tarjetas }, (_, i) => (
        <Skeleton key={i} animation="wave" variant="rounded" width={200} height={84} />
      ))}
    </div>

    <div className="inv-panel">
      {/* Barra de herramientas: título y contador a la izquierda, controles a la derecha */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Skeleton animation="wave" variant="rounded" width={190} height={26} />
        <div style={{ display: "flex", gap: 12 }}>
          <Skeleton animation="wave" variant="rounded" width={80} height={26} />
          <Skeleton animation="wave" variant="rounded" width={120} height={30} />
          <Skeleton animation="wave" variant="rounded" width={120} height={30} />
        </div>
      </div>

      {/* Encabezado y filas de la tabla */}
      {Array.from({ length: filas + 1 }, (_, fila) => (
        <div
          key={fila}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columnas}, 1fr)`,
            gap: 20,
            marginBottom: 16,
          }}
        >
          {Array.from({ length: columnas }, (_, col) => (
            <Skeleton
              key={col}
              animation="wave"
              variant="rounded"
              height={fila === 0 ? 18 : 26}
              width={fila === 0 ? "50%" : anchos[(fila + col) % anchos.length]}
            />
          ))}
        </div>
      ))}

      {/* Pie: texto "Mostrando..." y botones de paginación */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <Skeleton animation="wave" variant="rounded" width={220} height={20} />
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} animation="wave" variant="rounded" width={30} height={30} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ListPageSkeleton;
