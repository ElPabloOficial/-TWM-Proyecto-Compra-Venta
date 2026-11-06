import { useState } from "react";

import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ReturnRequestList from "../../components/organisms/ReturnRequestList/ReturnRequestList";
import { useToast } from "../../context/ToastContext";

import "../../styles/Inventory.css";
import "../../styles/ReturnManagement.css";

// Estados de una devolución en la BD: "En Proceso" (pendiente de respuesta), "Aprobada" y "Rechazada".
const ReturnManagement = () => {
  const { mostrarToast } = useToast();

  // TEMPORAL: estas solicitudes son de ejemplo. Con el backend se cargan con GET /devoluciones
  // y el cambio de estado pasa a ser PUT /devoluciones/{id}/estado.
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
      status: "En Proceso",
    },
    {
      id: 2,
      product: "Mouse inalámbrico Logi",
      order: "#10398",
      customer: "Jorge Bravo",
      quantity: "2 unidades",
      price: "$29.980",
      reason: "No es lo que esperaba.",
      status: "Aprobada",
      refund:
        "Reembolso procesado el 18-09-2026 · $29.980 a tarjeta terminada en 4521",
    },
  ]);

  // Aprobar o rechazar una solicitud pendiente
  const handleStatusChange = (id, newStatus) => {
    const request = requests.find((item) => item.id === id);

    if (!request || request.status !== "En Proceso") {
      return;
    }

    // Actualizar la solicitud en pantalla
    setRequests((previousRequests) =>
      previousRequests.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    // SIMULACIÓN (solo frontend): con el backend esto es PUT /devoluciones/{id}/estado
    console.log({
      idSolicitud: request.id,
      pedido: request.order,
      producto: request.product,
      estadoAnterior: request.status,
      estadoNuevo: newStatus,
      fechaCambio: new Date().toLocaleString("es-CL"),
    });

    mostrarToast(newStatus === "Aprobada" ? "Devolución aprobada correctamente" : "Devolución rechazada correctamente");
  };

  // Estadísticas según los estados actuales
  const pendingCount = requests.filter((request) => request.status === "En Proceso").length;
  const approvedCount = requests.filter((request) => request.status === "Aprobada").length;

  return (
    <SellerTemplate>
      <div className="inv-head">
        <div>
          <h1 className="inv-title">Gestión de Devoluciones</h1>
          <div className="inv-subtitle">
            Revisa, aprueba o rechaza las solicitudes de devolución de tus clientes.
          </div>
        </div>
      </div>

      <div className="inv-stats">
        <StatCard titulo="Pendientes" valor={pendingCount} />
        <StatCard titulo="Aprobadas" valor={approvedCount} />
        {/* TEMPORAL: valor fijo; con el backend se calcula (devoluciones / ventas) */}
        <StatCard titulo="Tasa de devolución" valor="3,1%" />
      </div>

      <ReturnRequestList requests={requests} onStatusChange={handleStatusChange} />
    </SellerTemplate>
  );
};

export default ReturnManagement;
