import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/HomePage.css";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-badge">Personal Finance App</span>

          <h1 className="home-title">
            Track your expenses with a clean and simple workflow.
          </h1>

          <p className="home-subtitle">
            Manage expenses, organize categories, and keep your spending under
            control with a polished full-stack app built in React and FastAPI.
          </p>

          <div className="home-actions">
            {user ? (
              <>
                <Link to="/expenses" className="home-primary-btn">
                  Go to Expenses
                </Link>
                <Link to="/categories" className="home-secondary-btn">
                  Manage Categories
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="home-primary-btn">
                  Create Account
                </Link>
                <Link to="/login" className="home-secondary-btn">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <h3>Expense Management</h3>
          <p>
            Add, edit, filter, and delete expenses through a clean, intuitive
            interface.
          </p>
        </div>

        <div className="home-feature-card">
          <h3>Category Organization</h3>
          <p>
            Create custom categories to keep your transactions grouped in a
            meaningful way.
          </p>
        </div>

        <div className="home-feature-card">
          <h3>Fast Workflow</h3>
          <p>
            Built for clarity and speed, with responsive design and immediate
            feedback.
          </p>
        </div>
      </section>
    </div>
  );
}