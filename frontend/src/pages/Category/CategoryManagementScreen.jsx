
import { useCallback, useEffect, useMemo, useState } from "react";

import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import CustomButton from "../../components/atoms/Button/CustomButton";
import ConfirmDialog from "../../components/molecules/ConfirmDialog/ConfirmDialog";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import CategoryFormDialog from "../../components/organisms/CategoryFormDialog/CategoryFormDialog";
import { useToast } from "../../context/ToastContext";
import {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
} from "../../services/categoryService";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import "../../styles/CategoryManagement.css";

// Arma el árbol a partir de la lista plana de la API.
//   ownCount   -> productos y servicios de esa categoría
//   totalCount -> los suyos más los de todas sus subcategorías (lo que se muestra en la tabla)
const buildTree = (flat) => {
    const nodes = new Map(
        flat.map((c) => [
            c.id,
            {
                id: c.id,
                name: c.nombre,
                parentId: c.padreId,
                ownCount: c.cantidadProductos + c.cantidadServicios,
                totalCount: 0,
                children: [],
            },
        ])
    );

    const roots = [];
    nodes.forEach((node) => {
        const parent = nodes.get(node.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node);
    });

    const finish = (list) => {
        list.sort((a, b) => a.name.localeCompare(b.name, "es"));
        list.forEach((node) => {
            finish(node.children);
            node.totalCount = node.ownCount + node.children.reduce((sum, child) => sum + child.totalCount, 0);
        });
    };
    finish(roots);

    return roots;
};

// Calculate total number of categories, including descendants.
const countCategories = (categories) =>
    categories.reduce(
        (total, category) =>
            total + 1 + countCategories(category.children),
        0
    );

const CategoryManagementScreen = () => {
    const { mostrarToast } = useToast();
    const [flat, setFlat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dialog, setDialog] = useState(null); // { modo: "crear", padre } | { modo: "editar", categoria }
    const [toDelete, setToDelete] = useState(null);

    const categories = useMemo(() => buildTree(flat), [flat]);

    // Vuelve a pedir las categorías a la API (también actualiza los conteos)
    const reload = useCallback(async () => {
        try {
            setFlat(await obtenerCategorias());
            setError("");
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    // Nombres de las otras categorías del mismo nivel (para no repetir nombres)
    const siblingNames = () => {
        const parentId = dialog.modo === "editar" ? dialog.categoria.parentId : dialog.padre?.id ?? null;
        const ownId = dialog.modo === "editar" ? dialog.categoria.id : null;
        return flat.filter((c) => c.padreId === parentId && c.id !== ownId).map((c) => c.nombre);
    };

    // Crea o renombra; si la API rechaza el cambio, el formulario muestra el mensaje
    const handleSave = async (name) => {
        if (dialog.modo === "editar") {
            await actualizarCategoria(dialog.categoria.id, { nombre: name, padreId: dialog.categoria.parentId });
            mostrarToast("Categoría actualizada correctamente");
        } else {
            await crearCategoria({ nombre: name, padreId: dialog.padre?.id ?? null });
            mostrarToast("Categoría creada correctamente");
        }
        setDialog(null);
        await reload();
    };

    // La API no deja eliminar una categoría con subcategorías ni con productos/servicios
    const handleRemoveCategory = (category) => {
        if (category.children.length > 0) {
            mostrarToast("No se puede eliminar: tiene subcategorías. Elimínalas primero.", "error");
            return;
        }
        if (category.ownCount > 0) {
            mostrarToast("No se puede eliminar: tiene productos o servicios asociados.", "error");
            return;
        }
        setToDelete(category);
    };

    const confirmDelete = async () => {
        try {
            await eliminarCategoria(toDelete.id);
            mostrarToast("Categoría eliminada correctamente");
            await reload();
        } catch (e) {
            mostrarToast(e.message, "error");
        }
        setToDelete(null);
    };

    // Render the hierarchy as table rows.
    const renderCategoryRows = (items, level = 0) =>
        items.flatMap((category) => [
            <tr className="category-row" key={category.id}>
                <td className="category-name-cell">
                    <div
                        className="category-name-content"
                        style={{ paddingLeft: `${level * 28}px` }}
                    >
                        {level > 0 && (
                            <span
                                className="category-tree-marker"
                                aria-hidden="true"
                            >
                                ↳
                            </span>
                        )}

                        <span
                            className={`category-folder-icon ${
                                level === 0 ? "root-category" : ""
                            }`}
                            aria-hidden="true"
                        >
                            <AccountTreeOutlinedIcon fontSize="small" />
                        </span>

                        <span className="category-name">
                            {category.name}
                        </span>
                    </div>
                </td>

                <td className="category-count-cell">
                    {category.totalCount}
                </td>

                <td className="category-level-cell">
                    <span
                        className={`category-level ${
                            level === 0 ? "root-level" : ""
                        }`}
                    >
                        {level}
                    </span>
                </td>

                <td className="category-actions-cell">
                    <div className="category-actions">
                        <CustomButton
                            variant="primary"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setDialog({ modo: "crear", padre: { id: category.id, nombre: category.name } })}
                            sx={{
                                textTransform: "none",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Subcategoría
                        </CustomButton>

                        {level > 0 && (
                            <>
                                <CustomButton
                                    variant="secondary"
                                    size="small"
                                    startIcon={<EditOutlinedIcon />}
                                    onClick={() =>
                                        setDialog({
                                            modo: "editar",
                                            categoria: { id: category.id, nombre: category.name, parentId: category.parentId },
                                        })
                                    }
                                    sx={{
                                        textTransform: "none",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Editar
                                </CustomButton>

                                <CustomButton
                                    variant="reject"
                                    size="small"
                                    startIcon={<DeleteOutlineIcon />}
                                    onClick={() =>
                                        handleRemoveCategory(category)
                                    }
                                    sx={{
                                        textTransform: "none",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Eliminar
                                </CustomButton>
                            </>
                        )}
                    </div>
                </td>
            </tr>,

            ...renderCategoryRows(category.children, level + 1),
        ]);

    const totalCategories = countCategories(categories);

    return (
        <AdminTemplate>
            <div className="category-management-page">
                <section className="category-page-header">
                    <div className="category-page-heading">
                        <p className="category-eyebrow">
                            ADMINISTRACIÓN
                        </p>

                        <h1>Gestión Jerárquica de Categorías</h1>

                        <p className="category-page-subtitle">
                            Crea y modifica subcategorías para Productos y Servicios.                        </p>
                    </div>

                </section>

                <section className="category-summary">
                    <div className="category-summary-card">
                        <span className="category-summary-label">
                            Categorías totales
                        </span>

                        <strong>{totalCategories}</strong>
                    </div>

                </section>

                <section className="category-table-section">
                    {error ? (
                        <ErrorState titulo="No pudimos cargar las categorías" detalle={error} onReintentar={reload} />
                    ) : loading ? (
                        <p className="category-page-subtitle">Cargando categorías...</p>
                    ) : categories.length > 0 ? (
                        <div className="category-table-wrapper">
                            <table className="category-table">
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            Nombre de categoría
                                        </th>

                                        <th scope="col">
                                            Productos / Servicios
                                        </th>

                                        <th scope="col">
                                            Nivel Jerárquico
                                        </th>

                                        <th scope="col">
                                            Acciones Permitidas
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {renderCategoryRows(categories)}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="category-empty-state">
                            <AccountTreeOutlinedIcon
                                className="category-empty-icon"
                            />

                            <h3>Todavía no hay categorías</h3>

                            <p>
                                Crea una categoría principal para empezar a
                                ordenar tus productos y servicios.
                            </p>

                            <CustomButton
                                variant="primary"
                                startIcon={<AddIcon />}
                                onClick={() => setDialog({ modo: "crear", padre: { id: null, nombre: "Categorías" } })}
                                sx={{ textTransform: "none" }}
                            >
                                Crear primera categoría
                            </CustomButton>
                        </div>
                    )}
                </section>
            </div>

            <CategoryFormDialog
                dialogo={dialog}
                hermanos={dialog ? siblingNames() : []}
                onClose={() => setDialog(null)}
                onGuardar={handleSave}
            />

            <ConfirmDialog
                open={Boolean(toDelete)}
                titulo="Eliminar categoría"
                mensaje={`¿Seguro que quieres eliminar la categoría "${toDelete?.name ?? ""}"? Esta acción no se puede deshacer.`}
                textoConfirmar="Eliminar"
                onConfirmar={confirmDelete}
                onCancelar={() => setToDelete(null)}
            />
        </AdminTemplate>
    );
};

export default CategoryManagementScreen;
