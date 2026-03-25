import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Admins may open /jobs (and apply URLs) to preview the job board; other seeker routes stay admin-only. */
function adminAllowedOnSeekerRoute(pathname) {
  return /^\/jobs(\/|$)/.test(pathname);
}

export default function ProtectedRoute({ children, adminOnly, seekerOnly }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (seekerOnly && user.role === 'admin' && !adminAllowedOnSeekerRoute(pathname)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
