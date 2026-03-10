import { useEffect, useState } from "react";
import { expensesApi } from "../api/client";
import { useToast } from "../context/ToastContext";
import "../styles/ExpenseModal.css";

export default function ExpenseModal({
  categories,
  userId,
  expense = null,
  onSave,
  onClose,
}) {
  const showToast = useToast();
  const isEdit = Boolean(expense);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    expense_date: "",
    category_id: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title || "",
        amount: expense.amount ?? "",
        expense_date: expense.expense_date || "",
        category_id: expense.category_id || "",
        notes: expense.notes || "",
      });
    }
  }, [expense]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) {
      return "Title is required.";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than 0.";
    }

    if (!form.expense_date) {
      return "Date is required.";
    }

    if (!form.category_id) {
      return "Please select a category.";
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

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      expense_date: form.expense_date,
      category_id: Number(form.category_id),
      notes: form.notes.trim(),
      user_id: userId,
    };

    try {
      let savedExpense;

      if (isEdit) {
        savedExpense = await expensesApi.update(expense.id, {
          title: payload.title,
          amount: payload.amount,
          expense_date: payload.expense_date,
          category_id: payload.category_id,
          notes: payload.notes,
        });
      } else {
        savedExpense = await expensesApi.create(payload);
      }

      onSave(savedExpense);
      showToast(isEdit ? "Expense updated." : "Expense added.", "success");
    } catch (err) {
      const message = err?.message || "Failed to save expense.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div
        className="expense-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="expense-modal-header">
          <div>
            <h2>{isEdit ? "Edit Expense" : "Add Expense"}</h2>
            <p>
              {isEdit
                ? "Update your expense details."
                : "Create a new expense entry."}
            </p>
          </div>

          <button
            className="expense-modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {error && <div className="expense-modal-error">{error}</div>}

        <form className="expense-modal-form" onSubmit={handleSubmit}>
          <div className="expense-modal-field">
            <label>Title</label>
            <input
              type="text"
              placeholder="Groceries"
              value={form.title}
              onChange={handleChange("title")}
            />
          </div>

          <div className="expense-modal-grid">
            <div className="expense-modal-field">
              <label>Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="45.50"
                value={form.amount}
                onChange={handleChange("amount")}
              />
            </div>

            <div className="expense-modal-field">
              <label>Date</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={handleChange("expense_date")}
              />
            </div>
          </div>

          <div className="expense-modal-field">
            <label>Category</label>
            <select
              value={form.category_id}
              onChange={handleChange("category_id")}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="expense-modal-field">
            <label>Notes</label>
            <textarea
              rows="4"
              placeholder="Optional details..."
              value={form.notes}
              onChange={handleChange("notes")}
            />
          </div>

          <div className="expense-modal-actions">
            <button
              type="button"
              className="expense-modal-secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="expense-modal-primary-btn"
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Adding..."
                : isEdit
                ? "Save Changes"
                : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}