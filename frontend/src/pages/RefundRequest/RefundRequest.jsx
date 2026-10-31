import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";

import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";
import CustomButton from "../../components/atoms/Button/CustomButton";
import CustomDialog from "../../components/atoms/CustomDialog/CustomDialog";

import { returnService } from "../../services/returnService";
import { ventaService } from "../../services/ventaService";

const RefundRequest = () => {
  const [reason, setReason] = useState("");
  const [preference, setPreference] = useState("refund");
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("Solicitud incompleta");

  const location = useLocation();

  const {
    id_venta,
    id_producto,
    cantidad,
  } = location.state || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reasons = [
    "Producto defectuoso",
    "No es lo que esperaba",
    "Llegó incompleto",
    "Producto equivocado",
    "Otro",
  ];

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatosPermitidos.includes(file.type)) {
      setDialogTitle("Formato no permitido");
      setDialogMessage("Selecciona una imagen JPG, PNG o WEBP.");
      setOpenDialog(true);
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDialogTitle("Imagen demasiado grande");
      setDialogMessage("La imagen no puede superar los 5 MB.");
      setOpenDialog(true);
      event.target.value = "";
      return;
    }

    setEvidence(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const compras = await ventaService.getMisCompras();

        // Buscar la venta seleccionada
        const venta = compras.find(
          (item) => item.id_venta === id_venta
        );

        if (!venta) {
          throw new Error("No se encontró la compra.");
        }

        // Buscar el producto dentro de la venta
        const producto = venta.productos.find(
          (item) => item.id === id_producto
        );

        if (!producto) {
          throw new Error("No se encontró el producto en la compra.");
        }

        setProduct({
          order: venta.id_venta,
          purchaseDate: new Date(venta.fecha).toLocaleDateString("es-CL"),
          name: producto.nombre,
          quantity: cantidad,
          price: producto.cantidad > 0
            ? producto.total / producto.cantidad * cantidad
            : 0,
          image: producto.imagen,
        });

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!id_venta || !id_producto || !cantidad) {
      setError("No se recibieron los datos de la compra.");
      setLoading(false);
      return;
    }

    cargarProducto();
  }, [id_venta, id_producto, cantidad]);

  const money = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validar motivo
    if (!reason) {
      setDialogTitle("Solicitud incompleta");
      setDialogMessage("Selecciona un motivo para la devolución.");
      setOpenDialog(true);
      return;
    }

    try {
      const resultado = await returnService.crearDevolucion(
        id_venta,
        id_producto,
        cantidad,
        reason,
        preference === "refund" ? "Reembolso" : "Cambio",
        evidence
      );

      // Solicitud exitosa
      setDialogTitle("¡Solicitud enviada!");
      setDialogMessage(
        resultado.message || "Devolución solicitada correctamente."
      );
      setOpenDialog(true);

    } catch (error) {
      // Error al enviar
      setDialogTitle("Error en la solicitud");
      setDialogMessage(
        error.message || "No se pudo solicitar la devolución."
      );
      setOpenDialog(true);
    }
  };

  if (loading) {
    return <Box sx={{ padding: 4 }}>Cargando producto...</Box>;
  }
  
  if (error || !product) {
    return <Box sx={{ padding: 4 }}>{error || "No se encontró el producto."}</Box>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      <Header />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          width: "100%",
          padding: { xs: "20px", md: "20px 44px" },
          boxSizing: "border-box",
        }}
      >
        {/* Título */}
        <Box
          component="h1"
          sx={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          Solicitar devolución
        </Box>

        <Box
          component="p"
          sx={{
            margin: "2px 0 12px",
            fontSize: "11px",
            color: "#666",
          }}
        >
          Pedido {product.order} · Comprado el {product.purchaseDate} a{" "}
          {product.seller}
        </Box>

        {/* Producto */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "555px",
            border: "1px solid #e5e5e5",
            borderRadius: "5px",
            padding: "7px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: "56px",
              height: "56px",
              backgroundColor: "#ddd",
              marginRight: "13px",
              flexShrink: 0,
            }}
          />

          <Box>
            <Box
              component="h2"
              sx={{
                margin: "0 0 3px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {product.name}
            </Box>

            <Box
              component="p"
              sx={{
                margin: 0,
                fontSize: "10px",
                color: "#666",
              }}
            >
              Pedido {product.order} · {product.customer} ·{" "}
              {product.quantity} unidad · {money(product.price)}
            </Box>
          </Box>
        </Box>

        {/* Motivo de devolución */}
        <Box sx={{ marginTop: "16px", maxWidth: "560px" }}>
          <Box
            component="h3"
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              margin: "0 0 8px",
            }}
          >
            Motivo de la devolución
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {reasons.map((item) => {
              const selected = reason === item;

              return (
                <Box
                  key={item}
                  component="button"
                  type="button"
                  onClick={() => setReason(item)}
                  sx={{
                    padding: "6px 10px",
                    border: "1px solid",
                    borderColor: selected ? "#EC3333" : "#999",
                    borderRadius: "4px",
                    backgroundColor: selected ? "#fff0f0" : "#fff",
                    color: selected ? "#EC3333" : "#333",
                    fontSize: "10px",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#EC3333",
                    },
                  }}
                >
                  {item}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Preferencia */}
        <Box sx={{ marginTop: "20px", maxWidth: "560px" }}>
          <Box
            component="h3"
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              margin: "0 0 8px",
            }}
          >
            ¿Qué prefieres?
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Reembolso */}
            <Box
              component="button"
              type="button"
              onClick={() => setPreference("refund")}
              sx={{
                flex: "1 1 220px",
                minHeight: "65px",
                padding: "10px",
                textAlign: "left",
                border: "1px solid",
                borderColor:
                  preference === "refund" ? "#EC3333" : "#999",
                borderRadius: "4px",
                backgroundColor:
                  preference === "refund" ? "#fff0f0" : "#fff",
                cursor: "pointer",
              }}
            >
              <Box
                component="strong"
                sx={{ display: "block", fontSize: "11px" }}
              >
                Reembolso de dinero
              </Box>

              <Box
                component="span"
                sx={{
                  display: "block",
                  marginTop: "5px",
                  fontSize: "10px",
                  color: "#666",
                }}
              >
                Se devuelve al mismo medio de pago utilizado en la compra.
              </Box>
            </Box>

            {/* Cambio */}
            <Box
              component="button"
              type="button"
              onClick={() => setPreference("exchange")}
              sx={{
                flex: "1 1 220px",
                minHeight: "65px",
                padding: "10px",
                textAlign: "left",
                border: "1px solid",
                borderColor:
                  preference === "exchange" ? "#EC3333" : "#999",
                borderRadius: "4px",
                backgroundColor:
                  preference === "exchange" ? "#fff0f0" : "#fff",
                cursor: "pointer",
              }}
            >
              <Box
                component="strong"
                sx={{ display: "block", fontSize: "11px" }}
              >
                Cambio de producto
              </Box>

              <Box
                component="span"
                sx={{
                  display: "block",
                  marginTop: "5px",
                  fontSize: "10px",
                  color: "#666",
                }}
              >
                Cambia por otro producto del mismo emprendedor.
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Resumen */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "530px",
            marginTop: "18px",
            padding: "12px",
            border: "1px solid #EC3333",
            borderRadius: "4px",
            backgroundColor: "#fff5f5",
            boxSizing: "border-box",
          }}
        >
          <Box
            component="strong"
            sx={{
              display: "block",
              fontSize: "11px",
              marginBottom: "10px",
            }}
          >
            {preference === "refund"
              ? "Resumen del reembolso"
              : "Resumen del cambio"}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              fontSize: "10px",
              marginBottom: "7px",
            }}
          >
            <span>
              {preference === "refund"
                ? "Monto a reembolsar"
                : "Valor del producto actual"}
            </span>

            <strong>{money(product.price)}</strong>
          </Box>

          {preference === "refund" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "10px",
              }}
            >
              <span>Medio de pago original</span>
              <strong>{product.paymentMethod}</strong>
            </Box>
          )}
        </Box>

        {/* Detalle */}
        <Box sx={{ marginTop: "18px", maxWidth: "530px" }}>
          <Box
            component="label"
            htmlFor="return-details"
            sx={{
              display: "block",
              fontSize: "11px",
              marginBottom: "6px",
            }}
          >
            Detalle (opcional)
          </Box>

          <Box
            component="textarea"
            id="return-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Cuéntanos qué ocurrió con el producto..."
            rows={3}
            sx={{
              width: "100%",
              padding: "8px",
              border: "1px solid #999",
              borderRadius: "4px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              fontSize: "11px",
              resize: "vertical",
              outlineColor: "#EC3333",
            }}
          />
        </Box>

        {/* Evidencia */}
        <Box sx={{ marginTop: "14px" }}>
          <Box
            component="label"
            htmlFor="return-evidence"
            sx={{
              display: "block",
              fontSize: "11px",
              marginBottom: "6px",
            }}
          >
            Adjuntar evidencia (opcional)
          </Box>
          
          <Box
            component="input"
            id="return-evidence"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            sx={{
              width: "100%",
              maxWidth: "350px",
              fontSize: "11px",
              "&::file-selector-button": {
                padding: "7px 10px",
                marginRight: "10px",
                border: "1px solid #999",
                borderRadius: "4px",
                backgroundColor: "#eee",
                cursor: "pointer",
              },
            }}
          />

          {/* Previsualización */}
          {previewImage && (
            <Box sx={{ marginTop: "12px" }}>
              <Box
                component="p"
                sx={{
                  fontSize: "11px",
                  color: "#666",
                  marginBottom: "6px",
                }}
              >
                Imagen seleccionada:
              </Box>
              
              <Box
                component="img"
                src={previewImage}
                alt="Evidencia de devolución"
                sx={{
                  width: "150px",
                  height: "120px",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              />

              <Box
                component="p"
                sx={{
                  fontSize: "10px",
                  color: "#666",
                }}
              >
                {evidence.name}
              </Box>
            </Box>
          )}
        </Box>

        {/* Acciones */}
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <CustomButton
            variant="secondary"
            type="button"
            onClick={() => window.history.back()}
            sx={{
              minWidth: "110px",
              fontSize: "11px",
              borderWidth: "1px",
            }}
          >
            Cancelar
          </CustomButton>

          <CustomButton
            variant="primary"
            type="submit"
            sx={{
              minWidth: "140px",
              fontSize: "11px",
            }}
          >
            Enviar solicitud
          </CustomButton>
        </Box>
      </Box>

      <CustomDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={dialogTitle}
        maxWidth="xs"
        actions={
        <CustomButton
          variant="primary"
          onClick={() => setOpenDialog(false)}
        >
          Entendido
        </CustomButton>
        }
      >
        <Box sx={{ fontSize: "15px" }}>
          {dialogMessage}
        </Box>
      </CustomDialog>

      <Footer />
    </Box>
  );
};

export default RefundRequest;