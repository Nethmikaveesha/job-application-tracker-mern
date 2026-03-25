import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import '../styles/public.css';

export default function PublicLayout() {
  return (
    <div className="public-shell">
      <PublicHeader />
      <main className="public-main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
