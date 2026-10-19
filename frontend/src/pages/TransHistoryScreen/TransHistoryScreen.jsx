//TransHistoryScreen.jsx
import Header from "../../components/organisms/Header/Header";
import CustomButton from '../../components/atoms/Button/CustomButton';
import AddIcon from '@mui/icons-material/Add';

import { useState } from "react";
import { TransactionTableSection } from "../../components/organisms/Transaction/TransactionTableSection";

import "../../styles/Transaction.css";

const TransHistoryScreen = () => {
	const [transactions, setTransactions] = useState([
		{ id: 1, code: "TXN-98412", date: "2026-06-01", amount: "$1,240.00", status: "Completed" },
		{ id: 2, code: "TXN-98413", date: "2026-06-03", amount: "$89.50", status: "Pending" },
		{ id: 3, code: "TXN-98414", date: "2026-06-05", amount: "$420.90", status: "Completed" },
	]);

	const [sortAscending, setSortAscending] = useState(true);

	// Handle row-specific action button click
	const handleRowAction = (transaction) => {
		alert(`Triggered action for transaction: ${transaction.code}`);
	};

	// Handle sorting/ordering
	const handleSortClick = () => {
		const sorted = [...transactions].sort((a, b) => {
			return sortAscending ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
		});
		setTransactions(sorted);
		setSortAscending(!sortAscending);
	};

	return (
<>
<Header />

<div className="page-container">
<h1>Historial de transacciones</h1>

<TransactionTableSection
title="Transacciones recientes: 12"
transactions={transactions}
onSortClick={handleSortClick}
onRowAction={handleRowAction}
/>
</div>

</>
);
};

export default TransHistoryScreen;
