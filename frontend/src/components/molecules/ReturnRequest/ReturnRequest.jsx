import CustomButton from "../../atoms/Button/CustomButton";

// Estados de la BD -> cómo se muestran. "En Proceso" es una solicitud que espera respuesta del vendedor.
const ESTADOS = {
  "En Proceso": { etiqueta: "Pendiente", clase: "pendiente" },
  Aprobada: { etiqueta: "Aprobada", clase: "aprobada" },
  Rechazada: { etiqueta: "Rechazada", clase: "rechazada" },
};

const ReturnRequest = ({
  id,
  product,
  order,
  customer,
  quantity,
  price,
  reason,
  status,
  refund,
  image,
  onStatusChange,
  actualizandoId,
}) => {
  const procesando = actualizandoId === id;
  const estado = ESTADOS[status] ?? { etiqueta: status, clase: "pendiente" };

  return (
    <article className="ret-tarjeta">
      <div className="ret-cabecera">
        {/* Imagen de evidencia */}
        <div className="ret-evidencia">
          {image ? (
            <img
              src={image}
              alt="Evidencia de devolución"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            "Sin evidencia"
          )}
        </div>

        {/* Información */}
        <div className="ret-info">
          <h2 className="ret-producto">{product}</h2>
          <p className="ret-detalle">
            Pedido {order} · {customer} · {quantity} · {price}
          </p>
        </div>

        <span className={`ret-estado ${estado.clase}`}>{estado.etiqueta}</span>
      </div>

      <p className="ret-motivo">Motivo: {reason}</p>

      {/* Solo se puede aprobar o rechazar lo que está pendiente */}
      {status === "En Proceso" && (
        <div className="ret-botones">
          <CustomButton variant="approve" disabled={procesando} onClick={() => onStatusChange(id, "Aprobada")}>
            {procesando ? "Guardando..." : "Aprobar"}
          </CustomButton>

          <CustomButton variant="reject" disabled={procesando} onClick={() => onStatusChange(id, "Rechazada")}>
            {procesando ? "Guardando..." : "Rechazar"}
          </CustomButton>
        </div>
      )}

      {refund && <p className="ret-reembolso">{refund}</p>}
    </article>
  );
};

export default ReturnRequest;
