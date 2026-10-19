
import { useState } from "react";

import Header from "../../components/organisms/Header/Header";
import CustomButton from "../../components/atoms/Button/CustomButton";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import "../../styles/CategoryManagement.css";

const initialCategories = [
    {
        id: 1,
        name: "Productos",
        productCount: 10,
        children: [
            {
                id: 2,
                name: "Tecnología",
                productCount: 10,
                children: [
                    {
                        id: 3,
                        name: "Computación",
                        productCount: 4,
                        children: [],
                    },
                    {
                        id: 4,
                        name: "Celular",
                        productCount: 6,
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        id: 5,
        name: "Servicios",
        productCount: 3,
        children: [
            {
                id: 6,
                name: "Limpieza",
                productCount: 3,
                children: [],
            },
        ],
    },
];

// Recursively update a category and its descendants.
const updateCategoryTree = (categories, targetId, updater) =>
    categories.map((category) => {
        if (category.id === targetId) {
            return updater(category);
        }

        return {
            ...category,
            children: updateCategoryTree(
                category.children,
                targetId,
                updater
            ),
        };
    });

// Recursively remove a category and its entire subtree.
const removeCategoryTree = (categories, targetId) =>
    categories
        .filter((category) => category.id !== targetId)
        .map((category) => ({
            ...category,
            children: removeCategoryTree(
                category.children,
                targetId
            ),
        }));

// Find a category by ID anywhere in the tree.
const findCategory = (categories, targetId) => {
    for (const category of categories) {
        if (category.id === targetId) {
            return category;
        }

        const found = findCategory(
            category.children,
            targetId
        );

        if (found) return found;
    }

    return null;
};

// Calculate total number of categories, including descendants.
const countCategories = (categories) =>
    categories.reduce(
        (total, category) =>
            total + 1 + countCategories(category.children),
        0
    );

const CategoryManagementScreen = () => {
    const [categories, setCategories] = useState(initialCategories);


    // Add a child category to an existing category.
    const handleAddSubcategory = (parentId) => {
        const name = window.prompt("Enter the subcategory name:");

        if (!name || !name.trim()) return;

        const newCategory = {
            id: Date.now(),
            name: name.trim(),
            productCount: 0,
            children: [],
        };

        setCategories((current) =>
            updateCategoryTree(current, parentId, (category) => ({
                ...category,
                children: [...category.children, newCategory],
            }))
        );
    };

    // Rename an existing category.
    const handleEditCategory = (category) => {
        const name = window.prompt(
            "Edit category name:",
            category.name
        );

        if (!name || !name.trim()) return;

        setCategories((current) =>
            updateCategoryTree(current, category.id, (item) => ({
                ...item,
                name: name.trim(),
            }))
        );
    };

    // Remove a category and all of its descendants.
    const handleRemoveCategory = (category) => {
        const confirmed = window.confirm(
            `Remove "${category.name}" and all its subcategories?`
        );

        if (!confirmed) return;

        setCategories((current) =>
            removeCategoryTree(current, category.id)
        );
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
                    {category.productCount}
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
                            onClick={() =>
                                handleAddSubcategory(category.id)
                            }
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
                                        handleEditCategory(category)
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
        <>
            <Header />

            <main className="category-management-page">
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
                    {categories.length > 0 ? (
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

                            <h3>No categories yet</h3>

                            <p>
                                Create a main category to start organizing
                                your products and services.
                            </p>

                            <CustomButton
                                variant="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddCategory}
                                sx={{ textTransform: "none" }}
                            >
                                Create first category
                            </CustomButton>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
};

export default CategoryManagementScreen;
