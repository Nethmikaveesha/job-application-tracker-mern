// import { Link } from 'react-router-dom';

// export default function PublicFooter() {
//   const year = new Date().getFullYear();
//   return (
//     <footer className="public-footer">
//       <div className="public-footer-inner">
//         <div className="public-footer-brand">
//           <strong>JobTracker</strong>
//           <p>Organize applications, stay on top of follow-ups, and land your next role.</p>
//         </div>
//         <div className="public-footer-col">
//           <span className="public-footer-heading">Explore</span>
//           <Link to="/">Home</Link>
//           <Link to="/about">About</Link>
//           <Link to="/services">Services</Link>
//           <Link to="/contact">Contact</Link>
//         </div>
//         <div className="public-footer-col">
//           <span className="public-footer-heading">Account</span>
//           <Link to="/login">Login</Link>
//           <Link to="/signup">Signup</Link>
//         </div>
//       </div>
//       <div className="public-footer-bottom">
//         <span>© {year} JobTracker. All rights reserved.</span>
//       </div>
//     </footer>
//   );
// }
import { Link } from "react-router-dom";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Sora:wght@300;400;600&display=swap');

        :root {
          --ink:        #0f0d0b;
          --paper:      #faf7f2;
          --gold:       #c9973a;
          --gold-light: #e8b95a;
          --white:      #ffffff;
        }

        body {
          margin: 0;
          font-family: 'Sora', sans-serif;
        }

        /* ── Footer ───────────────────────────── */
        .public-footer {
          background: var(--ink);
          color: var(--paper);
          margin-top: auto;
        }

        .public-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem 3rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
        }

        /* ── Brand ────────────────────────────── */
        .public-footer-brand strong {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: var(--white);
          display: block;
          margin-bottom: .6rem;
        }

        .public-footer-brand p {
          font-size: .9rem;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(250,247,242,.6);
          max-width: 28ch;
        }

        /* ── Column headings ─────────────────── */
        .public-footer-heading {
          font-size: .75rem;
          font-weight: 600;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1rem;
          display: block;
        }

        /* ── Footer links ────────────────────── */
        .public-footer-col {
          display: flex;
          flex-direction: column;
          gap: .6rem;
        }

        .public-footer-col a {
          font-size: .9rem;
          color: rgba(250,247,242,.6);
          text-decoration: none;
          transition: .2s;
        }

        .public-footer-col a:hover {
          color: var(--gold-light);
        }

        /* ── Social icons ────────────────────── */
        .footer-social {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .footer-social a {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          color: white;
          text-decoration: none;
          font-size: 1rem;
          transition: .3s;
        }

        .footer-social a:hover {
          background: var(--gold);
          color: white;
        }

        /* ── Bottom ─────────────────────────── */
        .public-footer-bottom {
          border-top: 1px solid rgba(250,247,242,.08);
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.3rem 2rem;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: .5rem;
        }

        .public-footer-bottom span {
          font-size: .8rem;
          color: rgba(250,247,242,.4);
        }

        /* ── Responsive ─────────────────────── */
        @media (max-width: 900px) {
          .public-footer-inner {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .public-footer-inner {
            grid-template-columns: 1fr;
            padding: 3rem 1.5rem 2rem;
          }

          .public-footer-bottom {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>

      <footer className="public-footer">
        <div className="public-footer-inner">

          {/* Brand */}
          <div className="public-footer-brand">
            <strong>JobTracker</strong>
            <p>
              Organize your job applications, track progress, and stay on top
              of follow-ups in one modern dashboard.
            </p>

            {/* Social icons */}
            <div className="footer-social">
              <a href="#">🌐</a>
              <a href="#">💼</a>
              <a href="#">📧</a>
              <a href="#">📱</a>
            </div>
          </div>

          {/* Explore */}
          <div className="public-footer-col">
            <span className="public-footer-heading">Explore</span>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact</Link>
          </div>

          {/* Account */}
          <div className="public-footer-col">
            <span className="public-footer-heading">Account</span>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>

          {/* Support */}
          <div className="public-footer-col">
            <span className="public-footer-heading">Support</span>
            <Link to="/contact">Help Center</Link>
            <Link to="/contact">Report Issue</Link>
            <Link to="/contact">Feedback</Link>
          </div>

        </div>

        <div className="public-footer-bottom">
          <span>© {year} JobTracker. All rights reserved.</span>
          
        </div>
      </footer>
    </>
  );
}