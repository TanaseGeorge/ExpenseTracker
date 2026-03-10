import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExpensesPage from "./pages/ExpensesPage";
import CategoriesPage from "./pages/CategoriesPage";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;