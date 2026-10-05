import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/organisms/Header/Header";
import ProductForm from "../../components/organisms/ProductForm/ProductForm";
import { useProductos } from "../../context/ProductContext";
import "../../styles/AddProduct.css";

const AddProductScreen = () => {
  const navigate = useNavigate();
  const { categorias, agregarProducto } = useProductos();

  const guardar = (datos) => {
    // SIMULACIÓN (solo frontend): muestra en la consola los datos capturados al crear.
    // Con el backend esto se reemplaza por la llamada a la API (POST).
    console.log("[Productos] Crear producto:", datos);
    agregarProducto(datos);
    navigate("/inventario");
  };

  return (
    <div className="addp-page">
      <Header />

      <div className="addp-content">
        <div className="addp-top">
          <nav className="addp-breadcrumb">
            <Link to="/inventario">Inventario</Link>
            <span className="sep">›</span>
            <span className="actual">Agregar Producto</span>
          </nav>

          <h1 className="addp-title">Agregar Producto</h1>
        </div>

        <ProductForm
          categorias={categorias}
          onGuardar={guardar}
          onCancelar={() => navigate("/inventario")}
        />
      </div>
    </div>
  );
};

export default AddProductScreen;