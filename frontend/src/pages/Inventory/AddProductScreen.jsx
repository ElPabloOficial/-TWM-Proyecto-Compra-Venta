import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/organisms/Header/Header";
import ProductForm from "../../components/organisms/ProductForm/ProductForm";
import { useProductos } from "../../context/ProductContext";
import "../../styles/AddProduct.css";

const AddProductScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { productos, categoriasProducto, cargando, agregarProducto, actualizarProducto } = useProductos();

  // Si la ruta trae un id (/inventario/editar/:id) la pantalla funciona en modo edición
  const producto = id ? productos.find((p) => p.id === Number(id)) : null;
  const editando = Boolean(id);

  // Si se abre directo la dirección de edición, hay que esperar a que lleguen los productos
  if (editando && cargando) {
    return <div style={{ padding: 40 }}>Cargando producto...</div>;
  }

  if (editando && !producto) {
    return <Navigate to="/inventario" replace />;
  }

  // Si la API rechaza el guardado, el error llega hasta ProductForm, que lo muestra
  // bajo el formulario, y no se navega.
  const guardar = async (datos) => {
    if (editando) {
      await actualizarProducto({ ...datos, id: producto.id });
    } else {
      await agregarProducto(datos);
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
          categorias={categoriasProducto}
          onGuardar={guardar}
          onCancelar={() => navigate("/inventario")}
        />
      </div>
    </div>
  );
};

export default AddProductScreen;