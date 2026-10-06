import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";
import CustomButton from "../../components/atoms/Button/CustomButton";
import "../../styles/Home.css";

// TEMPORAL: datos de ejemplo hasta que se conecte el backend
const crearItems = (prefijo) =>
  [1, 2, 3, 4].map((n) => ({
    id: `${prefijo}-${n}`,
    categoria: "TECNOLOGÍA",
    nombre: "Smartphone Galaxy S23 Ultra",
    precio: 899990,
    precioAnterior: 949990,
    imagen: "",
  }));

const productosDestacados = crearItems("p");
const serviciosDestacados = crearItems("s");

const formatoCLP = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);

const HomeScreen = () => {
  const handleAgregarCarro = (item) => {
    console.log("[HomeScreen] handleAgregarCarro():", item);
  };

  const handleVerOfertas = () => {
    console.log("[HomeScreen] handleVerOfertas()");
  };

  // Sección con título y grilla de tarjetas (se usa para productos y servicios)
  const renderSeccion = (etiqueta, titulo, descripcion, items) => (
    <section className="home-section">
      {etiqueta && <span className="home-etiqueta">{etiqueta}</span>}
      <h2 className="home-titulo">{titulo}</h2>
      {descripcion && <p className="home-descripcion">{descripcion}</p>}

      <div className="home-grid">
        {items.map((item) => (
          <article key={item.id} className="home-card">
            <div className="home-card-img">
              {item.imagen && <img src={item.imagen} alt={item.nombre} />}
            </div>
            <span className="home-card-cat">{item.categoria}</span>
            <h3 className="home-card-nombre">{item.nombre}</h3>
            <div className="home-card-precios">
              <span className="home-card-precio">{formatoCLP(item.precio)}</span>
              <span className="home-card-antes">{formatoCLP(item.precioAnterior)}</span>
              <span className="home-card-desc">
                -{Math.round((1 - item.precio / item.precioAnterior) * 100)}%
              </span>
            </div>
            <CustomButton
              variant="primary"
              size="small"
              fullWidth
              onClick={() => handleAgregarCarro(item)}
            >
              Agregar al Carro
            </CustomButton>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="home-layout">
      <Header />

      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-texto">
            <span className="home-hero-badge">OFERTA DEL DÍA</span>
            <h1>
              ¡Comprá con la mejor oferta del día!
              <br />
              Envío gratis y hasta 40% OFF
            </h1>
            <p>
              Descubrí productos destacados, ofertas flash y beneficios
              exclusivos para compradores inteligentes.
            </p>
            <button type="button" className="home-hero-link" onClick={handleVerOfertas}>
              Ver ofertas
            </button>
          </div>
          <div className="home-hero-img" aria-hidden="true" />
        </section>

        {renderSeccion(
          "CATÁLOGO",
          "Productos Destacados",
          "Encuentra lo que necesitas con precios increíbles y la garantía total de nuestro ratón ayudante.",
          productosDestacados
        )}

        {renderSeccion(null, "Servicios Destacados", null, serviciosDestacados)}
      </main>

      <Footer />
    </div>
  );
};

export default HomeScreen;