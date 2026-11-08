import { useEffect, useState } from "react";

// "2026-10-31" -> "31/10/2026"
export const isoATexto = (iso) => {
  if (!iso) return "";
  const [anio, mes, dia] = String(iso).slice(0, 10).split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : "";
};

// "31/10/2026" -> "2026-10-31". Devuelve "" si la fecha está incompleta, no existe (31/02/2026)
// o queda fuera de los límites "min" / "max" (también en formato AAAA-MM-DD).
export const textoAIso = (texto, { min, max } = {}) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return "";
  const [, dd, mm, aaaa] = m;
  const d = Number(dd), mes = Number(mm), a = Number(aaaa);
  const fecha = new Date(a, mes - 1, d);
  const existe = fecha.getFullYear() === a && fecha.getMonth() === mes - 1 && fecha.getDate() === d;
  if (!existe || a < 1900 || a > 2100) return "";
  const iso = `${aaaa}-${mm}-${dd}`;
  if (min && iso < min) return "";
  if (max && iso > max) return "";
  return iso;
};

// Deja solo dígitos y pone las barras solas: 31102026 -> 31/10/2026
export const aplicarMascara = (valor) => {
  const n = String(valor).replace(/\D/g, "").slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
};

// Fecha de hoy en AAAA-MM-DD con la hora local (no UTC)
export const hoyISO = () => new Date().toLocaleDateString("sv-SE");

// Maneja el texto "dd/mm/aaaa" que ve la persona mientras la aplicación trabaja con AAAA-MM-DD.
//   value    -> fecha en formato ISO (o "")
//   onChange -> recibe la fecha ISO, o "" mientras no sea válida
export function useTextoFecha(value, onChange, limites = {}) {
  const [texto, setTexto] = useState(() => isoATexto(value));
  const { min, max } = limites;

  // Si el valor cambia desde afuera (p. ej. al abrir la edición), se actualiza el texto
  useEffect(() => {
    if ((value ?? "") !== textoAIso(texto, { min, max })) setTexto(isoATexto(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const escribir = (e) => {
    const nuevo = aplicarMascara(e.target.value);
    setTexto(nuevo);
    onChange?.(textoAIso(nuevo, { min, max }));
  };

  const elegir = (iso) => {
    setTexto(isoATexto(iso));
    onChange?.(iso);
  };

  // Escribió las 8 cifras, pero la fecha no existe o está fuera de rango
  const invalida = texto.length === 10 && !textoAIso(texto, { min, max });

  return { texto, escribir, elegir, invalida };
}
