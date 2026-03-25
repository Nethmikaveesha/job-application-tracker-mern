import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/app.css';

function navClass({ isActive }) {
  return isActive ? 'app-nav-active' : '';
}

export default function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell app-shell--with-sidebar">
      <aside className="app-sidebar" aria-label="Admin navigation">
        <div className="app-sidebar-top">
          <Link to="/admin" className="app-brand">
            JobTracker Admin
          </Link>
        </div>
        <nav className="app-sidebar-nav" aria-label="Admin">
          <NavLink to="/admin" className={navClass} end>
            Overview
          </NavLink>
          <NavLink to="/admin/jobs" className={navClass}>
            Jobs
          </NavLink>
          <NavLink to="/admin/applications" className={navClass}>
            Applications
          </NavLink>
          <NavLink to="/admin/users" className={navClass}>
            Users
          </NavLink>
          <Link to="/">Marketing site</Link>
        </nav>
        <div className="app-sidebar-footer">
          <span className="app-user-name">{user?.name}</span>
          <button
            type="button"
            className="btn secondary sm app-sidebar-logout"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
