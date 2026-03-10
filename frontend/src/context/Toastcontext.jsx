import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <ToastNotification key={toast.id} toast={toast} onDismiss={dismiss} />
      )}
    </ToastContext.Provider>
  );
}

function ToastNotification({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`toast ${toast.type}`}
      onClick={onDismiss}
      style={{ cursor: "pointer" }}
    >
      <span className="toast-icon">
        {toast.type === "success" ? "✓" : "✕"}
      </span>
      <span>{toast.msg}</span>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.showToast;
}