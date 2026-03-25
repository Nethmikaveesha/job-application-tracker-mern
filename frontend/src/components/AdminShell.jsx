import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/app.css';

export default function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <Link to="/admin" className="app-brand">
            JobTracker Admin
          </Link>
          <nav className="app-nav" aria-label="Admin">
            <Link to="/">Marketing site</Link>
          </nav>
          <div className="app-topbar-actions">
            <span className="muted" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {user?.name}
            </span>
            <button
              type="button"
              className="btn secondary sm"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
