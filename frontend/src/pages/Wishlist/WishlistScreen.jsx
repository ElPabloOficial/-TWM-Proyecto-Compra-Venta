
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import { listarListasDeseos } from "../../services/wishlistService";
import { agregarAlCarrito } from "../../services/cartService";

import "../../styles/Wishlist.css";

const WishlistScreen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [nombreLista, setNombreLista] = useState("");
    const [agregandoId, setAgregandoId] = useState(null);
    const [mensaje, setMensaje] = useState("");

    // Datos temporales de productos
    const [wishlist, setWishlist] = useState([
        {
            id: 1,
            tipo: "producto",
            name: "Auriculares inalámbricos",
            description:
                "Sonido claro, batería de larga duración y diseño compacto.",
            price: 89990,
            status: "En stock",
            image: null,
            color: "blue",
        },
        {
            id: 2,
            tipo: "producto",
            name: "Cafetera inteligente",
            description:
                "Controla el horario y la intensidad desde tu teléfono.",
            price: 149990,
            status: "En stock",
            image: null,
            color: "pink",
        },
        {
            id: 3,
            tipo: "producto",
            name: "Batería portátil",
            description:
                "Carga rápida y diseño compacto para llevar siempre.",
            price: 29990,
            status: "Agotado",
            image: null,
            color: "green",
        },
    ]);

    // Obtener el nombre de la lista seleccionada
    useEffect(() => {
        const id = Number(searchParams.get("lista"));

        if (!id) {
            setNombreLista("");
            return;
        }

        listarListasDeseos()
            .then((listas) => {
                const lista = listas.find((l) => l.id === id);
                setNombreLista(lista?.nombre ?? "");
            })
            .catch((error) => {
                console.error(
                    "Error al obtener el nombre de la lista:",
                    error
                );
            });
    }, [searchParams]);

    // Agregar producto al carrito mediante la API
    const handleAddToCart = async (product) => {
        if (product.status !== "En stock") return;

        try {
            setAgregandoId(product.id);
            setMensaje("");

            await agregarAlCarrito(
                product.tipo || "producto",
                product.id,
                1
            );

            setMensaje(
                `${product.name} se agregó correctamente al carrito.`
            );

        } catch (error) {
            console.error(
                "Error al agregar producto al carrito:",
                error
            );

            setMensaje(
                error.message ||
                "No se pudo agregar el producto al carrito."
            );

        } finally {
            setAgregandoId(null);
        }
    };

    // Quitar producto de la lista
    const handleRemove = (productId) => {
        console.log(
            "[Lista de deseos] Quitar producto:",
            { productId }
        );

        setWishlist((currentWishlist) =>
            currentWishlist.filter(
                (product) => product.id !== productId
            )
        );
    };

    // Mostrar imagen de reemplazo si ocurre un error
    const handleImageError = (productId) => {
        setWishlist((currentWishlist) =>
            currentWishlist.map((product) =>
                product.id === productId
                    ? { ...product, image: null }
                    : product
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

                {/* Mensaje de operación */}
                {mensaje && (
                    <p
                        role="status"
                        aria-live="polite"
                        className="wishlist-message"
                    >
                        {mensaje}
                    </p>
                )}

                {/* Productos */}
                {wishlist.length > 0 ? (
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
                                                handleImageError(product.id)
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
                                    <h2>{product.name}</h2>

                                    <p className="wishlist-description">
                                        {product.description}
                                    </p>

                                    <span
                                        className={`wishlist-status ${
                                            product.status === "En stock"
                                                ? "available"
                                                : "unavailable"
                                        }`}
                                    >
                                        <span className="status-dot" />
                                        {product.status}
                                    </span>
                                </div>

                                {/* Precio y botones */}
                                <div className="wishlist-product-actions">

                                    <p className="wishlist-price">
                                        $
                                        {product.price.toLocaleString("es-CL")}
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
                                            product.status !== "En stock" ||
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
                                            handleRemove(product.id)
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
                            Los productos que guardes aparecerán aquí.
                        </p>

                        <CustomButton
                            variant="primary"
                            size="medium"
                            onClick={() => navigate(-1)}
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
