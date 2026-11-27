import { useEffect, useState } from "react";

import SellerTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import StatCard from "../../components/molecules/StatCard/StatCard";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import ReturnRequestList from "../../components/organisms/ReturnRequestList/ReturnRequestList";
import { useToast } from "../../context/ToastContext";
import { devolucionesService, listarSolicitudesDeMisVentas } from "../../services/returnsService";

import "../../styles/Inventory.css";
import "../../styles/ReturnManagement.css";

// Solicitudes de devolución de los clientes del vendedor.
//   GET /devoluciones/vendedor      -> lista y tasa de devolución
//   PUT /devoluciones/{id}/estado   -> aprobar o rechazar (el backend calcula el monto a reembolsar)
// Estados en la BD: "En Proceso" (pendiente de respuesta), "Aprobada" y "Rechazada".

const POR_PAGINA = 6;

const ReturnManagement = () => {
  const { mostrarToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [tasa, setTasa] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [actualizandoId, setActualizandoId] = useState(null); // solicitud que se está guardando
  const [pagina, setPagina] = useState(1);

  // Carga las solicitudes desde la API
  useEffect(() => {
    let activo = true;

    setErrorCarga("");
    listarSolicitudesDeMisVentas()
      .then(({ solicitudes, tasaDevolucion }) => {
        if (!activo) return;
        setRequests(solicitudes);
        setTasa(tasaDevolucion);
      })
      .catch((e) => {
        if (activo) setErrorCarga(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [recarga]);

  // Aprobar o rechazar una solicitud pendiente
  const handleStatusChange = async (id, newStatus) => {
    const request = requests.find((item) => item.id === id);

    if (!request || request.status !== "En Proceso" || actualizandoId) {
      return;
    }

    // Requisito del proyecto: se muestra en la consola lo que se envía a la API
    /* console.log("[Devoluciones] Cambiar estado:", {
      idSolicitud: request.id,
      pedido: request.order,
      producto: request.product,
      estadoAnterior: request.status,
      estadoNuevo: newStatus,
    }); */

    setActualizandoId(id);
    try {
      // El backend calcula el monto a reembolsar y la fecha de resolución
      await devolucionesService.actualizarEstado(id, newStatus);
      setRecarga((n) => n + 1); // se vuelve a pedir la lista para ver el monto y la fecha reales
      mostrarToast(newStatus === "Aprobada" ? "Devolución aprobada correctamente" : "Devolución rechazada correctamente");
    } catch (e) {
      mostrarToast(e.message, "error");
    } finally {
      setActualizandoId(null);
    }
  };

  // Estadísticas según los estados actuales
  const pendingCount = requests.filter((request) => request.status === "En Proceso").length;
  const approvedCount = requests.filter((request) => request.status === "Aprobada").length;

  // ---------- Paginación ----------
  const totalPaginas = Math.max(1, Math.ceil(requests.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = requests.slice(inicio, inicio + POR_PAGINA);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const desde = requests.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + visibles.length;

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

      {cargando ? (
        <p role="status">Cargando devoluciones...</p>
      ) : errorCarga ? (
        <ErrorState
          titulo="No pudimos cargar las devoluciones"
          detalle={errorCarga}
          onReintentar={() => {
            setCargando(true);
            setRecarga((n) => n + 1);
          }}
        />
      ) : (
        <>
          <div className="inv-stats">
            <StatCard titulo="Pendientes" valor={pendingCount} />
            <StatCard titulo="Aprobadas" valor={approvedCount} />
            <StatCard titulo="Tasa de devolución" valor={`${tasa.toLocaleString("es-CL")}%`} />
          </div>

          <ReturnRequestList requests={visibles} onStatusChange={handleStatusChange} actualizandoId={actualizandoId} />

          {requests.length > POR_PAGINA && (
            <div className="inv-footer">
              <div>
                Mostrando {desde}-{hasta} de {requests.length} solicitudes
              </div>

              <div className="inv-pagination">
                <button type="button" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>
                  ‹
                </button>
                {paginas.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === paginaActual ? "activa" : ""}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPagina(paginaActual + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </SellerTemplate>
  );
};

export default ReturnManagement;
