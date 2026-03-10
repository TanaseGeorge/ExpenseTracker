import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usersApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../styles/Authpage.css";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
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

    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must have at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const user = await usersApi.create(form);
      login(user);
      navigate("/expenses");
    } catch (err) {
      setError(err?.message || "Registration failed.");
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
            Create your account to start managing your expenses.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="username" className="auth-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="auth-input"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange("username")}
                autoComplete="username"
                required
              />
            </div>

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
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange("password")}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}