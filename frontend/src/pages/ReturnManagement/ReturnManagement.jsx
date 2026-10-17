import { useState } from "react";
import { Box } from "@mui/material";

import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";

import ReturnStatCard from "../../components/molecules/ReturnStatCard/ReturnStatCard";
import ReturnRequestList from "../../components/organisms/ReturnRequestList/ReturnRequestList";

const ReturnManagement = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      product: 'Laptop Lenovo 14". gris',
      order: "#10452",
      customer: "María Soto",
      quantity: "1 unidad",
      price: "$389.990",
      reason:
        'Producto defectuoso - "La pantalla presenta líneas verticales desde el primer encendido."',
      status: "Pendiente",
    },
    {
      id: 2,
      product: "Mouse inalámbrico Logi",
      order: "#10398",
      customer: "Jorge Bravo",
      quantity: "2 unidades",
      price: "$29.980",
      reason: "No es lo que esperaba.",
      status: "Aprobado",
      refund:
        "Reembolso procesado el 18-09-2026 · $29.980 a tarjeta terminada en 4521",
    },
  ]);

  // Cambiar el estado de una solicitud
  const handleStatusChange = (id, newStatus) => {
    const request = requests.find((item) => item.id === id);

    if (!request || request.status !== "Pendiente") {
      return;
    }

    const changeDate = new Date().toLocaleString("es-CL");

    // Actualizar la solicitud en pantalla
    setRequests((previousRequests) =>
      previousRequests.map((item) =>
        item.id === id
          ? { ...item, status: newStatus }
          : item
      )
    );

    // Registrar los datos del cambio
    console.log({
      idSolicitud: request.id,
      pedido: request.order,
      producto: request.product,
      precio: request.price,
      estadoAnterior: request.status,
      estadoNuevo: newStatus,
      fechaCambio: changeDate,
    });
  };

  // Calcular estadísticas según los estados actuales
  const pendingCount = requests.filter(
    (request) => request.status === "Pendiente"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Aprobado"
  ).length;

  return (
    <SellerTemplate>
      <Box
        sx={{
          width: "100%",
          padding: "20px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Título */}
        <Box sx={{ marginBottom: "20px" }}>
          <Box
            component="h1"
            sx={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            Gestión de devoluciones
          </Box>

          <Box
            component="p"
            sx={{
              margin: "3px 0 0",
              fontSize: "11px",
              color: "#777",
            }}
          >
            Revisa, aprueba o rechaza las solicitudes de devolución de tus
            clientes.
          </Box>
        </Box>

        {/* Estadísticas */}
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <ReturnStatCard
            title="Pendientes"
            value={String(pendingCount)}
          />

          <ReturnStatCard
            title="Aprobadas"
            value={String(approvedCount)}
          />

          <ReturnStatCard
            title="Tasa de devolución"
            value="3,1%"
          />
        </Box>

        {/* Lista de solicitudes */}
        <ReturnRequestList
          requests={requests}
          onStatusChange={handleStatusChange}
        />
      </Box>
    </SellerTemplate>
  );
};

export default ReturnManagement;