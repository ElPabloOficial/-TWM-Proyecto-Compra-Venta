import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Header from "../../components/organisms/Header/Header";
import ConfirmPurchaseTools from "../../components/molecules/ConfirmPurchaseTools/ConfirmPurchaseTools";
import ConfirmPurchaseTable from "../../components/organisms/ConfirmPurchaseTable/ConfirmPurchaseTable";
import useCart from "../../context/useCart";
import { useToast } from "../../context/ToastContext";
import { IVA, calcularTotales, crearVenta, listarDirecciones, obtenerOpcionesEnvio } from "../../services/cartService";
import { obtenerCotizacion } from "../../services/quoteService";

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

  // Con ?cotizacion=ID se compra con esa cotización aceptada (a los precios acordados); sin él, con el carrito
  const [searchParams] = useSearchParams();
  const idCotizacion = searchParams.get("cotizacion");
  const [cotizacion, setCotizacion] = useState(null);
  const [cargandoCotizacion, setCargandoCotizacion] = useState(Boolean(idCotizacion));
  const [errorCotizacion, setErrorCotizacion] = useState("");

  const [direcciones, setDirecciones] = useState([]);
  const [direccionId, setDireccionId] = useState("");
  const [cargandoDirecciones, setCargandoDirecciones] = useState(true);
  // Empresas de despacho que pueden llevar el pedido (las elige el comprador y paga su precio)
  const [opciones, setOpciones] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [cargandoOpciones, setCargandoOpciones] = useState(true);
  const [errorOpciones, setErrorOpciones] = useState("");
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

  // GET /cotizaciones/{id}: la cotización con la que se compra
  useEffect(() => {
    if (!user || !idCotizacion) return undefined;
    let activo = true;

    setCargandoCotizacion(true);
    setErrorCotizacion("");
    obtenerCotizacion(idCotizacion)
      .then((datos) => {
        if (!activo) return;
        // Stock: productos de los que ya no quedan las unidades cotizadas
        const sinStock = datos.items.filter((i) => i.tipo === "producto" && i.stock != null && i.stock < i.quantity);

        if (datos.status === "Comprada") {
          setErrorCotizacion("Esta cotización ya fue utilizada en una compra.");
        } else if (datos.status !== "Respondida" && datos.status !== "Aceptada") {
          setErrorCotizacion("Solo puedes comprar con una cotización respondida o aceptada.");
        } else if (new Date(`${datos.expirationDate}T23:59:59`) < new Date()) {
          setErrorCotizacion("La cotización venció. Solicita una nueva.");
        } else if (sinStock.length > 0) {
          setErrorCotizacion(
            `No hay stock suficiente: ${sinStock.map((i) => `${i.name} (cotizaste ${i.quantity}, quedan ${i.stock})`).join("; ")}.`,
          );
        } else {
          setCotizacion(datos);
        }
      })
      .catch((e) => activo && setErrorCotizacion(e.message))
      .finally(() => activo && setCargandoCotizacion(false));

    return () => {
      activo = false;
    };
  }, [user, idCotizacion]);

  // GET /despachos/opciones: empresas que pueden llevar el pedido, con precio y plazo
  const listoParaEnvio = idCotizacion ? Boolean(cotizacion) : !cargando && cart.length > 0;
  useEffect(() => {
    if (!user || !listoParaEnvio) return undefined;
    let activo = true;

    setCargandoOpciones(true);
    setErrorOpciones("");
    obtenerOpcionesEnvio(idCotizacion)
      .then(({ opciones: lista }) => {
        if (!activo) return;
        setOpciones(lista);
        // Queda marcada la más barata; el comprador puede cambiarla
        setEmpresaId((actual) => (lista.some((o) => String(o.id) === actual) ? actual : lista[0] ? String(lista[0].id) : ""));
      })
      .catch((e) => activo && setErrorOpciones(e.message))
      .finally(() => activo && setCargandoOpciones(false));

    return () => {
      activo = false;
    };
  }, [user, listoParaEnvio, idCotizacion, cart.length]);

  if (!user) return <Navigate to="/login" replace />;
  if (!idCotizacion && !cargando && cart.length === 0 && !pagando) return <Navigate to="/carrito" replace />;

  // Lo que se paga: los ítems de la cotización o los del carrito
  const articulos = cotizacion
    ? cotizacion.items.map((i) => ({
        clave: `${i.tipo}-${i.id}`,
        tipo: i.tipo,
        id: i.id,
        nombre: i.name,
        vendedor: cotizacion.seller.name,
        cantidad: i.quantity,
        precio: i.unitPrice,
        imagen: null,
      }))
    : cart;
  const cargandoCompra = idCotizacion ? cargandoCotizacion : cargando;
  const rutaVolver = idCotizacion ? "/mis-cotizaciones" : "/carrito";

  const requiereDespacho = articulos.some((item) => item.tipo === "producto");

  // El envío se suma al neto y paga IVA junto con el resto (igual que lo cobra la API)
  const empresaElegida = opciones.find((o) => String(o.id) === empresaId);
  const costoEnvio = requiereDespacho ? empresaElegida?.costo ?? 0 : 0;
  const subtotal = calcularTotales(articulos);
  const ivaTotal = Math.round((subtotal.neto + costoEnvio) * IVA);
  const resumen = {
    neto: subtotal.neto,
    envio: requiereDespacho ? costoEnvio : undefined,
    iva: ivaTotal,
    total: subtotal.neto + costoEnvio + ivaTotal,
  };
  const sinPrecio = articulos.some((item) => item.precio === null);

  const pagoValido =
    medioPago === "Tarjeta" ? /^\d{4}$/.test(ultimos4) : /^\d{4,9}$/.test(codigo);
  const direccionValida = !requiereDespacho || direccionId !== "";
  const envioValido = !requiereDespacho || (!cargandoOpciones && !errorOpciones && Boolean(empresaElegida));
  const puedePagar =
    !cargandoCompra && !errorCotizacion && !pagando && !sinPrecio && pagoValido && direccionValida && envioValido;

  const pagar = async () => {
    setPagando(true);
    setError("");
    // Los datos de pago (últimos dígitos, código de transferencia) no se imprimen
    console.log("[Compra] Pagar:", {
      medioPago,
      requiereDespacho,
      id_direccion: requiereDespacho ? direccionId : null,
      empresa_despacho: requiereDespacho ? empresaElegida?.nombre : null,
      costo_envio: costoEnvio,
      cotizacion: idCotizacion,
      articulos: articulos.map((item) => ({ tipo: item.tipo, id: item.id, cantidad: item.cantidad })),
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
        id_empresad: requiereDespacho ? Number(empresaId) : null,
        nota: nota.trim() || null,
        id_cotizacion: idCotizacion ? Number(idCotizacion) : null,
      });
      if (!idCotizacion) clearCart(); // la API ya vació el carrito (con una cotización no se toca)
      mostrarToast(
        cotizacion?.status === "Respondida"
          ? "Cotización aceptada y compra realizada correctamente"
          : "Compra realizada correctamente",
      );
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
          <Box component="span" onClick={() => navigate(rutaVolver)} sx={{ cursor: "pointer" }}>
            {idCotizacion ? "Mis cotizaciones" : "Carrito"}
          </Box>
          <Box component="span" sx={{ color: ROJO }}>Confirmar compra</Box>
        </Breadcrumbs>

        <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
          Confirmar compra
        </Box>

        {cotizacion && (
          <Box sx={{ fontSize: 13, color: "#555" }}>
            {cotizacion.status === "Respondida"
              ? `Al pagar aceptas la cotización #${cotizacion.id} y compras a los precios acordados con el vendedor.`
              : `Compra con la cotización #${cotizacion.id}: pagas los precios acordados con el vendedor.`}
          </Box>
        )}

        {cargandoCompra ? (
          <Box sx={{ color: "#666" }}>Cargando tu compra...</Box>
        ) : errorCotizacion ? (
          <>
            <Box role="alert" sx={{ color: "#EF4444", fontSize: 14 }}>
              {errorCotizacion}
            </Box>
            <Box>
              <Button variant="outlined" onClick={() => navigate(rutaVolver)} sx={{ color: "#000", borderColor: "#000" }}>
                Volver a mis cotizaciones
              </Button>
            </Box>
          </>
        ) : (
          <>
            <ConfirmPurchaseTable items={articulos} />

            <ConfirmPurchaseTools
              requiereDespacho={requiereDespacho}
              direcciones={direcciones}
              direccionId={direccionId}
              onElegirDireccion={setDireccionId}
              cargando={cargandoDirecciones}
              opciones={opciones}
              empresaId={empresaId}
              onElegirEmpresa={setEmpresaId}
              cargandoOpciones={cargandoOpciones}
              errorOpciones={errorOpciones}
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
                onClick={() => navigate(rutaVolver)}
                disabled={pagando}
                sx={{ width: 150, color: "#000", borderColor: "#000" }}
              >
                {idCotizacion ? "Volver" : "Volver al carrito"}
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