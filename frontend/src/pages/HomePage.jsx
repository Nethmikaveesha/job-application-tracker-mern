// import { useState } from 'react';
// import { Link } from 'react-router-dom';

// /** Put your photo in `public/hero-job-application.png` (preferred) or replace `hero-job-application.jpg`. */
// const HERO_PRIMARY = '/hero-job-application.png';
// const HERO_FALLBACK = '/hero-job-application.jpg';

// export default function HomePage() {
//   const [heroSrc, setHeroSrc] = useState(HERO_PRIMARY);

//   return (
//     <section className="home-hero">
//       <div className="home-hero-copy">
//         <h1>Track every job application in one place</h1>
//         <p>
//           Stay organized from first apply to final offer. Manage roles, statuses, and follow-ups
//           without losing track in spreadsheets or inboxes.
//         </p>
//         <div className="home-hero-actions">
//           <Link to="/signup" className="public-btn public-btn--primary">
//             Get started
//           </Link>
//           <Link to="/login" className="public-btn public-btn--outline">
//             Log in
//           </Link>
//         </div>
//       </div>
//       <div className="home-hero-media">
//         <img
//           src={heroSrc}
//           onError={() => setHeroSrc(HERO_FALLBACK)}
//           alt="Vintage typewriter with paper reading JOB APPLICATION"
//           width={800}
//           height={600}
//           loading="eager"
//         />
//       </div>
//     </section>
//   );
// }

