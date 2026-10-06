const ProductToolbar = ({ total, orden, onOrden, filtro, onFiltro, onVerTodos }) => {
  return (
    <div className="inv-toolbar">
      <div>
        <b>Productos</b>
        <span className="inv-toolbar-count">{total} productos</span>
      </div>

      <div className="inv-toolbar-actions">
        <button type="button" className="inv-link-red" onClick={onVerTodos}>
          Ver Todos
        </button>

        <select
          className="inv-select"
          value={orden}
          onChange={(e) => onOrden(e.target.value)}
        >
          <option value="">Ordenar</option>
          <option value="nombre">Nombre (A-Z)</option>
          <option value="precioAsc">Precio: menor a mayor</option>
          <option value="precioDesc">Precio: mayor a menor</option>
          <option value="stockAsc">Stock: menor a mayor</option>
          <option value="stockDesc">Stock: mayor a menor</option>
        </select>

        <select
          className="inv-select"
          value={filtro}
          onChange={(e) => onFiltro(e.target.value)}
        >
          <option value="">Filtros</option>
          <option value="oferta">En oferta</option>
          <option value="bajo">Stock bajo (3 o menos)</option>
          <option value="sin">Sin stock</option>
        </select>
      </div>
    </div>
  );
};

export default ProductToolbar;