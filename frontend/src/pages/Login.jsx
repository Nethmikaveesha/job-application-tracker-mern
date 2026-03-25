import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data);
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <aside className="auth-page-aside">
          <p className="home-hero-kicker">Account</p>
          <h1 className="auth-page-title">Welcome back</h1>
          <p className="auth-page-lead">
            Sign in to open your dashboard, browse roles, and keep every application in one place.
          </p>
          <Link to="/" className="auth-page-home">
            ← Back to home
          </Link>
        </aside>

        <div className="auth-card-shell">
          <div className="auth-card-frame">
            <div className="auth-card">
              <p className="auth-card-kicker">JobTracker</p>
              <h2>Log in</h2>
              <p className="auth-card-subtitle">Use the email and password you registered with.</p>

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="auth-card-submit">
                  Log in
                </button>
              </form>

              <p className="auth-card-footer">
                Don&apos;t have an account? <Link to="/signup">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
