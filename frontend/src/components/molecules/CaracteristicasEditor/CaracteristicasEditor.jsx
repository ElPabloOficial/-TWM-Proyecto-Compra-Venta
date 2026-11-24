import DeleteIcon from "@mui/icons-material/Delete";
import CustomButton from "../../atoms/Button/CustomButton";
import CustomIconButton from "../../atoms/IconButton/CustomIconButton";
import {
  CLAVES_OCULTAS,
  NOMBRES,
  humanizar,
  separarUnidad,
} from "../../organisms/ProductDescription/ProductDescription";

// Sugerencias del campo "Característica" (el usuario también puede escribir cualquiera)
const SUGERENCIAS = Object.entries(NOMBRES)
  .filter(([clave]) => clave !== "sku")
  .map(([, etiqueta]) => etiqueta);

const quitarTildes = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "");
const aClave = (texto) =>
  quitarTildes(texto).toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

// "Memoria RAM" -> "ram" (si coincide con un nombre conocido) o "memoria_ram"
const CLAVE_POR_ETIQUETA = Object.fromEntries(
  Object.entries(NOMBRES).map(([clave, etiqueta]) => [aClave(etiqueta), clave])
);
const claveBase = (etiqueta) => {
  const slug = aClave(etiqueta);
  return CLAVE_POR_ETIQUETA[slug] ?? slug;
};

// Peso y medidas tienen sus propios campos obligatorios en el formulario (se usan para calcular el envío)
const CLAVES_ENVIO = ["peso", "alto_cm", "ancho_cm"];

let contador = 0;
const nuevoId = () => `c${++contador}`;

// JSON de la BD -> filas editables { id, etiqueta, valor }.
// La unidad va escrita junto al valor ("25 cm"). De cada fila se recuerda la clave y el valor
// originales para no cambiar el formato guardado (alto_cm: 25) si la fila no se toca.
export const caracteristicasAFilas = (json = {}) =>
  Object.entries(json ?? {})
    .filter(([clave, v]) => !CLAVES_OCULTAS.includes(clave) && !CLAVES_ENVIO.includes(clave) && clave !== "sku" && v !== null && typeof v !== "object")
    .map(([clave, v]) => {
      const { base, unidad } = separarUnidad(clave);
      const sufijo = unidad || (base === "peso" && typeof v === "number" ? "g" : "");
      const etiqueta = NOMBRES[base] ?? humanizar(base);
      const valor = sufijo ? `${v} ${sufijo}` : String(v);
      return { id: nuevoId(), etiqueta, valor, original: { clave, valor: v, etiqueta, texto: valor } };
    });

// Filas del formulario -> JSON de la BD.
// Se conservan las claves internas (sku, descripcion, precio, visibilidad, stock) y los valores
// complejos (listas/objetos) que el formulario no edita, para no perderlos al guardar.
export const filasACaracteristicas = (filas, original = {}) => {
  const resultado = {};
  Object.entries(original ?? {}).forEach(([clave, v]) => {
    if (CLAVES_OCULTAS.includes(clave) || clave === "sku" || (v !== null && typeof v === "object")) {
      resultado[clave] = v;
    }
  });
  filas.forEach(({ etiqueta, valor, original: o }) => {
    const texto = valor.trim();
    if (texto === "") return;
    // Fila sin cambios: se mantiene tal como estaba en la BD
    if (o && o.etiqueta === etiqueta && o.texto === valor) {
      resultado[o.clave] = o.valor;
      return;
    }
    const clave = claveBase(etiqueta);
    if (!clave || CLAVES_ENVIO.includes(clave) || ["alto", "ancho"].includes(clave)) return;
    resultado[clave] = /^\d+([.,]\d+)?$/.test(texto) ? Number(texto.replace(",", ".")) : texto;
  });
  return resultado;
};

const CaracteristicasEditor = ({ filas, onChange }) => {
  const actualizar = (id, campo, valor) =>
    onChange(filas.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
  const quitar = (id) => onChange(filas.filter((f) => f.id !== id));
  const agregar = () => onChange([...filas, { id: nuevoId(), etiqueta: "", valor: "" }]);

  return (
    <div className="addp-carac">
      <datalist id="sugerencias-caracteristicas">
        {SUGERENCIAS.map((s) => <option key={s} value={s} />)}
      </datalist>

      {filas.length === 0 && (
        <div className="addp-carac-vacio">Este producto aún no tiene características.</div>
      )}

      {filas.map((f) => (
        <div className="addp-carac-fila" key={f.id}>
          <input
            className="addp-input"
            type="text"
            list="sugerencias-caracteristicas"
            placeholder="Característica (ej. Color)"
            aria-label="Nombre de la característica"
            value={f.etiqueta}
            maxLength={40}
            onChange={(e) => actualizar(f.id, "etiqueta", e.target.value)}
          />
          <input
            className="addp-input"
            type="text"
            placeholder="Valor (ej. Azul, 25 cm, 64 GB)"
            aria-label="Valor de la característica"
            value={f.valor}
            maxLength={80}
            onChange={(e) => actualizar(f.id, "valor", e.target.value)}
          />
          <CustomIconButton ariaLabel="Quitar característica" size="small" onClick={() => quitar(f.id)}>
            <DeleteIcon fontSize="small" />
          </CustomIconButton>
        </div>
      ))}

      <CustomButton
        variant="tertiary"
        size="small"
        onClick={agregar}
        sx={{ alignSelf: "flex-start", borderRadius: "999px", textTransform: "none", fontWeight: 700 }}
      >
        + Agregar característica
      </CustomButton>
    </div>
  );
};

export default CaracteristicasEditor;
