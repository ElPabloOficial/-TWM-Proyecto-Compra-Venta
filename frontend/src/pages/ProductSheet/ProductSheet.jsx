import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";

import ProductInfo from "../../components/organisms/ProductInfo/ProductInfo";
import ProductDescription from "../../components/organisms/ProductDescription/ProductDescription";
import ProductReviews from "../../components/organisms/ProductReviews/ProductReviews";
import RelatedProducts from "../../components/organisms/RelatedProducts/RelatedProducts";

import { productoService } from "../../services/productoService";
import { servicioService } from "../../services/servicioService";
import { reviewService } from "../../services/reviewService";

const obtenerIdsCategorias = (categorias = []) => {
  if (!Array.isArray(categorias)) return [];

  return categorias
    .map((categoria) =>
      typeof categoria === "object" && categoria !== null
        ? categoria.id ?? categoria.id_categoria ?? categoria.idCategoria
        : categoria
    )
    .filter((id) => id != null)
    .map(String);
};

export default function ProductSheet({ type = "product" }) {
  const { id } = useParams();

  const isService = type === "service";

  const [currentItem, setCurrentItem] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");
        setReviews([]);
        setRelatedProducts([]);
        setRelatedServices([]);

        let itemActual;
        let caracteristicas = {};

        // 1. Obtener el producto o servicio actual
        if (isService) {
          itemActual = await servicioService.obtenerServicioPorId(id);
        } else {
          itemActual = await productoService.obtenerProductoPorId(id);
        }

        caracteristicas =
          typeof itemActual.caracteristicas === "string"
            ? JSON.parse(itemActual.caracteristicas)
            : itemActual.caracteristicas || {};

        const categoria =
          itemActual.categorias?.[0]?.nombre || "Sin categoría";

        // 2. Adaptar el elemento actual
        if (isService) {
          setCurrentItem({
            id: itemActual.id,
            nombre: itemActual.nombre,
            categoria,
            precio: itemActual.precio,
            duracion: itemActual.duracion,
            modalidad: caracteristicas.modalidad || "",
            requisitos: caracteristicas.requisitos || "",
            mayoresEdad: itemActual.restriccionedad,
            imagen: itemActual.imagen,
            descripcion: caracteristicas.descripcion || "",
            vendedor: itemActual.vendedor,
            rating: 0,
            cantidadResenas: 0,
          });
        } else {
          setCurrentItem({
            id: itemActual.id,
            nombre: itemActual.nombre,
            categoria,
            precio:
              itemActual.precio_oferta ??
              Number(caracteristicas.precio || 0),
            precioAnterior:
              itemActual.precio_oferta != null
                ? Number(caracteristicas.precio || 0)
                : null,
            stock: Number(caracteristicas.stock || 0),
            rating: 0,
            cantidadResenas: 0,
            descripcion: caracteristicas.descripcion || "",
            imagen: itemActual.imagen,
            mayoresEdad: itemActual.restriccionedad,
            vendedor: itemActual.vendedor,
          });
        }

        // 3. Obtener todos los productos y servicios
        const [productos, servicios] = await Promise.all([
          productoService.obtenerProductos(),
          servicioService.obtenerServicios(),
        ]);

console.log(
  "CATEGORÍAS DEL SERVICIO ACTUAL:",
  JSON.stringify(itemActual.categorias, null, 2)
);

console.log(
  "PRIMEROS 5 SERVICIOS:",
  JSON.stringify(servicios.slice(0, 5), null, 2)
);

console.log(
  "PRIMEROS 5 PRODUCTOS:",
  JSON.stringify(productos.slice(0, 5), null, 2)
);

        // 4. Obtener categorías del elemento actual
        const categoriasActuales = obtenerIdsCategorias(
          itemActual.categorias
        );

        // 5. Filtrar productos relacionados
        const productosRelacionados = productos
          .filter((item) => {
            const categorias = obtenerIdsCategorias(item.categorias);

            return (
              (isService || String(item.id) !== String(id)) &&
              categorias.some((categoria) =>
                categoriasActuales.includes(categoria)
              )
            );
          })
          .map((item) => {
            let caracteristicasItem = {};

            try {
              caracteristicasItem =
                typeof item.caracteristicas === "string"
                  ? JSON.parse(item.caracteristicas)
                  : item.caracteristicas || {};
            } catch {
              caracteristicasItem = {};
            }

            return {
              id: item.id,
              nombre: item.nombre,
              precio: Number(
                item.precio_oferta || caracteristicasItem.precio || 0
              ),
              imagen: item.imagen,
            };
          });

        setRelatedProducts(productosRelacionados);

        // 6. Filtrar servicios relacionados
        const serviciosRelacionados = servicios
          .filter((item) => {
            const categorias = obtenerIdsCategorias(item.categorias);

            return (
              (!isService || String(item.id) !== String(id)) &&
              categorias.some((categoria) =>
                categoriasActuales.includes(categoria)
              )
            );
          })
          .map((item) => ({
            id: item.id,
            nombre: item.nombre,
            precio: Number(item.precio || 0),
            imagen: item.imagen,
          }));

        setRelatedServices(serviciosRelacionados);

        // 7. Obtener reseñas del producto o servicio
        const resenias = isService
          ? await reviewService.obtenerReseniasServicio(id)
          : await reviewService.obtenerReseniasProducto(id);

        const reseniasAdaptadas = resenias.map((review) => ({
          id: review.id,
          usuario: review.usuario,
          rating: Number(review.calificacion),
          comentario: review.comentario,
          fecha: review.fecha,
        }));

        setReviews(reseniasAdaptadas);

      } catch (err) {
        console.error("Error al cargar detalle:", err);
        setError(
          err.message || "No se pudo cargar la información."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, isService]);

  const aumentarCantidad = () => {
    setQuantity((actual) => actual + 1);
  };

  const disminuirCantidad = () => {
    setQuantity((actual) => Math.max(actual - 1, 1));
  };

  if (loading) {
    return (
      <>
        <Header />

        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>

        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />

        <Box
          sx={{
            minHeight: "60vh",
            p: 4,
            textAlign: "center",
          }}
        >
          {error}
        </Box>

        <Footer />
      </>
    );
  }

  if (!currentItem) {
    return (
      <>
        <Header />

        <Box
          sx={{
            minHeight: "60vh",
            p: 4,
            textAlign: "center",
          }}
        >
          No se encontró el{" "}
          {isService ? "servicio" : "producto"} solicitado.
        </Box>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <Box
        component="main"
        sx={{
          backgroundColor: "#f5f5f5",
          p: { xs: 1, md: "10px 30px 30px" },
        }}
      >
        <Box sx={{ fontSize: 13, mb: 1 }}>
          Inicio &gt; {isService ? "Servicios" : "Productos"} &gt;{" "}
          {currentItem.categoria}
        </Box>

        <ProductInfo
          type={type}
          product={currentItem}
          quantity={quantity}
          aumentarCantidad={aumentarCantidad}
          disminuirCantidad={disminuirCantidad}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
        />

        <ProductDescription
          product={currentItem}
          type={type}
        />

        <ProductReviews
          product={currentItem}
          reviews={reviews}
          type={type}
        />

        <RelatedProducts
          products={relatedProducts}
          services={relatedServices}
        />
      </Box>

      <Footer />
    </>
  );
}