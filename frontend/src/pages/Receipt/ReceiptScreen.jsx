import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { DetailListSection } from "../../components/organisms/Receipt/DetailListSection";
import { FinancialTableSection } from "../../components/organisms/Receipt/FinancialTableSection";
import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { authService } from "../../services/authService";
import { ventaService } from "../../services/ventaService";
import { adaptarBoleta, descargarBoletaPdf } from "../../services/boletaPdf";

import "../../styles/Receipt.css";

const pesos = (n) => `$${Number(n).toLocaleString("es-CL")}`;

const fechaLarga = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" }) : "-";

const hora = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false }) : "-";

// "Tarjeta de crédito · terminada en 4521" / "Transferencia · código 884201"
const textoPago = (pago) => {
  if (!pago.medio) return "No registrado";
  if (pago.ult4digitos) return `${pago.medio} · terminada en ${pago.ult4digitos}`;
  if (pago.codigoTransferencia) return `${pago.medio} · código ${pago.codigoTransferencia}`;
  return pago.medio;
};

// Boleta de una compra (/boleta/:id). Se puede ver aquí y descargar en PDF.
export default function ReceiptScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [boleta, setBoleta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorPdf, setErrorPdf] = useState("");
  // Sube al pedir "Reintentar" para volver a ejecutar la carga
  const [intento, setIntento] = useState(0);

  const haySesion = Boolean(authService.getCurrentUser());

  useEffect(() => {
    if (!haySesion) return;
    let activo = true; // evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta

    const cargar = async () => {
      try {
        const detalle = await ventaService.getDetalle(id);
        if (activo) setBoleta(adaptarBoleta(detalle));
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
  }, [id, intento, haySesion]);

  const reintentar = () => {
    setCargando(true);
    setError("");
    setIntento((n) => n + 1);
  };

  const descargar = () => {
    try {
      setErrorPdf("");
      descargarBoletaPdf(boleta);
    } catch (e) {
      setErrorPdf(`No se pudo generar el PDF: ${e.message}`);
    }
  };

  if (!haySesion) return <Navigate to="/login" replace />;

  return (
    <>
      <Header />
      <div className="page-container">
        {cargando ? (
          <p>Cargando boleta...</p>
        ) : error ? (
          <ErrorState titulo="No pudimos cargar la boleta" detalle={error} onReintentar={reintentar} />
        ) : (
          <>
            <h1 className="page-title">Boleta N° {boleta.numero}</h1>

            <div className="info-row">
              <div className="card-section">
                <DetailListSection
                  title="Boleta de venta"
                  items={[
                    { label: "Fecha de emisión:", value: fechaLarga(boleta.fecha) },
                    { label: "Hora de la transacción", value: hora(boleta.fecha) },
                    { label: "Medio de pago", value: textoPago(boleta.pago) },
                    { label: "Estado", value: boleta.estado || "-" },
                    { label: "Número de orden", value: boleta.numero },
                  ]}
                />
              </div>

              <div className="card-section">
                <DetailListSection
                  title="Datos del Vendedor"
                  items={[
                    { label: "Nombre:", value: boleta.vendedor.nombre || "-" },
                    { label: "RUT:", value: boleta.vendedor.rut || "-" },
                  ]}
                />
              </div>
            </div>

            <div className="card-section">
              <FinancialTableSection
                title="Detalle del Comprobante"
                headers={["Producto / Servicio", "Precio Unitario", "Cantidad", "Subtotal"]}
                rows={boleta.items.map((i) => [
                  i.tipo === "servicio" ? `${i.nombre} (servicio)` : i.nombre,
                  pesos(i.precioUnitario),
                  String(i.cantidad),
                  pesos(i.subtotal),
                ])}
                summaryPairs={[
                  { label: "Valor neto (sin IVA)", value: pesos(boleta.neto) },
                  { label: `IVA (${boleta.ivaPorcentaje}%)`, value: pesos(boleta.iva) },
                  { label: "Total", value: pesos(boleta.total) },
                ]}
              />
            </div>

            {errorPdf && <p style={{ color: "#b91c1c" }}>{errorPdf}</p>}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <CustomButton type="button" className="submit-btn" onClick={descargar}>
                Descargar PDF
              </CustomButton>
              <CustomButton type="button" variant="secondary" onClick={() => navigate("/historial")}>
                Volver a mis compras
              </CustomButton>
            </div>
          </>
        )}
      </div>
    </>
  );
}
