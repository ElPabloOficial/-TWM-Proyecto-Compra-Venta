// Pestañas de la pantalla de mensajes (Mensajes privados / Preguntas públicas).
// tabs: [{ id, etiqueta, contador }]. El contador (opcional) muestra lo pendiente en cada pestaña.
const MessageTabs = ({ tabs, activa, onCambiar }) => (
  <div className="msg-tabs" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={tab.id === activa}
        className={`msg-tab ${tab.id === activa ? "activa" : ""}`}
        onClick={() => onCambiar(tab.id)}
      >
        {tab.etiqueta}
        {tab.contador > 0 && <span className="msg-tab-badge">{tab.contador}</span>}
      </button>
    ))}
  </div>
);

export default MessageTabs;
