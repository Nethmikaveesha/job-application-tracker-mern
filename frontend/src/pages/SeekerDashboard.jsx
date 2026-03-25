import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function SeekerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const results = await Promise.allSettled([
          api('/api/applications/stats/me'),
          api('/api/applications?limit=5'),
          api('/api/notifications?limit=5'),
        ])
        if (cancelled) return

        const [sRes, appsRes, nRes] = results

        if (sRes.status === 'fulfilled') setStats(sRes.value.data)
        else toast.error(sRes.reason?.message || 'Failed to load application stats')

        if (appsRes.status === 'fulfilled') setRecent(appsRes.value.data || [])
        else toast.error(appsRes.reason?.message || 'Failed to load recent applications')

        if (nRes.status === 'fulfilled') {
          setUnreadCount(nRes.value.unreadCount ?? 0)
          setNotifications(Array.isArray(nRes.value.items) ? nRes.value.items : [])
        } else {
          // Notifications are optional for the dashboard; don't block stats/recent.
          setUnreadCount(0)
          setNotifications([])
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

  async function markAllRead() {
    try {
      const res = await api('/api/notifications?limit=50')
      const items = Array.isArray(res.items) ? res.items : []
      const unread = items.filter((x) => !x.read)
      await Promise.all(
        unread.map((x) => api(`/api/notifications/${x._id}/read`, { method: 'PATCH' }))
      )
      const updated = await api('/api/notifications?limit=5')
      setUnreadCount(updated.unreadCount ?? 0)
      setNotifications(Array.isArray(updated.items) ? updated.items : [])
      toast.success('Notifications marked as read')
    } catch (e) {
      toast.error(e.message || 'Failed to mark notifications as read')
    }
  }

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
          <h1>Welcome, {user?.name || 'there'}</h1>
          <p className="muted">Track your job search at a glance</p>
          {unreadCount > 0 ? (
            <p className="muted">
              You have <strong>{unreadCount}</strong> new notification{unreadCount === 1 ? '' : 's'}.
            </p>
          ) : null}
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
          <h2>Notifications</h2>
          {unreadCount > 0 ? (
            <button type="button" className="btn ghost sm" onClick={markAllRead}>
              Mark all read
            </button>
          ) : null}
        </div>
        {notifications.length === 0 ? (
          <p className="muted empty-hint">No notifications yet.</p>
        ) : (
          <div className="prose">
            <ul>
              {notifications.map((n) => (
                <li key={n._id}>
                  <strong>{n.read ? 'Read' : 'New'}:</strong> {n.message}
                </li>
              ))}
            </ul>
          </div>
        )}
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
