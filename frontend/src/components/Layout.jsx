import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          JobTracker
        </Link>
        <nav className="nav">
          {isAdmin ? (
            <>
              <NavLink end to="/admin" className="nav-link">
                Admin home
              </NavLink>
              <NavLink to="/admin/users" className="nav-link">
                Users
              </NavLink>
              <NavLink to="/admin/jobs" className="nav-link">
                Jobs
              </NavLink>
              <NavLink to="/admin/applications" className="nav-link">
                Applications
              </NavLink>
            </>
          ) : (
            <>
              <NavLink end to="/" className="nav-link">
                Dashboard
              </NavLink>
              <NavLink to="/jobs" className="nav-link">
                Browse jobs
              </NavLink>
              <NavLink to="/applications" className="nav-link">
                My applications
              </NavLink>
              <NavLink to="/profile" className="nav-link">
                Profile
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <p className="user-pill">{user?.name}</p>
          <p className="user-role">{user?.role === 'admin' ? 'Admin' : 'Job seeker'}</p>
          <button type="button" className="btn ghost full" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
