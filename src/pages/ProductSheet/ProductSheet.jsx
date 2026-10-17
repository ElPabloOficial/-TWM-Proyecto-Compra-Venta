
import { useState } from "react";
import { Box } from "@mui/material";

import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";

import ProductInfo from "../../components/organisms/ProductInfo/ProductInfo";
import ProductDescription from "../../components/organisms/ProductDescription/ProductDescription";
import ProductReviews from "../../components/organisms/ProductReviews/ProductReviews";
import RelatedProducts from "../../components/organisms/RelatedProducts/RelatedProducts";

const product = {
  id: 1,
  nombre:
    "Laptop Pro X-16 Titanium – 32GB RAM, 1TB SSD, Procesador Octa-Core Última Generación",
  categoria: "Laptops",
  precio: 1450990,
  precioAnterior: 1890990,
  stock: 15,
  rating: 4.5,
  cantidadResenas: 128,
  descripcion:
    "Laptop de alto rendimiento diseñada para profesionales y usuarios que necesitan potencia para trabajar, estudiar y ejecutar múltiples aplicaciones simultáneamente.",
};

const service = {
  id: 7,
  nombre: "Sesión de kinesiología a domicilio",
  categoria: "Salud",
  precio: 25000,
  rating: 4.5,
  cantidadResenas: 126,
  mayoresEdad: true,
  descripcion:
    "Servicio de kinesiología a domicilio, adaptado a las necesidades de cada paciente.",
};

const relatedProducts = [
  { id: 2, nombre: 'Monitor Ultra-Wide de 34"', precio: 299990 },
  { id: 3, nombre: "Teclado Mecánico RGB", precio: 79990 },
  { id: 4, nombre: "Mouse Gamer Inalámbrico", precio: 49990 },
  { id: 5, nombre: "Audífonos Gamer", precio: 69990 },
  { id: 6, nombre: "Mousepad XL", precio: 24990 },
];

const relatedServices = [
  { id: 8, nombre: "Masaje terapéutico", precio: 20000 },
  { id: 9, nombre: "Evaluación kinésica", precio: 30000 },
  { id: 10, nombre: "Rehabilitación física", precio: 25000 },
];

const reviews = [
  {
    id: 1,
    usuario: "Esteban Plaza Vera",
    fecha: "15 de Octubre 2026",
    rating: 5,
    comentario:
      "Excelente atención y muy buen servicio. Totalmente recomendado.",
  },
];

export default function ProductSheet({ type = "product" }) {
  const isService = type === "service";
  const currentItem = isService ? service : product;
  const relatedItems = isService ? relatedServices : relatedProducts;

  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const aumentarCantidad = () => {
    setQuantity((actual) =>
      isService
        ? actual + 1
        : Math.min(actual + 1, currentItem.stock)
    );
  };

  const disminuirCantidad = () => {
    setQuantity((actual) => Math.max(actual - 1, 1));
  };

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
          products={relatedItems}
          type={type}
        />
      </Box>

      <Footer />
    </>
  );
}
