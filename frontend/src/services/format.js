function formatRut(inRut) {
  let outRut = inRut.replace(/[^0-9kK]/g, '').slice(0, 9);

  if (outRut.length > 1) {
    const body = outRut.slice(0, -1);
    const verifierDigit = outRut.slice(-1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    outRut = `${formattedBody}-${verifierDigit}`;
  }

  return outRut.toUpperCase();
}

export function isValidRut(rut) {
  const normalizedRut = rut.trim().toUpperCase();
  const match = normalizedRut.match(/^([1-9]\d{0,2}(?:\.\d{3}){0,2})-([\dK])$/);

  if (!match) {
    return false;
  }

  const [, formattedBody, verifierDigit] = match;
  const body = formattedBody.replace(/\./g, '');
  if (body.length > 8) {
    return false;
  }

  let sum = 0;
  let multiplier = 2;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expectedDigit =
    remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);

  return verifierDigit === expectedDigit;
}

export default formatRut;
