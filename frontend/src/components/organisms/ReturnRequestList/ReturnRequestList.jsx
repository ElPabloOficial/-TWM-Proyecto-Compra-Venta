import ReturnRequest from "../../molecules/ReturnRequest/ReturnRequest";

const ReturnRequestList = ({ requests, onStatusChange, actualizandoId }) => {
  if (requests.length === 0) {
    return <p style={{ color: "#777", fontSize: 14 }}>Todavía no tienes solicitudes de devolución.</p>;
  }

  return (
    <div className="ret-lista">
      {requests.map((request) => (
        <ReturnRequest
          key={request.id}
          {...request}
          onStatusChange={onStatusChange}
          actualizandoId={actualizandoId}
        />
      ))}
    </div>
  );
};

export default ReturnRequestList;
