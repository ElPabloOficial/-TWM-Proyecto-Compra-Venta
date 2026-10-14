export function FinancialTableSection({ title, headers = [], rows = [], summaryPairs = [] }) {
  const totalColumns = headers.length;
  const labelSpan = totalColumns - 2 >= 1 ? totalColumns - 2 : 1;

  return (
    <section className="financial-section">
    <h2>{title}</h2>

    <div className="table-responsive">
    <table className="financial-table">
    {/* Table Header */}
    <thead>
    <tr>
    {headers.map((header, index) => (
      <th key={index}>{header}</th>
    ))}
    </tr>
    </thead>

    {/* Table Body Rows */}
    <tbody>
    {rows.map((row, rowIndex) => (
      <tr key={rowIndex}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
      </tr>
    ))}
    </tbody>

    {/* Footer Summary (Natively aligned with the final columns above) */}
    {summaryPairs.length > 0 && (
      <tfoot>
      {summaryPairs.map((pair, index) => {
        const isTotal = pair.label.toLowerCase().includes("total");
        return (
          <tr key={index} className={isTotal ? "total-row" : ""}>
          <td colSpan={labelSpan} className="empty-spacer"></td>
          <td className="summary-label">{pair.label}:</td>
          <td className="summary-value">{pair.value}</td>
          </tr>
        );
      })}
      </tfoot>
    )}
    </table>
    </div>
    </section>
  );
}
