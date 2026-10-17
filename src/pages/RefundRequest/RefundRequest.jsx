import { useState } from "react";
import { Box } from "@mui/material";

import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";
import CustomButton from "../../components/atoms/Button/CustomButton";
import CustomDialog from "../../components/atoms/CustomDialog/CustomDialog";

const RefundRequest = () => {
  const [reason, setReason] = useState("");
  const [preference, setPreference] = useState("refund");
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // Datos de ejemplo
  const product = {
    order: "#10452",
    purchaseDate: "12-09-2026",
    seller: "TecnoOsorno",
    name: 'Laptop Lenovo 14". gris',
    customer: "María Soto",
    quantity: 1,
    price: 389990,
    paymentMethod: "Tarjeta terminada en 4521",
  };

  const reasons = [
    "Producto defectuoso",
    "No es lo que esperaba",
    "Llegó incompleto",
    "Producto equivocado",
    "Otro",
  ];

  const money = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!reason) {
      setDialogMessage("Selecciona un motivo para la devolución.");
      setOpenDialog(true);
      return;
    }

    console.log({
      order: product.order,
      reason,
      preference,
      details,
      evidence,
    });
  };

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
            accept="image/*"
            onChange={(event) =>
              setEvidence(event.target.files?.[0] ?? null)
            }
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

          {evidence && (
            <Box
              component="p"
              sx={{ fontSize: "10px", color: "#666" }}
            >
              Archivo seleccionado: {evidence.name}
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
        title="Solicitud incompleta"
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