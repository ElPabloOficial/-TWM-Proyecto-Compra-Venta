// TransactionTableSection.jsx
import { useState } from "react";

export function TransactionTableSection({
  title = "Transactions",
  transactions = []
}) {
  const [searchTerm, setSearchTerm] = useState("");
  // Combined sort state: e.g., "code-asc", "date-desc", "amount-asc"
  const [sortOption, setSortOption] = useState("date-desc");

  // 1. Filter transactions based on the search input
  const filteredTransactions = transactions.filter((tx) =>
  tx.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  tx.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Parse the sort option into field and direction
  const [sortField, sortDirection] = sortOption.split("-");

  // 3. Sort the filtered transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Clean amount string for proper numeric comparison (e.g., "$120.50" -> 120.50)
    if (sortField === "amount") {
      aVal = parseFloat(aVal.replace(/[^0-9.-]+/g, ""));
      bVal = parseFloat(bVal.replace(/[^0-9.-]+/g, ""));
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleRowAction = (tx) => {
    alert(`Triggered action for transaction: ${tx.code}`);
  };

  return (
    <section className="transaction-section">
    <div className="table-header-controls">
    <h2>{title}</h2>

    {/* Controls Bar: Search Bar & Sort Dropdown */}
    <div className="controls-group">
    <input
    type="text"
    placeholder="Buscar ID o estado"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
    />

    <select
    className="sort-dropdown"
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    >
    <option value="date-desc">Fecha: Mas Reciente</option>
    <option value="date-asc">Fecha: Menos Reciente</option>
    <option value="amount-desc">Monto: Descendente</option>
    <option value="amount-asc">Monto: Ascendente</option>
    <option value="code-asc">Transacción: A-Z</option>
    <option value="code-desc">Transacción: Z-A</option>
    </select>
    </div>
    </div>

    {/* Main Data Table */}
    <div className="table-responsive">
    <table className="data-table">
    <thead>
    <tr>
    <th>Transacción</th>
    <th>Fecha</th>
    <th>Monto</th>
    <th>Estado</th>
    <th>Acción</th>
    </tr>
    </thead>
    <tbody>
    {sortedTransactions.length > 0 ? (
      sortedTransactions.map((tx) => (
        <tr key={tx.id || tx.code}>
        <td className="font-mono">{tx.code}</td>
        <td>{tx.date}</td>
        <td>{tx.amount}</td>
        <td>
        <span className={`status-badge ${tx.status.toLowerCase()}`}>
        {tx.status}
        </span>
        </td>
        <td>
        <button
        type="button"
        className="row-action-btn"
        onClick={() => handleRowAction(tx)}
        >
        Ver detalles
        </button>
        </td>
        </tr>
      ))
    ) : (
      <tr>
      <td colSpan="5" className="no-results">No transactions found.</td>
      </tr>
    )}
    </tbody>
    </table>
    </div>
    </section>
  );
}
