// Validaciones compartidas por todos los formularios.
//
// Filtros (solo...): limpian lo que la persona escribe MIENTRAS escribe, así no se pueden
// meter caracteres que no corresponden (por ejemplo, números en un nombre).
// Se usan en el onChange:  onChange={(e) => setX(soloLetras(e.target.value))}
// Validadores (es...Valido): revisan el valor completo al guardar y devuelven true/false.
//


// Nombres de personas: solo letras (con tildes y ñ), espacios, apóstrofe y guion. Sin números.
export const soloLetras = (texto, max = 100) =>
  String(texto ?? '')
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/^\s+/, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, max);

// Solo dígitos (teléfono, precios, stock, cantidades...). "max" limita la cantidad de dígitos.
export const soloDigitos = (texto, max) =>
  String(texto ?? '')
    .replace(/\D/g, '')
    .slice(0, max);

// Porcentaje entero entre 0 y 100 (ofertas). Vacío si no hay nada escrito.
export const soloPorcentaje = (texto) => {
  const digitos = soloDigitos(texto, 3);
  return digitos === '' ? '' : String(Math.min(100, Number(digitos)));
};

// Códigos (SKU, número de seguimiento): letras sin tildes, números, guion y guion bajo, en mayúsculas.
export const soloCodigo = (texto, max = 30) =>
  String(texto ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, max);

// Texto corto con letras, números, espacios y guion (por ejemplo "1-2 días").
export const soloAlfanumerico = (texto, max = 30) =>
  String(texto ?? '')
    .replace(/[^\p{L}\d\s-]/gu, '')
    .replace(/^\s+/, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, max);

// ---------- Validadores ----------

// Nombre completo: empieza con una letra, solo letras/espacios/apóstrofe/guion y al menos 3 caracteres.
export const esNombreValido = (texto) => {
  const t = String(texto ?? '').trim();
  return t.length >= 3 && /^[\p{L}][\p{L}\s'-]*$/u.test(t);
};

export const esCorreoValido = (texto) => {
  const t = String(texto ?? '').trim();
  return t.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
};

// Teléfono chileno: 9 dígitos, por ejemplo 912345678.
export const esTelefonoValido = (texto) => /^\d{9}$/.test(String(texto ?? ''));

// Página web: debe empezar con http:// o https://.
export const esUrlValida = (texto) => /^https?:\/\/\S+\.\S+$/i.test(String(texto ?? '').trim());

// Un teléfono guardado como "+56 9 8765 4321" se lleva a sus 9 dígitos: "987654321".
export const telefonoADigitos = (texto) => {
  const d = String(texto ?? '').replace(/\D/g, '');
  return d.length === 11 && d.startsWith('56') ? d.slice(2) : d.slice(0, 9);
};