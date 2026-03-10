import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { usersApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../styles/Authpage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/expenses";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await usersApi.login(form);
      login(user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background" />

      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-logo">
            Expense<span>Track</span>
          </h1>

          <p className="auth-subtitle">
            Welcome back. Sign in to manage your expenses.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange("email")}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange("password")}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}