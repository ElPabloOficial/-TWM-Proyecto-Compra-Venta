import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


import * as api from "../../../services/productService";
import "../../../styles/CategoryMenu.css";

/*
 * CategoryMenu
 *
 * Menú desplegable de categorías (estilo mega menú):
 *   - Lista izquierda: categorías principales con ícono
 *   - Panel derecho: subcategorías en columnas, con sus hijos como enlaces
 *
 * Las categorías vienen de la API (GET /categorias). Si la API no responde
 * se muestran las de RESPALDO, que son las mismas de la base de datos.
 */

// TEMPORAL: respaldo hasta que la API esté siempre disponible. [id, nombre, padreId]
const RESPALDO = [
  [1, "Servicios", null], [2, "Productos", null],
  [3, "Computación y Tecnología", 1], [4, "Servicios domésticos", 1],
  [5, "Aseo", 4], [6, "Trabajo de jardín", 4],
  [7, "Limpieza de combustión y reparaciones menores", 4],
  [8, "Cuidado de adultos", 4], [9, "Cuidado de niños", 4],
  [10, "Otros servicios domésticos", 4], [11, "Servicios profesionales", 1],
  [12, "Computación: web, diseño y publicidad", 11], [13, "Abogados", 11],
  [14, "Contadores y Auditores", 11], [15, "Arquitecto", 11],
  [16, "Psicólogos", 11], [17, "Servicio de salud", 11],
  [18, "Médico", 17], [19, "Dentista", 17], [20, "Enfermería", 17],
  [21, "Kinesiología", 17], [22, "Otros servicios de salud", 17],
  [23, "Servicios educativos", 11], [24, "Clases particulares", 23],
  [25, "Fonoaudiología", 23], [26, "Terapeuta Ocupacional", 23],
  [27, "Otros servicios educativos", 23], [28, "Veterinarios", 11],
  [29, "Otros servicios profesionales", 11], [30, "Servicios para vehículos", 1],
  [31, "Confección de ropa y vestuario", 1],
  [32, "Banquetería, repostería y alimentación", 1], [33, "Otros servicios", 1],
  [34, "Tecnología", 2], [35, "Computación", 34], [36, "Audio y Música", 34],
  [37, "Juegos y consolas", 34], [38, "Electrónica y Televisión", 34],
  [39, "Otros tecnología", 34], [40, "Celulares", 2], [41, "Hogar y Cocina", 2],
  [42, "Alimentación", 2], [43, "Accesorios para vehículos", 2],
  [44, "Libros e instrumentos musicales", 2], [45, "Ropa, moda y calzado", 2],
  [46, "Juguetes y Niños", 2], [47, "Útiles y librería", 2], [48, "Otros productos", 2],
].map(([id, nombre, padreId]) => ({ id, nombre, padreId }));

// Íconos propios en SVG (no dependen de la versión de @mui/icons-material)
const FORMAS = {
  laptop: <><rect x="4" y="5" width="16" height="11" rx="1" /><path d="M2 19h20" /></>,
  celular: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  hogar: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  comida: <><path d="M6 3v6a2 2 0 0 0 4 0V3" /><path d="M8 11v10" /><path d="M17 3c-2 2-3 5-3 8h3v10" /></>,
  auto: <><path d="M3 16v-4l2-5h14l2 5v4z" /><path d="M3 12h18" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" /></>,
  libro: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></>,
  ropa: <path d="M8 3L3 7l3 3 2-1v12h8V9l2 1 3-3-5-4a4 4 0 0 1-8 0z" />,
  juguete: <><rect x="8" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></>,
  lapiz: <><path d="M4 20l1-4L16 5l3 3L8 19z" /><path d="M14 7l3 3" /></>,
  aseo: <><rect x="8" y="10" width="8" height="11" rx="2" /><path d="M10 10V6h5l2-2" /><path d="M19 7h.01M20 10h.01" /></>,
  maletin: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2" /><path d="M3 13h18" /></>,
  llave: <path d="M15 4a4 4 0 0 0-3 5L4 17a2 2 0 0 0 3 3l8-8a4 4 0 0 0 5-3l-3 2-3-3z" />,
  tijera: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 7.5L20 17M8.5 16.5L20 7" /></>,
  torta: <><rect x="4" y="12" width="16" height="8" /><path d="M4 16c3 2 5-2 8 0s5 2 8 0" /><path d="M12 12V8" /><path d="M12 5v.01" /></>,
  codigo: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  general: <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
};

const Icono = ({ tipo = "general", size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    {FORMAS[tipo] ?? FORMAS.general}
  </svg>
);

// Ícono según el nombre de la categoría (si no hay coincidencia, uno genérico)
const iconoDe = (nombre) => {
  const n = nombre.toLowerCase();
  const reglas = [
    ["computación y tecnología", "codigo"],
    ["tecnolog", "laptop"],
    ["celular", "celular"],
    ["hogar", "hogar"],
    ["alimentaci", "comida"],
    ["banquetería", "torta"],
    ["vehículo", n.includes("servicios") ? "llave" : "auto"],
    ["libros", "libro"],
    ["ropa", "ropa"],
    ["confección", "tijera"],
    ["juguete", "juguete"],
    ["útiles", "lapiz"],
    ["domésticos", "aseo"],
    ["profesionales", "maletin"],
  ];
  const regla = reglas.find(([clave]) => n.includes(clave));
  return regla ? regla[1] : "general";
};

const CategoryMenu = ({ abierto, onCerrar }) => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState(RESPALDO);
  const [principalId, setPrincipalId] = useState(null);

  // Pide las categorías a la API una sola vez; si falla, queda el respaldo.
  useEffect(() => {
    let activo = true;
    api
      .listarCategorias()
      .then((cats) => {
        if (activo && cats.length) setCategorias(cats);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  // Cierra con la tecla Escape
  useEffect(() => {
    if (!abierto) return undefined;
    const alTeclear = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto, onCerrar]);

  const hijosDe = useMemo(() => {
    const mapa = new Map();
    categorias.forEach((c) => {
      const lista = mapa.get(c.padreId) ?? [];
      lista.push(c);
      mapa.set(c.padreId, lista);
    });
    return mapa;
  }, [categorias]);

  // Una sola lista: categorías principales de todas las raíces (Productos primero)
  const principales = useMemo(
    () =>
      (hijosDe.get(null) ?? [])
        .filter((r) => hijosDe.has(r.id))
        .sort((x, y) => x.nombre.localeCompare(y.nombre))
        .flatMap((r) => hijosDe.get(r.id)),
    [hijosDe]
  );
  const principal = principales.find((c) => c.id === principalId) ?? principales[0];
  const columnas = principal ? hijosDe.get(principal.id) ?? [] : [];

  if (!abierto || !principal) return null;

  const ir = (id) => {
    navigate(`/catalogo?categoria=${id}`);
    onCerrar();
  };

  return (
    <div className="catmenu" role="menu" aria-label="Categorías">
      {/* Lista izquierda */}
      <nav className="catmenu-lateral">
        <ul className="catmenu-lista">
          {principales.map((c) => {
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="menuitem"
                  className={`catmenu-principal ${c.id === principal.id ? "activo" : ""}`}
                  onMouseEnter={() => setPrincipalId(c.id)}
                  onFocus={() => setPrincipalId(c.id)}
                  onClick={() => ir(c.id)}
                >
                  <Icono tipo={iconoDe(c.nombre)} />
                  <span className="catmenu-principal-nombre">{c.nombre}</span>
                  <Icono tipo="chevron" size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Panel derecho */}
      <section className="catmenu-panel">
        <header className="catmenu-panel-cabecera">
          <h2 className="catmenu-panel-titulo">
            <Icono tipo={iconoDe(principal.nombre)} size={24} />
            {principal.nombre}
          </h2>
          <button type="button" className="catmenu-vertodo-grande" onClick={() => ir(principal.id)}>
            Ver todo {principal.nombre} &gt;
          </button>
        </header>

        {columnas.length === 0 ? (
          <button type="button" className="catmenu-solo" onClick={() => ir(principal.id)}>
            Ver todas las publicaciones de {principal.nombre}
          </button>
        ) : (
          <div className="catmenu-columnas">
            {columnas.map((col) => {
              const items = hijosDe.get(col.id) ?? [];
              return (
                <div key={col.id} className="catmenu-columna">
                  <button type="button" className="catmenu-columna-titulo" onClick={() => ir(col.id)}>
                    {col.nombre}
                  </button>
                  <button type="button" className="catmenu-vertodo" onClick={() => ir(col.id)}>
                    Ver todo
                  </button>
                  {items.length > 0 && (
                    <ul className="catmenu-enlaces">
                      {items.map((it) => (
                        <li key={it.id}>
                          <button type="button" onClick={() => ir(it.id)}>
                            {it.nombre}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryMenu;
