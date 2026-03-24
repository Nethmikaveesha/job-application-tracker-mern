import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import toast from 'react-hot-toast'
import { api } from '../api/client'

const COLORS = ['#3b82f6', '#22c55e', '#ef4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [s, a] = await Promise.all([
          api('/api/admin/stats'),
          api('/api/admin/analytics'),
        ])
        if (!cancelled) {
          setStats(s.data)
          setAnalytics(a.data)
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
        <p className="muted">Loading…</p>
      </div>
    )
  }

  const pieData =
    analytics?.statusBreakdown?.map((x) => ({
      name: x.status,
      value: x.count,
    })) || []

  const barData = analytics?.applicationsPerCompany || []

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Admin dashboard</h1>
          <p className="muted">Overview of users, jobs, and applications</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Users</span>
          <strong className="stat-value">{stats?.totalUsers ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Jobs posted</span>
          <strong className="stat-value">{stats?.totalJobs ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Applications</span>
          <strong className="stat-value">{stats?.totalApplications ?? 0}</strong>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Accepted</span>
          <strong className="stat-value">{stats?.accepted ?? 0}</strong>
        </div>
        <div className="stat-card danger">
          <span className="stat-label">Rejected</span>
          <strong className="stat-value">{stats?.rejected ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <strong className="stat-value">{stats?.pending ?? 0}</strong>
        </div>
      </section>

      <div className="admin-quick-links">
        <Link to="/admin/users" className="btn secondary">
          Manage users
        </Link>
        <Link to="/admin/jobs" className="btn secondary">
          Manage jobs
        </Link>
        <Link to="/admin/applications" className="btn secondary">
          All applications
        </Link>
      </div>

      <div className="charts-grid">
        <section className="chart-card">
          <h2>Applications by company</h2>
          {barData.length === 0 ? (
            <p className="muted">No data yet</p>
          ) : (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="company"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
        <section className="chart-card">
          <h2>Status mix</h2>
          {pieData.length === 0 ? (
            <p className="muted">No data yet</p>
          ) : (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
