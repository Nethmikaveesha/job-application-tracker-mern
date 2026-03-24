import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/client'

export default function SeekerDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [s, apps] = await Promise.all([
          api('/api/applications/stats/me'),
          api('/api/applications?limit=5'),
        ])
        if (!cancelled) {
          setStats(s.data)
          setRecent(apps.data || [])
        }
      } catch (e) {
        if (!cancelled) toast.error(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Track your job search at a glance</p>
        </div>
        <Link to="/jobs" className="btn primary">
          Browse jobs
        </Link>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total applied</span>
          <strong className="stat-value">{stats?.total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <strong className="stat-value">{stats?.pending ?? 0}</strong>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Accepted</span>
          <strong className="stat-value">{stats?.accepted ?? 0}</strong>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">Rejected</span>
          <strong className="stat-value">{stats?.rejected ?? 0}</strong>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Recent applications</h2>
          <Link to="/applications" className="link">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted empty-hint">
            You have not applied yet.{' '}
            <Link to="/jobs">Find a job to apply</Link>.
          </p>
        ) : (
          <div className="card-grid">
            {recent.map((a) => (
              <Link
                key={a._id}
                to={`/applications/${a._id}`}
                className="app-card"
              >
                <div className="app-card-top">
                  <h3>{a.job?.title}</h3>
                  <span className={`badge status-${a.status}`}>{a.status}</span>
                </div>
                <p className="company">{a.job?.company}</p>
                <p className="meta">
                  Applied {new Date(a.appliedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
