import { Link } from 'react-router-dom';

export default function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="public-footer-brand">
          <strong>JobTracker</strong>
          <p>Organize applications, stay on top of follow-ups, and land your next role.</p>
        </div>
        <div className="public-footer-col">
          <span className="public-footer-heading">Explore</span>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="public-footer-col">
          <span className="public-footer-heading">Account</span>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      </div>
      <div className="public-footer-bottom">
        <span>© {year} JobTracker. All rights reserved.</span>
      </div>
    </footer>
  );
}
