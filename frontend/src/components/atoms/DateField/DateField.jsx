import { useEffect, useRef, useState } from "react";

const isoATexto = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = String(iso).slice(0, 10).split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : "";
};

const textoAIso = (texto) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return "";
  const [, dd, mm, aaaa] = m;
  const d = Number(dd), mes = Number(mm), a = Number(aaaa);
  const fecha = new Date(a, mes - 1, d);
  const existe = fecha.getFullYear() === a && fecha.getMonth() === mes - 1 && fecha.getDate() === d;
  return existe && a >= 1900 && a <= 2100 ? `${aaaa}-${mm}-${dd}` : "";
};

const aplicarMascara = (valor) => {
  const n = valor.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
};

const DateField = ({ id, value, onChange, className = "" }) => {
  const [texto, setTexto] = useState(() => isoATexto(value));
  const selectorRef = useRef(null);

  useEffect(() => {
    if ((value ?? "") !== textoAIso(texto)) setTexto(isoATexto(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const escribir = (e) => {
    const nuevo = aplicarMascara(e.target.value);
    setTexto(nuevo);
    onChange(textoAIso(nuevo));
  };

  const elegirDelCalendario = (e) => {
    const iso = e.target.value;
    setTexto(isoATexto(iso));
    onChange(iso);
  };

  const abrirCalendario = () => {
    try {
      selectorRef.current?.showPicker();
    } catch {
      /* sin showPicker */
    }
  };

  const incompleta = texto.length === 10 && !textoAIso(texto);

  return (
    <div style={{ position: "relative" }}>
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
        aria-invalid={incompleta}
        style={{ paddingRight: 36, ...(incompleta ? { borderColor: "#d32f2f" } : {}) }}
      />
      <button
        type="button"
        onClick={abrirCalendario}
        aria-label="Abrir calendario"
        tabIndex={-1}
        style={{
          position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
          border: "none", background: "transparent", cursor: "pointer", fontSize: 16, lineHeight: 1,
        }}
      >
        📅
      </button>
      <input
        ref={selectorRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={value ?? ""}
        onChange={elegirDelCalendario}
        style={{ position: "absolute", right: 0, bottom: 0, width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
};

export default DateField;
