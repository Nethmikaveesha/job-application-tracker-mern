import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const { logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors[0]?.msg
          : null;
        throw new Error(details || data.message || 'Signup failed');
      }
      // Require an explicit login after account creation.
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <aside className="auth-page-aside">
          <p className="home-hero-kicker">Join</p>
          <h1 className="auth-page-title">Start tracking today</h1>
          <p className="auth-page-lead">
            Create a free job seeker account to save applications, statuses, and notes in one calm
            workspace.
          </p>
          <Link to="/" className="auth-page-home">
            ← Back to home
          </Link>
        </aside>

        <div className="auth-card-shell">
          <div className="auth-card-frame">
            <div className="auth-card">
              <p className="auth-card-kicker">JobTracker</p>
              <h2>Create account</h2>
              <p className="auth-card-subtitle">
                Use 8+ characters with uppercase, lowercase, and a number.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="signup-name">Full name</label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Example: Example123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                    title="Use at least 8 characters with uppercase, lowercase, and a number."
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="auth-card-submit">
                  Create account
                </button>
              </form>

              <p className="auth-card-footer">
                Already registered? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
