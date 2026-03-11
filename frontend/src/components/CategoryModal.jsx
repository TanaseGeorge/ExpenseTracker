import { useState } from "react";
import { categoriesApi } from "../api/client";
import { useToast } from "../context/ToastContext";
import "../styles/CategoryModal.css";

export default function CategoryModal({ userId, onSave, onClose }) {
  const showToast = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      return "Category name is required.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        user_id: userId,
      };

      const savedCategory = await categoriesApi.create(payload);
      onSave(savedCategory);
      showToast("Category created.", "success");
    } catch (err) {
      const message = err?.message || "Failed to create category.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-modal-overlay" onClick={onClose}>
      <div className="category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="category-modal-header">
          <div>
            <h2>New Category</h2>
            <p>Create a category to organize your expenses.</p>
          </div>

          <button
            className="category-modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {error && <div className="category-modal-error">{error}</div>}

        <form className="category-modal-form" onSubmit={handleSubmit}>
          <div className="category-modal-field">
            <label>Category Name</label>
            <input
              type="text"
              placeholder="Food"
              value={form.name}
              onChange={handleChange("name")}
            />
          </div>

          <div className="category-modal-field">
            <label>Description</label>
            <textarea
              rows="4"
              placeholder="Groceries, dining out, snacks..."
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="category-modal-actions">
            <button
              type="button"
              className="category-modal-secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="category-modal-primary-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}