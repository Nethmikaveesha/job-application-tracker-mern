import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/jobs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setJobs(Array.isArray(data?.data) ? data.data : []);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load jobs. Is the API running?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <h1 className="admin-page-title">Admin — {user?.name}</h1>
      <p className="muted">
        All posted roles. Add jobs via your API or a future admin jobs UI. Job seekers see these on
        Browse jobs.
      </p>

      {loading && <p className="muted">Loading jobs…</p>}
      {error && <p className="admin-empty">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <div className="admin-empty">
          <p>
            <strong>No jobs in the database yet.</strong>
          </p>
          <p>
            Create jobs through MongoDB/Postman or ask your dev to use{' '}
            <code>POST /api/jobs</code> (admin token required).
          </p>
          <p style={{ marginBottom: 0 }}>
            <Link to="/">← Back to site</Link>
          </p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="card-grid jobs-grid" style={{ marginTop: '1.5rem' }}>
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
