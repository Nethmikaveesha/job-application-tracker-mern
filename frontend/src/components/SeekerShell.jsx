import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/app.css';

function navClass({ isActive }) {
  return isActive ? 'app-nav-active' : '';
}

export default function SeekerShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <Link to="/" className="app-brand">
            JobTracker
          </Link>
          <nav className="app-nav" aria-label="App">
            <NavLink to="/dashboard" className={navClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/jobs" className={navClass}>
              Browse jobs
            </NavLink>
            <NavLink to="/applications" className={navClass}>
              My applications
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>
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
