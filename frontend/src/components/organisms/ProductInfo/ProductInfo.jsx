import DateField from "../../atoms/DateField/DateField";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomButton from "../../atoms/Button/CustomButton";
import CustomIconButton from "../../atoms/IconButton/CustomIconButton";
import useCart from "../../../context/useCart";
import { urlImagen } from "../../../services/cartService";
import { useToast } from "../../../context/ToastContext";
import { agregarAWishlist, obtenerMiWishlist } from "../../../services/wishlistService";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function ProductInfo({
  type = "product",
  product,
  quantity,
  aumentarCantidad,
  disminuirCantidad,
  date, 
  setDate,
  time,
  setTime,
}) {
  const isService = type === "service";
  const navigate = useNavigate();
  const { addItem, user } = useCart();
  const { mostrarToast } = useToast();

  const tipoItem = isService ? "servicio" : "producto";
  const haySesion = Boolean(user);

  // Corazón: lleno si el producto o servicio ya está en la lista de deseos del usuario
  const [enLista, setEnLista] = useState(false);
  const [guardandoFavorito, setGuardandoFavorito] = useState(false);

  useEffect(() => {
    if (!haySesion) return;
    let activo = true; // evita actualizar el estado si la ficha se cerró antes de que llegue la respuesta

    const revisar = async () => {
      try {
        const lista = await obtenerMiWishlist();
        const guardados = isService ? lista.servicios : lista.productos;
        if (activo) setEnLista(guardados.some((g) => g.id === product.id));
      } catch {
        // Si no se puede consultar, el corazón queda vacío; al presionarlo la API dirá si ya estaba
      }
    };

    revisar();
    return () => {
      activo = false;
    };
  }, [haySesion, isService, product.id]);

  const agregarAFavoritos = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (enLista) {
      mostrarToast("Ya está en tu lista de deseos.");
      return;
    }
    try {
      setGuardandoFavorito(true);
      await agregarAWishlist(tipoItem, product.id);
      setEnLista(true);
      mostrarToast(`${product.nombre ?? "El artículo"} se agregó a tu lista de deseos`);
    } catch (e) {
      if (/ya está/i.test(e.message)) setEnLista(true); // la API avisa si ya estaba guardado
      mostrarToast(e.message, "error");
    } finally {
      setGuardandoFavorito(false);
    }
  };

  // Lleva a "Solicitar cotización" con este producto o servicio ya cargado, con la cantidad elegida
  const solicitarCotizacion = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/cotizaciones/nueva", {
      state: {
        item: {
          clave: `${tipoItem}-${product.id}`,
          id: product.id,
          nombre: product.nombre,
          categoria: product.categoria,
          precio: Number(product.precio) || 0,
          tipo: isService ? "servicio" : "unidad",
          cantidad: quantity,
        },
      },
    });
  };

  const agregarAlCarrito = async () => {
    if (isService && (!date || !time)) {
      mostrarToast("Selecciona la fecha y el horario del servicio.", "error");
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }
    console.log("[Carrito] Agregar desde la ficha:", { tipo: isService ? "servicio" : "producto", id: product.id, cantidad: quantity });
    try {
      await addItem({ tipo: isService ? "servicio" : "producto", id: product.id }, quantity);
      mostrarToast(`${product.nombre ?? "El artículo"} se agregó al carrito`);
    } catch (e) {
      mostrarToast(e.message, "error");
    }
  };

  const imagenUrl = urlImagen(product.imagen);

  const inputSx = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: 12,
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "white",
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        p: 3,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, md: 5 },
        minHeight: 280,
      }}
    >
      {/* IMAGEN */}
      <Box
        sx={{
          width: { xs: "100%", md: "45%" },
          minHeight: 220,
          height: { xs: 250, md: 320 },
          backgroundColor: "#d9d9d9",
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          borderRadius: 1,
        }}
      >
        {imagenUrl ? (
          <Box
            component="img"
            src={imagenUrl}
            alt={product.nombre}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <Box sx={{ color: "#777", fontSize: 13 }}>
            Imagen no disponible
          </Box>
        )}
      </Box>

      {/* INFORMACIÓN */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* NOMBRE */}
        <Box
          component="h1"
          sx={{
            fontSize: 20,
            m: 0,
            fontWeight: "bold",
          }}
        >
          {product.nombre}
        </Box>

        {/* RATING */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ color: "#F5B400" }}>★★★★★</Box>

          <Box>{product.rating}</Box>

          <Box sx={{ color: "#777", fontSize: 12 }}>
            ({product.cantidadResenas} reseñas de clientes)
          </Box>
        </Box>

        {/* RESTRICCIÓN DE EDAD PARA SERVICIOS */}
        {isService && product.mayoresEdad && (
          <Box sx={{ fontSize: 13, mt: 2 }}>
            Servicio apto solo para mayores de 18 años
          </Box>
        )}

        {/* PRECIO */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 1,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              color: "#16A34A",
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            ${product.precio.toLocaleString("es-CL")}
            {isService && (
              <Box
                component="span"
                sx={{ fontSize: 13, fontWeight: "normal" }}
              >
                {" "}la hora
              </Box>
            )}
          </Box>

          {!isService && product.precioAnterior != null && (
            <Box
              sx={{
                color: "#777",
                fontSize: 12,
                textDecoration: "line-through",
              }}
            >
              ${product.precioAnterior.toLocaleString("es-CL")}
            </Box>
          )}
        </Box>

        {/* STOCK PARA PRODUCTOS */}
        {!isService && (
          <Box
            sx={{
              color: product.stock > 0 ? "#16A34A" : "#DC2626",
              fontSize: 13,
              mt: 1,
            }}
          >
            {product.stock > 0
              ? `Stock disponible (${product.stock} ${product.stock === 1 ? "unidad" : "unidades"})`
              : "Sin stock"}
          </Box>
        )}

        {/* CONTROLES: DEBAJO DEL PRECIO */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            mt: 3,
            flexWrap: "wrap",
          }}
        >
          {/* CANTIDAD DE UNIDADES U HORAS */}
          <Box sx={{ minWidth: 85 }}>
            <Box sx={{ fontSize: 12, mb: 0.5 }}>
              {isService ? "Cantidad de horas" : "Cantidad"}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CustomIconButton
                onClick={disminuirCantidad}
                ariaLabel="Disminuir cantidad"
              >
                <RemoveIcon />
              </CustomIconButton>

              <Box sx={{ minWidth: 12, textAlign: "center" }}>
                {quantity}
              </Box>

              <CustomIconButton
                onClick={aumentarCantidad}
                ariaLabel="Aumentar cantidad"
              >
                <AddIcon />
              </CustomIconButton>
            </Box>
          </Box>

          {/* FECHA Y HORARIO SOLO PARA SERVICIOS */}
          {isService && (
            <>
              <Box sx={{ flex: 1, minWidth: 105 }}>
                <Box sx={{ fontSize: 12, mb: 0.5 }}>
                  Fecha
                </Box>

                <DateField
                  value={date}
                  onChange={setDate}
                  inputStyle={inputSx}
                  ariaLabel="Fecha del servicio"
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 90 }}>
                <Box sx={{ fontSize: 12, mb: 0.5 }}>
                  Horario
                </Box>

                <Box
                  component="input"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  sx={inputSx}
                  aria-label="Horario del servicio"
                />
              </Box>
            </>
          )}
        </Box>

        {/* BOTONES DEBAJO DE LOS CONTROLES */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            flexWrap: "wrap",
          }}
        >
          <CustomButton
            sx={{ flex: "1 1 130px" }}
            onClick={agregarAlCarrito}
          >
            Agregar al Carrito
          </CustomButton>

          <CustomButton
            variant="tertiary"
            sx={{ flex: "1 1 145px" }}
            onClick={solicitarCotizacion}
          >
            Solicitar Cotización
          </CustomButton>

          <CustomIconButton
            ariaLabel={enLista ? "Ya está en tu lista de deseos" : "Agregar a favoritos"}
            disabled={guardandoFavorito}
            onClick={agregarAFavoritos}
          >
            {enLista ? <FavoriteIcon sx={{ color: "#EC3333" }} /> : <FavoriteBorderIcon />}
          </CustomIconButton>
        </Box>
      </Box>
    </Box>
  );
}