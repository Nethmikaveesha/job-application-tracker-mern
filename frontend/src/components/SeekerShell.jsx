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
    <div className="app-shell app-shell--with-sidebar">
      <aside className="app-sidebar" aria-label="App navigation">
        <div className="app-sidebar-top">
          <Link to="/" className="app-brand">
            JobTracker
          </Link>
        </div>
        <nav className="app-sidebar-nav" aria-label="App">
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
