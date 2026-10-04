const StatCard = ({ titulo, valor }) => {
  return (
    <div className="inv-stat">
      <div className="inv-stat-title">{titulo}</div>
      <div className="inv-stat-value">{valor}</div>
    </div>
  );
};

export default StatCard;