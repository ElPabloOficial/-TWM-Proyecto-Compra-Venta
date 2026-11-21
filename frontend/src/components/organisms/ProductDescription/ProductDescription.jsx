import { Box } from "@mui/material";

// Claves del JSON "caracteristicas" que no son características del producto (se usan en otra parte de la ficha)
const CLAVES_OCULTAS = ["descripcion", "precio", "visibilidad", "stock"];

// Orden en que se muestran; las que no están aquí van después, en el orden en que vengan
const ORDEN = [
  "color", "material", "talla", "peso", "alto", "ancho", "fondo",
  "ram", "almacenamiento", "garantia", "modalidad", "requisitos", "sku",
];

// Nombre legible de cada clave (sin el sufijo de unidad: "alto_cm" se busca como "alto")
const NOMBRES = {
  color: "Color",
  material: "Material",
  talla: "Talla",
  peso: "Peso",
  peso_max: "Peso máximo",
  alto: "Alto",
  alto_max: "Alto máximo",
  ancho: "Ancho",
  ancho_max: "Ancho máximo",
  fondo: "Fondo",
  fondo_max: "Fondo máximo",
  ram: "Memoria RAM",
  almacenamiento: "Almacenamiento",
  garantia: "Garantía",
  modalidad: "Modalidad",
  requisitos: "Requisitos",
  sku: "SKU",
};

const UNIDADES = { cm: "cm", kg: "kg", g: "g", gb: "GB", mb: "MB" };

const humanizar = (texto) => {
  const limpio = texto.replace(/_/g, " ").trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
};

// "alto_cm" -> { base: "alto", unidad: "cm" }
const separarUnidad = (clave) => {
  const coincidencia = clave.match(/^(.*)_(cm|kg|g|gb|mb)$/i);
  return coincidencia
    ? { base: coincidencia[1], unidad: UNIDADES[coincidencia[2].toLowerCase()] }
    : { base: clave, unidad: "" };
};

const formatoNumero = (n, decimales = 2) =>
  new Intl.NumberFormat("es-CL", { maximumFractionDigits: decimales }).format(n);

// El peso se guarda en gramos: desde 1.000 g se muestra en kilos
const formatoPeso = (gramos) =>
  gramos >= 1000 ? `${formatoNumero(gramos / 1000, 3)} kg` : `${formatoNumero(gramos)} g`;

const formatoValor = (base, unidad, valor) => {
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (Array.isArray(valor)) return valor.join(", ");
  if (valor !== null && typeof valor === "object") {
    return Object.entries(valor).map(([k, v]) => `${humanizar(k)}: ${v}`).join(", ");
  }

  const numero = typeof valor === "number" ? valor : Number(valor);
  const esNumero = valor !== "" && Number.isFinite(numero);

  if (esNumero && base.startsWith("peso")) {
    if (unidad === "kg") return `${formatoNumero(numero, 3)} kg`;
    return formatoPeso(numero); // "peso" y "peso_g" vienen en gramos
  }
  if (esNumero) return unidad ? `${formatoNumero(numero)} ${unidad}` : formatoNumero(numero);
  return unidad ? `${valor} ${unidad}` : String(valor);
};

// Convierte el JSON "caracteristicas" en filas { clave, etiqueta, valor } listas para la tabla
export const filasDeCaracteristicas = (caracteristicas) =>
  Object.entries(caracteristicas ?? {})
    .filter(([clave, valor]) => {
      if (CLAVES_OCULTAS.includes(clave)) return false;
      if (valor === null || valor === undefined || valor === "") return false;
      return !(Array.isArray(valor) && valor.length === 0);
    })
    .map(([clave, valor], indice) => {
      const { base, unidad } = separarUnidad(clave);
      const posicion = ORDEN.indexOf(base);
      return {
        clave,
        indice,
        posicion: posicion === -1 ? ORDEN.length : posicion,
        etiqueta: NOMBRES[base] ?? humanizar(base),
        valor: formatoValor(base, unidad, valor),
      };
    })
    .sort((a, b) => a.posicion - b.posicion || a.indice - b.indice);

export default function ProductDescription({
  product,
  type = "product",
}) {
  const isService = type === "service";
  const filas = filasDeCaracteristicas(product.caracteristicas);
  const sinContenido = !product.descripcion && filas.length === 0;

  return (
    <Box
      sx={{
        backgroundColor: "white",
        p: 2,
        mt: 1,
        borderRadius: 1, 
      }}
    >
      <Box
        component="h2"
        sx={{
          fontSize: 16,
          m: 0,
          mb: 1,
        }}
      >
        {isService
          ? "Descripción del Servicio"
          : "Descripción del Producto"}
      </Box>

      {product.descripcion && (
        <Box sx={{ fontSize: 13, color: "#333", mb: filas.length > 0 ? 2 : 0 }}>
          {product.descripcion}
        </Box>
      )}

      {filas.length > 0 && (
        <>
          <Box component="h3" sx={{ fontSize: 14, m: 0, mb: 1 }}>
            Características
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Box
              component="table"
              sx={{
                width: "100%",
                maxWidth: 640,
                borderCollapse: "collapse",
                fontSize: 13,
                border: "1px solid #E5E7EB",
                "& th, & td": {
                  textAlign: "left",
                  padding: "8px 12px",
                  borderBottom: "1px solid #E5E7EB",
                },
                "& th": {
                  width: "38%",
                  fontWeight: 600,
                  color: "#374151",
                  backgroundColor: "#F9FAFB",
                },
                "& td": { color: "#333" },
                "& tr:last-of-type th, & tr:last-of-type td": { borderBottom: "none" },
              }}
            >
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.clave}>
                    <th scope="row">{fila.etiqueta}</th>
                    <td>{fila.valor}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        </>
      )}

      {sinContenido && (
        <Box sx={{ fontSize: 13, color: "#777" }}>
          {isService
            ? "Este servicio aún no tiene descripción."
            : "Este producto aún no tiene descripción."}
        </Box>
      )}
    </Box>
  );
}