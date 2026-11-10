import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import {
    listarListasDeseos,
    obtenerMiWishlist,
    eliminarDeWishlist,
} from "../../services/wishlistService";
import { listarCatalogo, rutaDetalle } from "../../services/catalogService";
import { urlImagen } from "../../services/cartService";
import useCart from "../../context/useCart";
import { useToast } from "../../context/ToastContext";

import "../../styles/Wishlist.css";

const COLORES = ["blue", "pink", "green"];

const WishlistScreen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [nombreLista, setNombreLista] = useState("");
    const [agregandoId, setAgregandoId] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recarga, setRecarga] = useState(0);

    // addItem agrega en la API y además actualiza el carrito de toda la app (el número del Header y la pantalla Carrito)
    const { addItem, user } = useCart();
    const { mostrarToast } = useToast();
    const rut = user?.rut ?? null;

    // Por ahora solo "Mis Favoritos" (lista 1) guarda productos de verdad: es la lista que llena el corazón
    // de la ficha del producto. La API todavía no maneja varias listas por usuario.
    const listaId = Number(searchParams.get("lista")) || 1;
    const esListaReal = listaId === 1;

    // Obtener el nombre de la lista seleccionada
    useEffect(() => {
        if (!searchParams.get("lista")) {
            setNombreLista("");
            return;
        }

        listarListasDeseos()
            .then((listas) => {
                const lista = listas.find((l) => l.id === listaId);
                setNombreLista(lista?.nombre ?? "");
            })
            .catch((e) => {
                console.error("Error al obtener el nombre de la lista:", e);
            });
    }, [searchParams, listaId]);

    // Cargar lo que el usuario guardó (GET /wishlist) y completarlo con el catálogo (precio, imagen, descripción)
    useEffect(() => {
        let activo = true;

        const cargar = async () => {
            if (!rut || !esListaReal) {
                setWishlist([]);
                setCargando(false);
                return;
            }

            setCargando(true);
            setError("");
            try {
                const [guardados, catalogo] = await Promise.all([
                    obtenerMiWishlist(),
                    listarCatalogo(),
                ]);

                const items = [
                    ...guardados.productos.map((g) => ({ ...g, tipo: "producto" })),
                    ...guardados.servicios.map((g) => ({ ...g, tipo: "servicio" })),
                ].map((g, i) => {
                    const c = catalogo.find((x) => x.tipo === g.tipo && x.id === g.id);
                    return {
                        id: g.id,
                        tipo: g.tipo,
                        name: c?.nombre || g.nombre,
                        description: c?.descripcion || "",
                        price: c?.precio ?? null, // un servicio sin vendedor puede no tener precio
                        // El catálogo no informa el stock: se muestra "Disponible" si tiene precio
                        disponible: c?.precio != null,
                        image: urlImagen(c?.imagen),
                        color: COLORES[i % COLORES.length],
                    };
                });

                if (activo) setWishlist(items);
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
    }, [rut, esListaReal, recarga]);

    // Agregar producto al carrito mediante la API
    const handleAddToCart = async (product) => {
        if (!product.disponible) return;

        if (!user) {
            navigate("/login");
            return;
        }

        try {
            setAgregandoId(product.id);

            // El carrito guarda tipo + id (un producto y un servicio pueden tener el mismo id)
            await addItem({ tipo: product.tipo || "producto", id: product.id }, 1);

            mostrarToast(`${product.name} se agregó al carrito`);
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            mostrarToast(error.message || "No se pudo agregar el producto al carrito.", "error");
        } finally {
            setAgregandoId(null);
        }
    };

    // Quitar producto de la lista (DELETE /wishlist/eliminar/{tipo}/{id})
    const handleRemove = async (product) => {
        console.log("[Lista de deseos] Quitar:", { tipo: product.tipo, id: product.id });

        try {
            await eliminarDeWishlist(product.tipo, product.id);
            setWishlist((actual) =>
                actual.filter((p) => !(p.tipo === product.tipo && p.id === product.id))
            );
            mostrarToast(`${product.name} se quitó de la lista`);
        } catch (e) {
            mostrarToast(e.message || "No se pudo quitar de la lista.", "error");
        }
    };

    // Mostrar imagen de reemplazo si ocurre un error
    const handleImageError = (product) => {
        setWishlist((actual) =>
            actual.map((p) =>
                p.tipo === product.tipo && p.id === product.id
                    ? { ...p, image: null }
                    : p
            )
        );
    };

    return (
        <>
            <Header />

            <main className="wishlist-page">

                {/* Botón volver */}
                <CustomButton
                    className="wishlist-back-button"
                    variant="secondary"
                    size="medium"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        border: "none",
                        backgroundColor: "transparent",
                        padding: "8px 0",
                        justifyContent: "flex-start",
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "transparent",
                            color: "#EC3333",
                        },
                    }}
                >
                    Volver
                </CustomButton>

                {/* Encabezado */}
                <section className="wishlist-header">
                    <div>
                        <h1>
                            {nombreLista || "Lista de deseos"}
                        </h1>

                        <p className="wishlist-subtitle">
                            Revisa tus productos guardados y agrega
                            los que quieras al carrito.
                        </p>
                    </div>

                    <div className="wishlist-count">
                        {wishlist.length}{" "}
                        {wishlist.length === 1
                            ? "producto"
                            : "productos"}
                    </div>
                </section>

                {/* Estados: sin sesión, cargando, error */}
                {!rut ? (
                    <section className="wishlist-empty">
                        <span className="wishlist-empty-icon" aria-hidden="true">♡</span>
                        <h2>Inicia sesión para ver tu lista</h2>
                        <p>Tus productos guardados aparecen aquí cuando entras a tu cuenta.</p>
                        <CustomButton
                            variant="primary"
                            size="medium"
                            onClick={() => navigate("/login")}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            Iniciar sesión
                        </CustomButton>
                    </section>
                ) : cargando ? (
                    <p role="status">Cargando tu lista...</p>
                ) : error ? (
                    <ErrorState
                        titulo="No pudimos cargar tu lista"
                        detalle={error}
                        onReintentar={() => setRecarga((n) => n + 1)}
                    />
                ) : wishlist.length > 0 ? (
                    <section
                        className="wishlist-list"
                        aria-label="Productos de la lista de deseos"
                    >
                        {wishlist.map((product) => (
                            <article
                                className="wishlist-item"
                                key={`${product.tipo}-${product.id}`}
                            >

                                {/* Imagen */}
                                <div
                                    className={`wishlist-product-image ${product.color}`}
                                >
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            loading="lazy"
                                            onError={() =>
                                                handleImageError(product)
                                            }
                                        />
                                    ) : (
                                        <span className="wishlist-image-placeholder">
                                            Imagen no disponible
                                        </span>
                                    )}
                                </div>

                                {/* Información */}
                                <div className="wishlist-product-info">
                                    <h2>
                                        <a
                                            href={rutaDetalle(product)}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(rutaDetalle(product));
                                            }}
                                            style={{ color: "inherit", textDecoration: "none" }}
                                        >
                                            {product.name}
                                        </a>
                                    </h2>

                                    <p className="wishlist-description">
                                        {product.description}
                                    </p>

                                    <span
                                        className={`wishlist-status ${
                                            product.disponible
                                                ? "available"
                                                : "unavailable"
                                        }`}
                                    >
                                        <span className="status-dot" />
                                        {product.disponible
                                            ? "Disponible"
                                            : "Sin precio disponible"}
                                    </span>
                                </div>

                                {/* Precio y botones */}
                                <div className="wishlist-product-actions">

                                    <p className="wishlist-price">
                                        {product.price != null
                                            ? `$${product.price.toLocaleString("es-CL")}`
                                            : "Sin precio"}
                                    </p>

                                    {/* Agregar al carrito */}
                                    <CustomButton
                                        className="wishlist-cart-button"
                                        variant="primary"
                                        size="medium"
                                        startIcon={<AddShoppingCartIcon />}
                                        onClick={() =>
                                            handleAddToCart(product)
                                        }
                                        disabled={
                                            !product.disponible ||
                                            agregandoId !== null
                                        }
                                        sx={{
                                            width: "100%",
                                            minHeight: "40px",
                                            borderRadius: "7px",
                                            textTransform: "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {agregandoId === product.id
                                            ? "Agregando..."
                                            : "Agregar al carrito"}
                                    </CustomButton>

                                    {/* Quitar de la lista */}
                                    <CustomButton
                                        className="wishlist-remove-button"
                                        variant="tertiary"
                                        size="medium"
                                        startIcon={<DeleteOutlineIcon />}
                                        onClick={() =>
                                            handleRemove(product)
                                        }
                                        sx={{
                                            width: "100%",
                                            minHeight: "40px",
                                            borderRadius: "7px",
                                            textTransform: "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Quitar de la lista
                                    </CustomButton>

                                </div>
                            </article>
                        ))}
                    </section>
                ) : (

                    /* Lista vacía */
                    <section className="wishlist-empty">

                        <span
                            className="wishlist-empty-icon"
                            aria-hidden="true"
                        >
                            ♡
                        </span>

                        <h2>
                            Tu lista de deseos está vacía
                        </h2>

                        <p>
                            {esListaReal
                                ? "Los productos que guardes con el corazón aparecerán aquí."
                                : "Por ahora solo «Mis Favoritos» guarda productos. Las listas personalizadas todavía no están conectadas."}
                        </p>

                        <CustomButton
                            variant="primary"
                            size="medium"
                            onClick={() => navigate("/catalogo")}
                            sx={{
                                minWidth: "180px",
                                textTransform: "none",
                            }}
                        >
                            Seguir comprando
                        </CustomButton>

                    </section>
                )}

            </main>
        </>
    );
};

export default WishlistScreen;