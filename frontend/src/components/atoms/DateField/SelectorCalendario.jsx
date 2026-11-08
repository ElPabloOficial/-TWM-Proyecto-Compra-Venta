import { useRef } from "react";

// Botón 📅 que abre el calendario nativo del navegador. Lo que se elige se entrega como
// AAAA-MM-DD en "onElegir"; la persona lo ve después como dd/mm/aaaa en el campo de texto.
const SelectorCalendario = ({ value, min, max, onElegir, style }) => {
  const ref = useRef(null);

  const abrir = () => {
    try {
      ref.current?.showPicker();
    } catch {
      /* navegador sin showPicker: se puede escribir la fecha a mano */
    }
  };

  return (
    <span style={{ position: "relative", display: "inline-flex", ...style }}>
      <button
        type="button"
        onClick={abrir}
        aria-label="Abrir calendario"
        tabIndex={-1}
        style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
      >
        📅
      </button>
      <input
        ref={ref}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => e.target.value && onElegir(e.target.value)}
        style={{ position: "absolute", left: 0, bottom: 0, width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />
    </span>
  );
};

export default SelectorCalendario;
