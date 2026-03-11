import { useEffect, useState, useCallback } from "react";
import { categoriesApi } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import CategoryModal from "../components/CategoryModal";
import "../styles/CategoriesPage.css";

function getCategoryColor(id) {
  const colors = [
    "#7c6af7",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#ec4899",
    "#8b5cf6",
    "#84cc16",
  ];
  return colors[id % colors.length];
}

export default function CategoriesPage() {
  const showToast = useToast();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const cats = await categoriesApi.list(user.id);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      showToast(err?.message || "Failed to load categories.", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    await load();
    setShowAdd(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await categoriesApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Category deleted.", "success");
    } catch (err) {
      showToast(
        err?.message || "Cannot delete category. It may still be used by expenses.",
        "error"
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1 className="categories-title">Categories</h1>
          <p className="categories-subtitle">
            Organize your expenses by type.
          </p>
        </div>

        <button
          className="categories-primary-btn"
          onClick={() => setShowAdd(true)}
        >
          + New Category
        </button>
      </div>

      {loading ? (
        <div className="categories-loading">
          <div className="categories-loading-dot" />
          <div className="categories-loading-dot" />
          <div className="categories-loading-dot" />
        </div>
      ) : categories.length === 0 ? (
        <div className="categories-empty">
          <div className="categories-empty-icon">🏷️</div>
          <h3>No categories yet</h3>
          <p>Add a category to start organizing your expenses.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => {
            const color = getCategoryColor(category.id);

            return (
              <div
                key={category.id}
                className="category-card"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="category-card-top">
                  <div
                    className="category-icon"
                    style={{
                      backgroundColor: `${color}22`,
                      color,
                    }}
                  >
                    #
                  </div>

                  <button
                    className="category-delete-btn"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                  >
                    {deleting === category.id ? "..." : "Delete"}
                  </button>
                </div>

                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">
                  {category.description?.trim()
                    ? category.description
                    : "No description provided."}
                </p>

                <div
                  className="category-color-dot"
                  style={{ backgroundColor: color }}
                />
              </div>
            );
          })}
        </div>
      )}

      {showAdd && user?.id && (
        <CategoryModal
          userId={user.id}
          onSave={handleSave}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}