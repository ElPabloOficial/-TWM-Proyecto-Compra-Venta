import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/organisms/Header/Header";
import ProductForm from "../../components/organisms/ProductForm/ProductForm";
import { useProductos } from "../../context/ProductContext";
import "../../styles/AddProduct.css";

const AddProductScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { productos, categorias, agregarProducto, actualizarProducto } = useProductos();

  // Si la ruta trae un id (/inventario/editar/:id) la pantalla funciona en modo edición
  const producto = id ? productos.find((p) => p.id === Number(id)) : null;
  const editando = Boolean(id);

  if (editando && !producto) {
    return <Navigate to="/inventario" replace />;
  }

  const guardar = (datos) => {
    if (editando) {
      actualizarProducto({ ...datos, id: producto.id });
    } else {
      agregarProducto(datos);
    }
    navigate("/inventario");
  };

  const titulo = editando ? "Editar Producto" : "Agregar Producto";

  return (
    <div className="addp-page">
      <Header />

      <div className="addp-content">
        <div className="addp-top">
          <nav className="addp-breadcrumb">
            <Link to="/inventario">Inventario</Link>
            <span className="sep">›</span>
            <span className="actual">{titulo}</span>
          </nav>

          <h1 className="addp-title">{titulo}</h1>
        </div>

        <ProductForm
          producto={producto}
          categorias={categorias}
          onGuardar={guardar}
          onCancelar={() => navigate("/inventario")}
        />
      </div>
    </div>
  );
};

export default AddProductScreen;