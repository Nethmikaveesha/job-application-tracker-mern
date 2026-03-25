import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const initial = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(initial);
  const [sending, setSending] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const first = Array.isArray(data.errors) ? data.errors[0]?.msg : null;
        throw new Error(first || data.message || 'Could not send message');
      }
      toast.success(data.message || 'Message sent. Thank you!');
      setForm(initial);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Sora:wght@300;400;500;600&display=swap');

        :root {
          --ink:       #0f0d0b;
          --ink-muted: #6b6560;
          --paper-mid: #f0ebe2;
          --gold:      #c9973a;
          --gold-light:#e8b95a;
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

        .public-page a {
          color: var(--gold);
          text-decoration: none;
          font-weight: 500;
        }

        .public-page a:hover {
          color: var(--gold-light);
          text-decoration: underline;
        }

        .public-page h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--ink);
          margin: 2.5rem 0 1rem;
          letter-spacing: -.02em;
        }

        .public-page .contact-form-hint {
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
        }

        .public-page .contact-field {
          margin-bottom: 1.125rem;
        }

        .public-page .contact-field label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ink);
          margin-bottom: 0.4rem;
        }

        .public-page .contact-field input,
        .public-page .contact-field textarea {
          width: 100%;
          box-sizing: border-box;
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          color: var(--ink);
          padding: 0.875rem 1.125rem;
          border-radius: 6px;
          border: 1px solid rgba(201,151,58,.18);
          border-left: 3px solid var(--gold);
          background: var(--paper-mid);
          transition: background .2s, border-color .2s;
        }

        .public-page .contact-field textarea {
          min-height: 140px;
          resize: vertical;
        }

        .public-page .contact-field input:hover,
        .public-page .contact-field textarea:hover {
          background: #ebe5d9;
          border-left-color: var(--gold-light);
        }

        .public-page .contact-field input:focus,
        .public-page .contact-field textarea:focus {
          outline: none;
          background: #fff;
          border-color: rgba(201,151,58,.35);
          border-left-color: var(--gold);
        }

        .public-page .contact-field input::placeholder,
        .public-page .contact-field textarea::placeholder {
          color: var(--ink-muted);
          font-weight: 300;
        }

        .public-page .contact-submit {
          margin-top: 0.5rem;
          padding: 0.85rem 1.5rem;
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          background: var(--gold);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background .2s;
        }

        .public-page .contact-submit:hover:not(:disabled) {
          background: var(--gold-light);
        }

        .public-page .contact-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .public-page { padding: 4rem 1.25rem 6rem; }
        }
      `}</style>

      <article className="public-page">
        <h1>Contact</h1>

        <p>
          Questions about JobTracker or feedback on the product? Reach out through your usual team
          channel, or email the project maintainer from your organization&apos;s support address.
        </p>

        <p>
          For demo access or admin setup, sign up and use the in-app flows, or ask an existing admin
          to invite you with the right role.
        </p>

        <h2>Send a message</h2>
        <p className="contact-form-hint">
          All fields are required. We typically reply within a few business days.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="contact-field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              type="text"
              name="subject"
              placeholder="What is this about?"
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              required
              maxLength={200}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              required
              maxLength={5000}
            />
          </div>
          <button type="submit" className="contact-submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <p>
          Prefer to self-serve? <Link to="/signup">Create an account</Link> to explore the job seeker
          experience.
        </p>
      </article>
    </>
  );
}
