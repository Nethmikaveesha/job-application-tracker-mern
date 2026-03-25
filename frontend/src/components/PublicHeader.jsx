import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navClass = ({ isActive }) =>
  isActive ? 'public-nav-link public-nav-link--active' : 'public-nav-link';

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link to="/" className="public-logo">
          JobTracker
        </Link>
        <nav className="public-nav" aria-label="Primary">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <NavLink to="/services" className={navClass}>
            Services
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>
        <div className="public-header-actions">
          {user ? (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="public-btn public-btn--ghost"
              >
                {user.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
              <button
                type="button"
                className="public-btn public-btn--outline"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="public-btn public-btn--ghost">
                Login
              </Link>
              <Link to="/signup" className="public-btn public-btn--primary">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
