export function DetailListSection({ title, items = [] }) {
  return (
    <section className="detail-section">
    <h2>{title}</h2>
    <ul className="pair-list">
    {items.map((item, index) => (
      <li key={index} className="pair-item">
      <span className="label">{item.label}</span>
      <span className="value">{item.value}</span>
      </li>
    ))}
    </ul>
    </section>
  );
}
