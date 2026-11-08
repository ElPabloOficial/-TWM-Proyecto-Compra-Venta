import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Header from "../../components/organisms/Header/Header";
import ConfirmPurchaseTools from "../../components/molecules/ConfirmPurchaseTools/ConfirmPurchaseTools";
import ConfirmPurchaseTable from "../../components/organisms/ConfirmPurchaseTable/ConfirmPurchaseTable";
import useCart from "../../context/useCart";
import { useToast } from "../../context/ToastContext";
import { calcularTotales, crearVenta, listarDirecciones } from "../../services/cartService";

const ROJO = "#EC3333";
const formatearPrecio = (numero) => `$${numero.toLocaleString("es-CL")}`;

// Los valores son los que acepta la API (mediopago: "Tarjeta" | "Transferencia")
const mediosPago = [
  { id: "Tarjeta", label: "Tarjeta" },
  { id: "Transferencia", label: "Transferencia" },
];

const campoSx = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  fontSize: 14,
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const ConfirmPurchaseScreen = () => {
  const navigate = useNavigate();
  const { cart, cargando, user, clearCart } = useCart();
  const { mostrarToast } = useToast();

  const [direcciones, setDirecciones] = useState([]);
  const [direccionId, setDireccionId] = useState("");
  const [cargandoDirecciones, setCargandoDirecciones] = useState(true);
  const [medioPago, setMedioPago] = useState("Tarjeta");
  const [ultimos4, setUltimos4] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nota, setNota] = useState("");
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    let activo = true;
    listarDirecciones()
      .then((lista) => {
        if (!activo) return;
        setDirecciones(lista);
        setDireccionId(lista[0] ? String(lista[0].id) : "");
      })
      .catch(() => {}) // si falla, la tarjeta de dirección avisa que no hay ninguna
      .finally(() => activo && setCargandoDirecciones(false));
    return () => {
      activo = false;
    };
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (!cargando && cart.length === 0 && !pagando) return <Navigate to="/carrito" replace />;

  const resumen = calcularTotales(cart);
  const requiereDespacho = cart.some((item) => item.tipo === "producto");
  const sinPrecio = cart.some((item) => item.precio === null);

  const pagoValido =
    medioPago === "Tarjeta" ? /^\d{4}$/.test(ultimos4) : /^\d{4,9}$/.test(codigo);
  const direccionValida = !requiereDespacho || direccionId !== "";
  const puedePagar = !cargando && !pagando && !sinPrecio && pagoValido && direccionValida;

  const pagar = async () => {
    setPagando(true);
    setError("");
    // Los datos de pago (últimos dígitos, código de transferencia) no se imprimen
    console.log("[Compra] Pagar:", {
      medioPago,
      requiereDespacho,
      id_direccion: requiereDespacho ? direccionId : null,
      articulos: cart.map((item) => ({ tipo: item.tipo, id: item.id, cantidad: item.cantidad })),
      total: resumen.total,
    });

    try {
      // Pago simulado: no hay pasarela, solo se registra el medio de pago y sus datos de referencia
      await crearVenta({
        mediopago: medioPago,
        ult4digitostarjeta: medioPago === "Tarjeta" ? Number(ultimos4) : null,
        codigotransferencia: medioPago === "Transferencia" ? Number(codigo) : null,
        requieredespacho: requiereDespacho,
        id_direccion: requiereDespacho ? Number(direccionId) : null,
        nota: nota.trim() || null,
      });
      clearCart(); // la API ya vació el carrito
      mostrarToast("Compra realizada correctamente");
      navigate("/historial");
    } catch (e) {
      setError(e.message);
      setPagando(false);
    }
  };

  const detallePago =
    medioPago === "Tarjeta" ? (
      <Box>
        <Box component="label" htmlFor="pago-ult4" sx={{ fontSize: 12, display: "block", marginBottom: 0.5 }}>
          Últimos 4 dígitos de la tarjeta
        </Box>
        <Box
          component="input"
          id="pago-ult4"
          inputMode="numeric"
          maxLength={4}
          placeholder="4521"
          value={ultimos4}
          onChange={(e) => setUltimos4(e.target.value.replace(/\D/g, ""))}
          sx={{ ...campoSx, maxWidth: 160 }}
        />
      </Box>
    ) : (
      <Box>
        <Box component="label" htmlFor="pago-codigo" sx={{ fontSize: 12, display: "block", marginBottom: 0.5 }}>
          Código de la transferencia
        </Box>
        <Box
          component="input"
          id="pago-codigo"
          inputMode="numeric"
          maxLength={9}
          placeholder="Ej: 48210934"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
          sx={{ ...campoSx, maxWidth: 240 }}
        />
      </Box>
    );

  return (
    <>
      <Header />

      <Box
        component="main"
        sx={{ maxWidth: 760, width: "calc(100% - 48px)", margin: "0 auto", padding: "32px 0 64px", display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Breadcrumbs separator="›" sx={{ fontSize: 13 }}>
          <Box component="span" onClick={() => navigate("/carrito")} sx={{ cursor: "pointer" }}>
            Carrito
          </Box>
          <Box component="span" sx={{ color: ROJO }}>Confirmar compra</Box>
        </Breadcrumbs>

        <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
          Confirmar compra
        </Box>

        {cargando ? (
          <Box sx={{ color: "#666" }}>Cargando tu compra...</Box>
        ) : (
          <>
            <ConfirmPurchaseTable items={cart} />

            <ConfirmPurchaseTools
              requiereDespacho={requiereDespacho}
              direcciones={direcciones}
              direccionId={direccionId}
              onElegirDireccion={setDireccionId}
              cargando={cargandoDirecciones}
            />

            <ConfirmPurchaseTable
              resumen={resumen}
              mediosPago={mediosPago}
              medioPago={medioPago}
              onMedioPago={setMedioPago}
              detallePago={detallePago}
            />

            <Box>
              <Box component="label" htmlFor="compra-nota" sx={{ fontSize: 13, display: "block", marginBottom: 0.5 }}>
                Nota para el vendedor (opcional)
              </Box>
              <Box
                component="textarea"
                id="compra-nota"
                rows={2}
                maxLength={200}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                sx={campoSx}
              />
            </Box>

            {error && (
              <Box role="alert" sx={{ color: "#EF4444", fontSize: 14 }}>
                {error}
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 3, marginTop: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/carrito")}
                disabled={pagando}
                sx={{ width: 150, color: "#000", borderColor: "#000" }}
              >
                Volver al carrito
              </Button>
              <Button
                variant="contained"
                disableElevation
                disabled={!puedePagar}
                onClick={pagar}
                sx={{ width: 240, backgroundColor: ROJO, "&:hover": { backgroundColor: "#D42B2B" } }}
              >
                {pagando ? "Procesando..." : `Pagar ${formatearPrecio(resumen.total)}`}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default ConfirmPurchaseScreen;
