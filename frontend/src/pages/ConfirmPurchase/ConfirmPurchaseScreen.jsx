import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import ConfirmPurchaseTools from "../../components/molecules/ConfirmPurchaseTools/ConfirmPurchaseTools";
import ConfirmPurchaseTable from "../../components/organisms/ConfirmPurchaseTable/ConfirmPurchaseTable";

const IVA = 0.19;
const ROJO = "#EC3333";
const formatearPrecio = (numero) => `$${numero.toLocaleString("es-CL")}`;
//para las pruebas
const items = [
  { id: 1, nombre: 'Laptop Lenovo 14" gris', vendedor: "TecnoOsorno", cantidad: 1, precio: 389990 },
];

const direccion = "Av. Los Carrera 1234, depto 302 · Osorno, Región de Los Lagos";

const opcionesEnvio = [
  { id: "estandar", nombre: "Envío estándar a Osorno", detalle: "Llega en 1-2 días hábiles", precio: 2500 },
];

const mediosPago = [
  { id: "tarjeta", label: "Tarjeta •••• 4521" },
  { id: "transferencia", label: "Transferencia" },
];

const ConfirmPurchaseScreen = () => {
  const navigate = useNavigate();
  const [opcionEnvio, setOpcionEnvio] = useState("estandar");
  const [medioPago, setMedioPago] = useState("tarjeta");

  const envio = opcionesEnvio.find((o) => o.id === opcionEnvio)?.precio ?? 0;//el precio
  const bruto = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const neto = Math.round(bruto / (1 + IVA));
  const iva = bruto - neto;
  const total = bruto + envio;

  const resumen = { neto, iva, envio, total };
  const puedePagar = opcionEnvio !== "" && medioPago !== "";

  const cambiarDireccion = () => {
    //Aqui se debe seleccionar o modificar la direccion...
  };

  const pagar = () => {
    console.log({ items, opcionEnvio, medioPago, ...resumen });
  };

  return (
    <AdminTemplate>
      <Box sx={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 2 }}>
        <Breadcrumbs separator="›" sx={{ fontSize: 13 }}>
          <Box component="span">Carrito</Box>
          <Box component="span" sx={{ color: ROJO }}>Confirmar compra</Box>
        </Breadcrumbs>

        <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
          Confirmar compra
        </Box>

        <ConfirmPurchaseTable items={items} />

        <ConfirmPurchaseTools
          direccion={direccion}
          onCambiarDireccion={cambiarDireccion}
          opcionesEnvio={opcionesEnvio}
          opcionEnvio={opcionEnvio}
          onOpcionEnvio={setOpcionEnvio}
        />

        <ConfirmPurchaseTable
          resumen={resumen}
          mediosPago={mediosPago}
          medioPago={medioPago}
          onMedioPago={setMedioPago}
        />

        <Box sx={{ display: "flex", gap: 3, marginTop: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ width: 150, color: "#000", borderColor: "#000" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!puedePagar}
            onClick={pagar}
            sx={{ width: 240, backgroundColor: ROJO, "&:hover": { backgroundColor: "#D42B2B" } }}
          >
            Pagar {formatearPrecio(total)}
          </Button>
        </Box>
      </Box>
    </AdminTemplate>
  );
};

export default ConfirmPurchaseScreen;
