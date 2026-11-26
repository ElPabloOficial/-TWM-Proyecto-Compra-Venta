/*
 * Gráficos del panel de administración, dibujados con SVG (sin librerías).
 *   <LineAreaChart etiquetas={["Abr", "May"]} valores={[12e6, 13e6]} formato={(v) => `$${v / 1e6}M`} />
 *   <BarsChart etiquetas={["Starken"]} valores={[310]} />
 */

const ROJO = "#EC3333";
const ANCHO = 600;
const ALTO = 260;
const M = { izq: 52, der: 16, arriba: 14, abajo: 30 };

// Paso "redondo" (1, 2, 5 x 10^n) para que los números del eje queden limpios
const escala = (min, max, divisiones = 5) => {
  const crudo = Math.max(max - min, 1) / divisiones;
  const magnitud = 10 ** Math.floor(Math.log10(crudo));
  const n = crudo / magnitud;
  const paso = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * magnitud;
  const ini = Math.floor(min / paso) * paso;
  const fin = Math.ceil(max / paso) * paso;
  const ticks = [];
  for (let v = ini; v <= fin + paso / 2; v += paso) ticks.push(v);
  return { ini, fin, ticks };
};

const Marco = ({ children, titulo, alto = ALTO }) => (
  <svg viewBox={`0 0 ${ANCHO} ${alto}`} width="100%" role="img" aria-label={titulo} style={{ display: "block" }}>
    {children}
  </svg>
);

const Ejes = ({ ticks, y, formato }) =>
  ticks.map((t) => (
    <g key={t}>
      <line x1={M.izq} x2={ANCHO - M.der} y1={y(t)} y2={y(t)} stroke="#eee" />
      <text x={M.izq - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#999">
        {formato(t)}
      </text>
    </g>
  ));

export const LineAreaChart = ({ etiquetas, valores, formato = (v) => v, titulo = "Gráfico de línea" }) => {
  const { ini, fin, ticks } = escala(Math.min(...valores), Math.max(...valores));
  const ancho = ANCHO - M.izq - M.der;
  const alto = ALTO - M.arriba - M.abajo;
  const x = (i) => M.izq + (valores.length === 1 ? ancho / 2 : (i * ancho) / (valores.length - 1));
  const y = (v) => M.arriba + alto - ((v - ini) / (fin - ini)) * alto;

  const puntos = valores.map((v, i) => `${x(i)},${y(v)}`);
  const linea = `M ${puntos.join(" L ")}`;
  const area = `${linea} L ${x(valores.length - 1)},${y(ini)} L ${x(0)},${y(ini)} Z`;

  return (
    <Marco titulo={titulo}>
      <Ejes ticks={ticks} y={y} formato={formato} />
      <path d={area} fill={ROJO} fillOpacity="0.1" />
      <path d={linea} fill="none" stroke={ROJO} strokeWidth="2" strokeLinejoin="round" />
      {valores.map((v, i) => (
        <circle key={etiquetas[i]} cx={x(i)} cy={y(v)} r="3.5" fill={ROJO} />
      ))}
      {etiquetas.map((e, i) => (
        <text key={e} x={x(i)} y={ALTO - 8} textAnchor="middle" fontSize="10" fill="#999">
          {e}
        </text>
      ))}
    </Marco>
  );
};

// Con muchas barras los nombres no caben en horizontal: se inclinan y se acortan si son largos.
const MAX_BARRAS_HORIZONTAL = 6;
const MAX_LETRAS_ETIQUETA = 16;
const acortar = (texto) => (texto.length > MAX_LETRAS_ETIQUETA ? `${texto.slice(0, MAX_LETRAS_ETIQUETA - 1)}…` : texto);

export const BarsChart = ({ etiquetas, valores, formato = (v) => v, titulo = "Gráfico de barras" }) => {
  const inclinar = valores.length > MAX_BARRAS_HORIZONTAL;
  const abajo = inclinar ? 90 : M.abajo; // espacio para las etiquetas inclinadas
  const altoTotal = ALTO - M.abajo + abajo;

  const { fin, ticks } = escala(0, Math.max(...valores));
  const ancho = ANCHO - M.izq - M.der;
  const alto = altoTotal - M.arriba - abajo;
  const banda = ancho / valores.length;
  const y = (v) => M.arriba + alto - (v / fin) * alto;
  const grosor = Math.min(34, banda * 0.45);

  return (
    <Marco titulo={titulo} alto={altoTotal}>
      <Ejes ticks={ticks} y={y} formato={formato} />
      {valores.map((v, i) => {
        const cx = M.izq + banda * i + banda / 2;
        const yEtiqueta = altoTotal - abajo + 14;
        return (
          <g key={etiquetas[i]}>
            <rect x={cx - grosor / 2} y={y(v)} width={grosor} height={y(0) - y(v)} fill={ROJO} rx="2">
              <title>{`${etiquetas[i]}: ${v}`}</title>
            </rect>
            {inclinar ? (
              <text
                x={cx}
                y={yEtiqueta}
                textAnchor="end"
                fontSize="10"
                fill="#999"
                transform={`rotate(-45 ${cx} ${yEtiqueta})`}
              >
                {acortar(etiquetas[i])}
              </text>
            ) : (
              <text x={cx} y={altoTotal - 8} textAnchor="middle" fontSize="10" fill="#999">
                {etiquetas[i]}
              </text>
            )}
          </g>
        );
      })}
    </Marco>
  );
};
