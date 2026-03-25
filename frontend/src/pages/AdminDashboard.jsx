import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      try {
        const [statsRes, jobsRes, analyticsRes] = await Promise.all([
          api('/api/admin/stats'),
          api('/api/jobs?limit=8&sort=newest&page=1'),
          api('/api/admin/analytics'),
        ]);
        if (!cancelled) {
          setStats(statsRes.data || null);
          setAnalytics(analyticsRes.data || null);
          setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
          setJobsTotal(jobsRes.pagination?.total ?? jobsRes.data?.length ?? 0);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e.message || 'Could not load overview.';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="page admin-dashboard">
        <p className="muted">Loading overview…</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="page admin-dashboard">
        <header className="page-header">
          <div>
            <h1 className="admin-page-title">Overview</h1>
            <p className="muted">Welcome back, {user?.name || 'admin'}.</p>
          </div>
          <Link to="/" className="btn secondary">
            Marketing site
          </Link>
        </header>
        <div className="admin-empty" role="alert">
          <p>{error}</p>
          <p>
            <Link to="/">← Back to site</Link>
          </p>
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="page admin-dashboard">
      <header className="page-header">
        <div>
          <h1 className="admin-page-title">Overview</h1>
          <p className="muted">Welcome back, {user?.name || 'admin'}.</p>
          <p className="muted admin-overview-subline">
            Snapshot of registered accounts, open roles, and the application pipeline mirroring what
            seekers see on their dashboard, at platform scale.
          </p>
        </div>
        <Link to="/" className="btn secondary">
          Marketing site
        </Link>
      </header>

      <section className="stats-grid" aria-label="Platform summary">
        <div className="stat-card">
          <span className="stat-label">Registered users</span>
          <strong className="stat-value">{s.totalUsers ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Open roles</span>
          <strong className="stat-value">{s.totalJobs ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total applications</span>
          <strong className="stat-value">{s.totalApplications ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending review</span>
          <strong className="stat-value">{s.pending ?? 0}</strong>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Accepted</span>
          <strong className="stat-value">{s.accepted ?? 0}</strong>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">Rejected</span>
          <strong className="stat-value">{s.rejected ?? 0}</strong>
        </div>
      </section>

      {analytics?.topAppliedJobs?.length ? (
        <section className="admin-analytics-block" aria-label="Top applied jobs">
          <div className="admin-analytics-grid">
            <div className="admin-analytics-panel">
              <h3>Top applied jobs</h3>
              <div className="admin-analytics-table-wrap">
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Company</th>
                      <th>Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topAppliedJobs.map((j) => (
                      <tr key={j.jobId}>
                        <td>{j.title}</td>
                        <td>{j.company}</td>
                        <td>{j.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <p className="admin-page-lead admin-overview-lead">
        New roles can be added with an admin token via Job seekers browse
        the live list on{' '}
        <Link to="/jobs" className="link">
          Browse jobs
        </Link>
        .
      </p>

      {jobs.length === 0 ? (
        <section className="admin-jobs-block" aria-label="Posted jobs">
          <h2 className="admin-section-title">Recent open roles</h2>
          <div className="admin-empty">
            <p>
              <strong>No jobs in the database yet.</strong>
            </p>
            <p>
              Create jobs with a job seeker account 
            </p>
            <p>
              <Link to="/">← Back to site</Link>
            </p>
          </div>
        </section>
      ) : (
        <section className="admin-jobs-block section" aria-label="Posted jobs">
          <div className="section-head">
            <h2 className="admin-section-title">Recent open roles</h2>
            <Link to="/jobs" className="link">
              View as seeker
            </Link>
          </div>
          {jobsTotal > jobs.length && (
            <p className="muted admin-jobs-hint">
              Showing {jobs.length} of {jobsTotal} roles (newest first).
            </p>
          )}
          <div className="card-grid jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
