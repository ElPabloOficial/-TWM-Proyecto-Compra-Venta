// TransHistoryScreen.jsx
//
// Transacciones del administrador: todas las ventas de la plataforma ("operaciones globales").
// Datos reales de la API (GET /admin/ventas). El vendedor ve las suyas en "Mis pedidos"
// y el cliente las suyas en "Mis compras".
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import ListPageSkeleton from "../../components/organisms/ListPageSkeleton/ListPageSkeleton";
import { TransactionTableSection } from "../../components/organisms/Transaction/TransactionTableSection";
import { listarVentas, obtenerResumenTransacciones } from "../../services/adminService";

import "../../styles/Inventory.css";
import "../../styles/Transaction.css";

const formatoPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

const TransHistoryScreen = () => {
  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState({ utilidadProyectada: 0, capitalReintegrado: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Sube al pedir "Reintentar" para volver a ejecutar la carga
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true; // evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta

    const cargar = async () => {
      try {
        const [datos, resumenFn] = await Promise.all([
          listarVentas(),
          obtenerResumenTransacciones().catch(() => ({ utilidadProyectada: 0, capitalReintegrado: 0 })),
        ]);
        if (activo) {
          setVentas(datos);
          setResumen(resumenFn);
        }
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = () => {
    setCargando(true);
    setError("");
    setIntento((n) => n + 1);
  };

  // Las ventas anuladas no suman al monto vendido
  const montoVendido = ventas
    .filter((v) => v.tipoEstado !== "anulada")
    .reduce((suma, v) => suma + v.total, 0);
  const completadas = ventas.filter((v) => v.tipoEstado === "completada").length;
  const anuladas = ventas.filter((v) => v.tipoEstado === "anulada").length;

  return (
    <AdminTemplate>
      <Box sx={{ marginBottom: 3 }}>
        <Box component="h1" sx={{ margin: 0, fontSize: 24 }}>
          Transacciones
        </Box>
        <Box sx={{ fontSize: 13, marginTop: 0.5, color: "#666" }}>
          Todas las ventas registradas en la plataforma
        </Box>
      </Box>

      {cargando ? (
        <ListPageSkeleton columnas={7} filas={8} tarjetas={4} />
      ) : error ? (
        <ErrorState titulo="No pudimos cargar las transacciones" detalle={error} onReintentar={reintentar} />
      ) : (
        <>
          <div className="inv-stats">
            <StatCard titulo="Ventas registradas" valor={ventas.length} />
            <StatCard titulo="Monto vendido" valor={formatoPrecio(montoVendido)} />
            <StatCard titulo="Completadas" valor={completadas} />
            <StatCard titulo="Anuladas" valor={anuladas} />
            <StatCard titulo="Utilidad proyectada (5%)" valor={formatoPrecio(resumen.utilidadProyectada)} />
            <StatCard titulo="Reintegrado devoluciones" valor={formatoPrecio(resumen.capitalReintegrado)} />
          </div>

          <div className="inv-panel">
            <TransactionTableSection title="Historial de transacciones" transactions={ventas} />
          </div>
        </>
      )}
    </AdminTemplate>
  );
};

export default TransHistoryScreen;
