import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/client'

export default function ApplicationsPage() {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    company: '',
    page: 1,
  })

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filters.search) q.set('search', filters.search)
    if (filters.status) q.set('status', filters.status)
    if (filters.company) q.set('company', filters.company)
    q.set('page', String(filters.page))
    q.set('limit', '20')
    try {
      const res = await api(`/api/applications?${q}`)
      setRows(res.data || [])
      setPagination(res.pagination || { page: 1, pages: 1 })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>My applications</h1>
          <p className="muted">Filter by company, status, or keyword</p>
        </div>
        <Link to="/jobs" className="btn secondary">
          Find more jobs
        </Link>
      </header>

      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault()
          setFilters((f) => ({ ...f, page: 1 }))
        }}
      >
        <input
          type="search"
          placeholder="Company or title"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Company contains…"
          value={filters.company}
          onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value }))}
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))
          }
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="btn secondary">
          Apply filters
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No applications yet.</p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a._id}>
                    <td>{a.job?.title}</td>
                    <td>{a.job?.company}</td>
                    <td>
                      <span className={`badge status-${a.status}`}>{a.status}</span>
                    </td>
                    <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/applications/${a._id}`} className="link">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              type="button"
              className="btn ghost sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
              }
            >
              Previous
            </button>
            <span className="muted">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              className="btn ghost sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  page: Math.min(pagination.pages, f.page + 1),
                }))
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
