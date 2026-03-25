// import { NavLink, Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const navClass = ({ isActive }) =>
//   isActive ? 'public-nav-link public-nav-link--active' : 'public-nav-link';

// export default function PublicHeader() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <header className="public-header">
//       <div className="public-header-inner">
//         <Link to="/" className="public-logo">
//           JobTracker
//         </Link>
//         <nav className="public-nav" aria-label="Primary">
//           <NavLink to="/" end className={navClass}>
//             Home
//           </NavLink>
//           <NavLink to="/about" className={navClass}>
//             About
//           </NavLink>
//           <NavLink to="/services" className={navClass}>
//             Services
//           </NavLink>
//           <NavLink to="/contact" className={navClass}>
//             Contact
//           </NavLink>
//         </nav>
//         <div className="public-header-actions">
//           {user ? (
//             <>
//               <Link
//                 to={user.role === 'admin' ? '/admin' : '/dashboard'}
//                 className="public-btn public-btn--ghost"
//               >
//                 {user.role === 'admin' ? 'Admin' : 'Dashboard'}
//               </Link>
//               <button
//                 type="button"
//                 className="public-btn public-btn--outline"
//                 onClick={() => {
//                   logout();
//                   navigate('/');
//                 }}
//               >
//                 Log out
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" className="public-btn public-btn--ghost">
//                 Login
//               </Link>
//               <Link to="/signup" className="public-btn public-btn--primary">
//                 Signup
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  isActive ? "public-nav-link public-nav-link--active" : "public-nav-link";

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Sora:wght@300;400;500;600&display=swap');

        :root {
          --ink:        #0f0d0b;
          --ink-muted:  #6b6560;
          --gold:       #c9973a;
          --gold-light: #e8b95a;
          --white:      #ffffff;
        }

        body {
          margin: 0;
          font-family: 'Sora', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Header ───────────────────────────── */
        .public-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--ink);
          border-bottom: 1px solid rgba(250, 247, 242, 0.08);
        }

        .public-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── Logo ─────────────────────────────── */
        .public-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          text-decoration: none;
          color: var(--white);
          letter-spacing: -0.02em;
        }

        /* ── Navigation ───────────────────────── */
        .public-nav {
          display: flex;
          gap: 1.5rem;
        }

        .public-nav-link {
          text-decoration: none;
          font-size: 0.95rem;
          color: rgba(250, 247, 242, 0.65);
          transition: 0.25s;
        }

        .public-nav-link:hover {
          color: var(--gold-light);
        }

        .public-nav-link--active {
          color: var(--gold);
          font-weight: 500;
        }

        /* ── Buttons ──────────────────────────── */
        .public-header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .public-btn {
          padding: 0.55rem 1.4rem;
          font-size: 0.9rem;
          border-radius: 6px;
          text-decoration: none;
          border: 1px solid transparent;
          cursor: pointer;
          transition: 0.3s;
          font-weight: 500;
        }

        .public-btn--primary {
          background: var(--gold);
          color: white;
        }

        .public-btn--primary:hover {
          background: var(--gold-light);
        }

        .public-btn--ghost {
          color: rgba(250, 247, 242, 0.85);
        }

        .public-btn--ghost:hover {
          color: var(--gold-light);
        }

        .public-btn--outline {
          border: 1px solid var(--gold);
          color: var(--gold);
          background: transparent;
        }

        .public-btn--outline:hover {
          background: var(--gold);
          color: white;
        }

        /* ── Responsive ───────────────────────── */
        @media (max-width: 900px) {
          .public-nav {
            display: none;
          }
        }
      `}</style>

      <header className="public-header">
        <div className="public-header-inner">
          <Link to="/" className="public-logo">
            JobTracker
          </Link>

          <nav className="public-nav">
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
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="public-btn public-btn--ghost"
                >
                  {user.role === "admin" ? "Admin" : "Dashboard"}
                </Link>

                <button
                  className="public-btn public-btn--outline"
                  onClick={() => {
                    logout();
                    navigate("/");
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
    </>
  );
}
