import { useNavigate } from "react-router-dom";
import { DetailListSection } from "../../components/organisms/Receipt/DetailListSection";
import { FinancialTableSection } from "../../components/organisms/Receipt/FinancialTableSection";
import Header from "../../components/organisms/Header/Header";
import CustomButton from '../../components/atoms/Button/CustomButton';
import AddIcon from '@mui/icons-material/Add';

import "../../styles/Receipt.css";

export default function ReceiptScreen() {
  return (
    <>
    <Header />
    <div className="page-container">


    <h1 className="page-title">Boleta #001</h1>


    <div className="info-row">
    <div className="card-section">
    <DetailListSection
    title="Boleta de venta"
    items={[
      { label: "Fecha de emisión:", value: "02 de septiembre de 2026" },
      { label: "Metodo de Pago", value: "Tarjeta **** 4521" },
      { label: "Hora Transacción", value: "11:05:40" },
      { label: "Numero de Orden", value: "42315487" }
    ]}
    />
    </div>

    <div className="card-section">
    <DetailListSection
    title="Datos del Vendedor"
    items={[
      { label: "Nombre:", value: "Tech Solutions SpA" },
      { label: "RUT:", value: "76.543.210-K" }
    ]}
    />
    </div>
    </div>

    <div className="card-section">
    <FinancialTableSection
    title="Detalle del Comprobante"
    headers={["Producto / Servicio", "Precio Unitario", "Cantidad", "Subtotal"]}
    rows={[
      ["Laptop Pro X", "$899.990", "1", "$899.990"],
      ["Mouse Ergonómico", "$45.990", "2", "$91.980"],
      ["Teclado Mecánico RGB", "$79.990", "1","$79.990"],
    ]}
    summaryPairs={[
      { label: "Subtotal", value: "$1.071.960" },
      { label: "IVA (19%)", value: "$203.672" },
          { label: "Shipping", value: "$2.500" },
          { label: "Total", value: "$1.278.132" }
    ]}
    />
    </div>

    <CustomButton type="button" className="submit-btn">Descargar PDF</CustomButton>
    </div>
    </>
  );
}
