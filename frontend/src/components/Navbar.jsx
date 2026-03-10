import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Expense<span>Track</span>
        </Link>

        <nav className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>

          <Link
            to="/expenses"
            className={`navbar-link ${isActive("/expenses") ? "active" : ""}`}
          >
            Expenses
          </Link>

          <Link
            to="/categories"
            className={`navbar-link ${isActive("/categories") ? "active" : ""}`}
          >
            Categories
          </Link>

          {!user && (
            <>
              <Link
                to="/login"
                className={`navbar-link ${isActive("/login") ? "active" : ""}`}
              >
                Login
              </Link>

              <Link
                to="/register"
                className={`navbar-link ${isActive("/register") ? "active" : ""}`}
              >
                Register
              </Link>
            </>
          )}
        </nav>

        <div className="navbar-right">
          {user ? (
            <>
              <span className="navbar-user">
                {user.username || user.email || "User"}
              </span>
              <button className="navbar-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-button">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}