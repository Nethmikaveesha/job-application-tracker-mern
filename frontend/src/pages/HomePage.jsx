import { useState } from 'react';
import { Link } from 'react-router-dom';

const SOURCES = [
  '/home-hero-full.png',
  '/hero-typewriter.png',
  '/hero-job-application.jpg',
];

export default function HomePage() {
  const [sourceIndex, setSourceIndex] = useState(0);
  const src = SOURCES[sourceIndex];

  return (
    <section className="home-full-page" aria-label="Welcome">
      <img
        className="home-full-img"
        src={src}
        alt="Vintage typewriter with paper reading JOB APPLICATION"
        onError={
          sourceIndex < SOURCES.length - 1
            ? () => setSourceIndex((i) => i + 1)
            : undefined
        }
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <div className="home-full-vignette" aria-hidden />
      <div className="home-full-content">
        <p className="home-full-tagline">
          Organize every application from first send to final offer.
        </p>
        <div className="home-full-actions">
          <Link to="/signup" className="home-hero-btn home-hero-btn--primary">
            Get started free
          </Link>
          <Link to="/login" className="home-hero-btn home-hero-btn--ghost home-hero-btn--on-dark">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
