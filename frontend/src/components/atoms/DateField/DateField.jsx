import { useTextoFecha } from "./fechaUtils";
import SelectorCalendario from "./SelectorCalendario";

// Campo de fecha que siempre se ve como dd/mm/aaaa, sin depender del idioma del navegador.
//   value / onChange -> fecha en formato ISO (AAAA-MM-DD); onChange entrega "" mientras no sea válida
//   min / max        -> límites opcionales (AAAA-MM-DD)
//   inputStyle       -> estilos extra para el <input> (p. ej. los de la ficha del servicio)
const DateField = ({ id, value, onChange, className = "", min, max, inputStyle, ariaLabel }) => {
  const { texto, escribir, elegir, invalida } = useTextoFecha(value, onChange, { min, max });

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        id={id}
        className={className}
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        autoComplete="off"
        value={texto}
        onChange={escribir}
        aria-label={ariaLabel}
        aria-invalid={invalida}
        style={{ ...inputStyle, paddingRight: 34, ...(invalida ? { borderColor: "#d32f2f" } : {}) }}
      />
      <SelectorCalendario
        value={value}
        min={min}
        max={max}
        onElegir={elegir}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
      />
    </div>
  );
};

export default DateField;
