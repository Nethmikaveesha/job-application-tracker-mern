// export default function ServicesPage() {
//   return (
//     <article className="public-page">
//       <h1>Services</h1>
//       <p>JobTracker supports your search with tools to:</p>
//       <ul>
//         <li>Store applications with company, role, and status</li>
//         <li>Browse open roles and apply with optional resume uploads</li>
//         <li>See dashboard summaries for pending, accepted, and rejected outcomes</li>
//         <li>Give admins visibility across users, jobs, and pipeline health</li>
//       </ul>
//       <p>Create a free account to explore the job seeker experience, or contact us for team setups.</p>
//     </article>
//   );
// }
export default function ServicesPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Sora:wght@300;400;500;600&display=swap');

        :root {
          --ink:       #0f0d0b;
          --ink-muted: #6b6560;
          --paper:     #faf7f2;
          --paper-mid: #f0ebe2;
          --gold:      #c9973a;
        }

        .public-page {
          max-width: 680px;
          margin: 0 auto;
          padding: 6rem 2rem 8rem;
          font-family: 'Sora', sans-serif;
          -webkit-font-smoothing: antialiased;
          animation: pageIn .6s ease both;
        }

        @keyframes pageIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

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

        .public-page p {
          font-size: 1.0625rem;
          line-height: 1.8;
          font-weight: 300;
          color: var(--ink-muted);
          margin-bottom: 1.25rem;
        }

        /* ── Services list ──────────────────────────── */
        .public-page ul {
          list-style: none;
          padding: 0;
          margin: 0 0 1.75rem;
          display: flex;
          flex-direction: column;
          gap: .75rem;
        }

        .public-page ul li {
          display: flex;
          align-items: flex-start;
          gap: .875rem;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.6;
          color: var(--ink);
          background: var(--paper-mid);
          border: 1px solid rgba(201,151,58,.18);
          border-left: 3px solid var(--gold);
          padding: .875rem 1.125rem;
          border-radius: 6px;
          transition: background .2s, border-color .2s;
        }

        .public-page ul li:hover {
          background: #ebe5d9;
          border-left-color: #e8b95a;
        }

        /* Gold bullet dot */
        .public-page ul li::before {
          content: '';
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold);
          flex-shrink: 0;
          margin-top: .48rem;
        }

        /* ── Responsive ─────────────────────────────── */
        @media (max-width: 640px) {
          .public-page { padding: 4rem 1.25rem 6rem; }
        }
      `}</style>

      <article className="public-page">
        <h1>Services</h1>

        <p>JobTracker supports your search with tools to:</p>

        <ul>
          <li>Store applications with company, role, and status</li>
          <li>Browse open roles and apply with optional resume uploads</li>
          <li>See dashboard summaries for pending, accepted, and rejected outcomes</li>
          <li>Give admins visibility across users, jobs, and pipeline health</li>
        </ul>

        <p>
          Create a free account to explore the job seeker experience, or contact
          us for team setups.
        </p>
      </article>
    </>
  );
}