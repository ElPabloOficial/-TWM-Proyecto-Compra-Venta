
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import "../../styles/Wishlist.css";

const WishlistScreen = () => {
    const navigate = useNavigate();

    // Temporary mock data — replace with API data later.
    const [wishlist, setWishlist] = useState([
        {
            id: 1,
            name: "Auriculares inalámbricos",
            description:
            "Suena claro, batería larga y siseño compacto.",
            price: 89990,
            status: "En stock",
            image: null,
            color: "blue",
        },
        {
            id: 2,
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
            name: "Power bank portátil",
            description:
            "Carga rápida y diseño compacto para llevar siempre.",
            price: 29990,
            status: "Agotado",
            image: null,
            color: "green",
        },
    ]);

    // Remove a product from the wishlist.
    const handleRemove = (productId) => {
        setWishlist((currentWishlist) =>
        currentWishlist.filter(
            (product) => product.id !== productId
        )
        );
    };

    // Temporary action — connect to your cart later.
    const handleAddToCart = (product) => {
        if (product.status !== "En stock") return;

        alert(`${product.name} added to cart!`);
    };

    // Show the placeholder if an image fails to load.
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
        {/* Return button */}
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

        {/* Page heading */}
        <section className="wishlist-header">
        <div>

        <h1>Lista de deseos</h1>

        <p className="wishlist-subtitle">
        Revisa tus productos guardados y agrega los que quieras al carrito.
            </p>
            </div>

            <div className="wishlist-count">
            {wishlist.length}{" "}
            {wishlist.length === 1 ? "item" : "items"}
            </div>
            </section>

            {/* Wishlist products */}
            {wishlist.length > 0 ? (
                <section
                className="wishlist-list"
                aria-label="Wishlist products"
                >
                {wishlist.map((product) => (
                    <article
                    className="wishlist-item"
                    key={product.id}
                    >
                    {/* Product image or placeholder */}
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

                    {/* Product information */}
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

                    {/* Price and actions */}
                    <div className="wishlist-product-actions">
                    <p className="wishlist-price">
                    ${product.price.toLocaleString("es-CL")}
                    </p>

                    <CustomButton
                    className="wishlist-cart-button"
                    variant="primary"
                    size="medium"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() =>
                        handleAddToCart(product)
                    }
                    disabled={
                        product.status !== "In stock"
                    }
                    sx={{
                        width: "100%",
                        minHeight: "40px",
                        borderRadius: "7px",
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                    >
                    Add to cart
                    </CustomButton>

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
                    Remove from list
                    </CustomButton>
                    </div>
                    </article>
                ))}
                </section>
            ) : (
                /* Empty wishlist */
                <section className="wishlist-empty">
                <span
                className="wishlist-empty-icon"
                aria-hidden="true"
                >
                ♡
                </span>

                <h2>Your wishlist is empty</h2>

                <p>
                Products you save will appear here.
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
                Continue shopping
                </CustomButton>
                </section>
            )}
            </main>
            </>
    );
};

export default WishlistScreen;
