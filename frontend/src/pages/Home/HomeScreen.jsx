import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";
import CustomButton from "../../components/atoms/Button/CustomButton";
import CardGridSkeleton from "../../components/molecules/CardGridSkeleton/CardGridSkeleton";
import useCart from "../../context/useCart";
import { useToast } from "../../context/ToastContext";
import { listarCatalogo, rutaDetalle } from "../../services/catalogService";
import { urlImagen } from "../../services/cartService";
import "../../styles/Home.css";

const CANTIDAD_DESTACADOS = 4;
const REINTENTO_AUTOMATICO_MS = 5000;

// Destacados: primero lo que está en oferta (mayor descuento arriba) y después el resto
const destacados = (items, tipo) =>
  items
    .filter((i) => i.tipo === tipo)
    .sort((a, b) => b.descuentoPct - a.descuentoPct)
    .slice(0, CANTIDAD_DESTACADOS);

const formatoCLP = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);

const HomeScreen = () => {
  const { addItem, user } = useCart();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();

  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Sube al pedir "Reintentar" para volver a ejecutar la carga
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true; // evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta

    const cargar = async () => {
      try {
        const lista = await listarCatalogo();
        if (activo) {
          setCatalogo(lista);
          setError("");
        }
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [intento]);

  // Si la API no responde, las secciones siguen mostrando el esqueleto gris 
  // y se vuelve a intentar sola cada pocos segundos hasta que el catálogo cargue.
  useEffect(() => {
    if (!error) return undefined;
    const temporizador = setTimeout(() => setIntento((n) => n + 1), REINTENTO_AUTOMATICO_MS);
    return () => clearTimeout(temporizador);
  }, [error, intento]);

  const handleAgregarCarro = async (item) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      // El carrito guarda tipo + id (un producto y un servicio pueden tener el mismo id)
      await addItem({ tipo: item.tipo, id: item.id });
      mostrarToast(`${item.nombre} se agregó al carrito`);
    } catch (e) {
      mostrarToast(e.message, "error");
    }
  };

  const verDetalle = (item) => navigate(rutaDetalle(item));

  const handleVerOfertas = () => navigate("/catalogo?estado=oferta");

  // Oferta del día: la oferta vigente con el mayor descuento. Si no hay ninguna, el banner muestra un texto general.
  const ofertaDelDia = [...catalogo]
    .filter((i) => i.descuentoPct > 0 && i.precio !== null && i.precioAnterior !== null)
    .sort((a, b) => b.descuentoPct - a.descuentoPct)[0] ?? null;

  // Sección con título y grilla de tarjetas (se usa para productos y servicios)
  const renderSeccion = (etiqueta, titulo, descripcion, items, textoVacio) => (
    <section className="home-section">
      {etiqueta && <span className="home-etiqueta">{etiqueta}</span>}
      <h2 className="home-titulo">{titulo}</h2>
      {descripcion && <p className="home-descripcion">{descripcion}</p>}

      {cargando || error ? (
        <CardGridSkeleton cantidad={CANTIDAD_DESTACADOS} />
      ) : items.length === 0 ? (
        <p className="home-descripcion">{textoVacio}</p>
      ) : (
        <div className="home-grid">
          {items.map((item) => (
            <article key={item.clave} className="home-card">
              <div className="home-card-img" onClick={() => verDetalle(item)} style={{ cursor: "pointer" }}>
                {item.imagen && <img src={urlImagen(item.imagen)} alt={item.nombre} />}
              </div>
              <span className="home-card-cat">{item.categoria.toUpperCase()}</span>
              <h3 className="home-card-nombre">
                <button type="button" className="home-card-link" onClick={() => verDetalle(item)}>
                  {item.nombre}
                </button>
              </h3>
              <div className="home-card-precios">
                {item.precio !== null ? (
                  <span className="home-card-precio">{formatoCLP(item.precio)}</span>
                ) : (
                  <span className="home-card-precio">Consultar precio</span>
                )}
                {item.precioAnterior !== null && (
                  <>
                    <span className="home-card-antes">{formatoCLP(item.precioAnterior)}</span>
                    <span className="home-card-desc">-{item.descuentoPct}%</span>
                  </>
                )}
              </div>
              {/* Un servicio sin precio no se puede agregar al carro: se ve su ficha */}
              <CustomButton
                variant="primary"
                size="small"
                fullWidth
                onClick={() => (item.precio !== null ? handleAgregarCarro(item) : verDetalle(item))}
              >
                {item.precio !== null ? "Agregar al Carro" : "Ver detalle"}
              </CustomButton>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="home-layout">
      <Header />

      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-texto">
            <span className="home-hero-badge">{ofertaDelDia ? "OFERTA DEL DÍA" : "TU TIENDA DE LA COMUNIDAD"}</span>
            {ofertaDelDia ? (
              <>
                <h1>
                  ¡Aprovecha la mejor oferta del día!
                  <br />
                  Hasta {ofertaDelDia.descuentoPct}% OFF
                </h1>
                <p>
                  {ofertaDelDia.nombre}: ahora {formatoCLP(ofertaDelDia.precio)} en vez de{" "}
                  {formatoCLP(ofertaDelDia.precioAnterior)}.
                </p>
              </>
            ) : (
              <>
                <h1>Productos y servicios de emprendedores de tu comunidad</h1>
                <p>Explora el catálogo y encuentra lo que necesitas, con compra segura.</p>
              </>
            )}
            <button
              type="button"
              className="home-hero-link"
              onClick={ofertaDelDia ? handleVerOfertas : () => navigate("/catalogo")}
            >
              {ofertaDelDia ? "Ver ofertas" : "Ver catálogo"}
            </button>
          </div>

          {/* Recuadro de la oferta del día: abre la ficha del producto */}
          {ofertaDelDia && (
            <button
              type="button"
              className="home-hero-oferta"
              onClick={() => verDetalle(ofertaDelDia)}
              aria-label={`Ver ${ofertaDelDia.nombre}`}
            >
              {ofertaDelDia.imagen && (
                <img src={urlImagen(ofertaDelDia.imagen)} alt="" className="home-hero-oferta-img" />
              )}
              <span className="home-hero-oferta-info">
                <span className="home-hero-oferta-nombre">{ofertaDelDia.nombre}</span>
                <span className="home-hero-oferta-precios">
                  <strong>{formatoCLP(ofertaDelDia.precio)}</strong>
                  <s>{formatoCLP(ofertaDelDia.precioAnterior)}</s>
                  <em>-{ofertaDelDia.descuentoPct}%</em>
                </span>
              </span>
            </button>
          )}
        </section>

        {renderSeccion(
          "CATÁLOGO",
          "Productos Destacados",
          "Encuentra lo que necesitas con precios increíbles y la garantía total de nuestro ratón ayudante.",
          destacados(catalogo, "producto"),
          "Todavía no hay productos publicados."
        )}

        {renderSeccion(null, "Servicios Destacados", null, destacados(catalogo, "servicio"), "Todavía no hay servicios publicados.")}
      </main>

      <Footer />
    </div>
  );
};

export default HomeScreen;