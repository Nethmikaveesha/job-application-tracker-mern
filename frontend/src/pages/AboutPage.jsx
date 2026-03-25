// export default function AboutPage() {
//   return (
//     <article className="public-page">
//       <h1>About</h1>
//       <p>
//         JobTracker helps job seekers and teams keep applications structured and visible. We built it
//         around simple workflows: record where you applied, track status, and revisit details when
//         recruiters follow up.
//       </p>
//       <p>
//         Whether you are early in your search or juggling many interviews, a single source of truth
//         saves time and reduces stress.
//       </p>
//     </article>
//   );
// }
export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Sora:wght@300;400;500;600&display=swap');

        :root {
          --ink:       #0f0d0b;
          --ink-muted: #6b6560;
          --gold:      #c9973a;
        }

        body {
          margin: 0;
          font-family: 'Sora', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Page shell ─────────────────────────────── */
        .public-page {
          max-width: 680px;
          margin: 0 auto;
          padding: 6rem 2rem 8rem;
          animation: pageIn .6s ease both;
        }

        @keyframes pageIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Heading ────────────────────────────────── */
        .public-page h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          letter-spacing: -.02em;
          line-height: 1.15;
          color: var(--ink);
          margin-bottom: 2rem;
          position: relative;
          padding-bottom: 1.25rem;
        }

        /* Gold line under heading */
        .public-page h1::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 3rem;
          height: 2.5px;
          background: var(--gold);
          border-radius: 2px;
        }

        /* ── Body text ──────────────────────────────── */
        .public-page p {
          font-size: 1.0625rem;
          line-height: 1.8;
          font-weight: 300;
          color: var(--ink-muted);
          margin-bottom: 1.25rem;
        }

        /* ── Responsive ─────────────────────────────── */
        @media (max-width: 640px) {
          .public-page {
            padding: 4rem 1.25rem 6rem;
          }
        }
      `}</style>

      <article className="public-page">
        <h1>About</h1>

        <p>
          JobTracker helps job seekers and teams keep applications structured
          and visible. We built it around simple workflows: record where you
          applied, track status, and revisit details when recruiters follow up.
        </p>

        <p>
          Whether you are early in your search or juggling many interviews,
          having a single source of truth saves time and reduces stress.
        </p>
      </article>
    </>
  );
}
