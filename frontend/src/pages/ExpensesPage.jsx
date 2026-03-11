import { useEffect, useState, useCallback, useMemo } from "react";
import { expensesApi, categoriesApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ExpenseModal from "../components/ExpenseModal";
import "../styles/ExpensesPage.css";

function formatAmount(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

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

export default function ExpensesPage() {
  const { user } = useAuth();
  const showToast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editExp, setEditExp] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [aiInsight, setAiInsight] = useState("");
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) {
      setExpenses([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [exps, cats] = await Promise.all([
        expensesApi.list(user.id),
        categoriesApi.list(user.id),
      ]);

      setExpenses(Array.isArray(exps) ? exps : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      showToast(err?.message || "Failed to load expenses.", "error");
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
    setEditExp(null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await expensesApi.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast("Expense deleted.", "success");
    } catch (err) {
      showToast(err?.message || "Failed to delete expense.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleGenerateInsight = async () => {
    if (!user?.id) return;

    setAiLoading(true);
    setAiError("");
    setAiInsight("");
    setAiSummary(null);

    try {
      const result = await expensesApi.getAiInsight(user.id);
      setAiInsight(result?.insight || "");
      setAiSummary(result?.summary_data || null);
    } catch (err) {
      const message = err?.message || "Failed to generate AI insight.";
      setAiError(message);
      showToast(message, "error");
    } finally {
      setAiLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!filterCat) return expenses;
    return expenses.filter((e) => e.category_id === filterCat);
  }, [expenses, filterCat]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredExpenses]);

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <div>
          <h1 className="expenses-title">Expenses</h1>
          <p className="expenses-subtitle">
            {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? "s" : ""} ·{" "}
            {formatAmount(totalAmount)}
          </p>
        </div>

        <button
          className="expenses-primary-btn"
          onClick={() => setShowAdd(true)}
        >
          + Add Expense
        </button>
      </div>

      <div className="expenses-filters">
        <button
          className={`expenses-chip ${filterCat === null ? "active" : ""}`}
          onClick={() => setFilterCat(null)}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={`expenses-chip ${filterCat === category.id ? "active" : ""}`}
            onClick={() =>
              setFilterCat((prev) => (prev === category.id ? null : category.id))
            }
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="expenses-card">
        {loading ? (
          <div className="expenses-loading">
            <div className="expenses-loading-dot" />
            <div className="expenses-loading-dot" />
            <div className="expenses-loading-dot" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="expenses-empty">
            <div className="expenses-empty-icon">💸</div>
            <h3>No expenses found</h3>
            <p>Add your first expense or change the selected filter.</p>
          </div>
        ) : (
          <>
            <div className="expenses-table-wrap">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th className="amount-col">Amount</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const category = categories.find((c) => c.id === expense.category_id);
                    const color = category ? getCategoryColor(category.id) : "#94a3b8";

                    return (
                      <tr key={expense.id}>
                        <td>
                          <span className="expense-title-text">{expense.title}</span>
                        </td>

                        <td>
                          <span
                            className="expense-badge"
                            style={{
                              backgroundColor: `${color}22`,
                              color,
                              borderColor: `${color}55`,
                            }}
                          >
                            {category?.name || "Unknown"}
                          </span>
                        </td>

                        <td className="expense-muted">{formatDate(expense.expense_date)}</td>

                        <td className="expense-notes-cell">
                          {expense.notes?.trim() ? expense.notes : "—"}
                        </td>

                        <td className="amount-col amount-value">
                          {formatAmount(expense.amount)}
                        </td>

                        <td className="actions-col">
                          <div className="expense-actions">
                            <button
                              className="expense-edit-btn"
                              onClick={() => setEditExp(expense)}
                            >
                              Edit
                            </button>

                            <button
                              className="expense-delete-btn"
                              onClick={() => handleDelete(expense.id)}
                              disabled={deleting === expense.id}
                            >
                              {deleting === expense.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="expenses-mobile-list">
              {filteredExpenses.map((expense) => {
                const category = categories.find((c) => c.id === expense.category_id);
                const color = category ? getCategoryColor(category.id) : "#94a3b8";

                return (
                  <div className="expense-mobile-card" key={expense.id}>
                    <div className="expense-mobile-top">
                      <div>
                        <div className="expense-mobile-title">{expense.title}</div>
                        <div className="expense-mobile-meta">
                          <span
                            className="expense-badge"
                            style={{
                              backgroundColor: `${color}22`,
                              color,
                              borderColor: `${color}55`,
                            }}
                          >
                            {category?.name || "Unknown"}
                          </span>
                          <span className="expense-mobile-date">
                            {formatDate(expense.expense_date)}
                          </span>
                        </div>
                      </div>

                      <div className="amount-value">{formatAmount(expense.amount)}</div>
                    </div>

                    <div className="expense-mobile-notes">
                      {expense.notes?.trim() ? expense.notes : "No notes"}
                    </div>

                    <div className="expense-mobile-actions">
                      <button
                        className="expense-edit-btn"
                        onClick={() => setEditExp(expense)}
                      >
                        Edit
                      </button>

                      <button
                        className="expense-delete-btn"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleting === expense.id}
                      >
                        {deleting === expense.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {expenses.length > 0 && (
        <div className="expenses-card expenses-ai-card">
          <div className="expenses-ai-header">
            <div>
              <h2 className="expenses-ai-title">AI Spending Insight</h2>
              <p className="expenses-ai-subtitle">
                Generate a short analysis based on your expenses.
              </p>
            </div>

            <button
              className="expenses-primary-btn"
              onClick={handleGenerateInsight}
              disabled={aiLoading}
            >
              {aiLoading ? "Generating..." : "Generate AI Insight"}
            </button>
          </div>

          {aiError && (
            <p className="expenses-ai-error">{aiError}</p>
          )}

          {aiSummary && (
            <div className="expenses-ai-summary">
              <h3 className="expenses-ai-section-title">Summary Data</h3>
              <p className="expenses-ai-total">
                <strong>Total spent:</strong> {formatAmount(aiSummary.total_spent)}
              </p>

              <div className="expenses-ai-summary-grid">
                {Object.entries(aiSummary.categories || {}).map(([category, amount]) => (
                  <div className="expenses-ai-summary-item" key={category}>
                    <span className="expenses-ai-summary-label">{category}</span>
                    <span className="expenses-ai-summary-value">
                      {formatAmount(amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiInsight && (
            <div className="expenses-ai-result">
              <h3 className="expenses-ai-section-title">Insight</h3>
              <div className="expenses-ai-output">{aiInsight}</div>
            </div>
          )}
        </div>
      )}

      {(showAdd || editExp) && user?.id && (
        <ExpenseModal
          categories={categories}
          userId={user.id}
          expense={editExp}
          onSave={handleSave}
          onClose={() => {
            setShowAdd(false);
            setEditExp(null);
          }}
        />
      )}
    </div>
  );
}