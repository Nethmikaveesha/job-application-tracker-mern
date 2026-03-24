import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/client'

export default function AdminApplications() {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState({
    search: '',
    status: '',
    company: '',
    userId: '',
  })
  const [query, setQuery] = useState({
    search: '',
    status: '',
    company: '',
    userId: '',
  })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    q.set('page', String(page))
    q.set('limit', '20')
    if (query.search) q.set('search', query.search)
    if (query.status) q.set('status', query.status)
    if (query.company) q.set('company', query.company)
    if (query.userId) q.set('userId', query.userId)
    try {
      const res = await api(`/api/applications?${q}`)
      setRows(res.data || [])
      setPagination(res.pagination || { page: 1, pages: 1 })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, query])

  useEffect(() => {
    load()
  }, [load])

  function applyFilters(e) {
    e.preventDefault()
    setQuery({ ...draft })
    setPage(1)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>All applications</h1>
          <p className="muted">Filter by user, company, or status</p>
        </div>
      </header>

      <form className="filter-bar wrap" onSubmit={applyFilters}>
        <input
          type="search"
          placeholder="Search title / company"
          value={draft.search}
          onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Company"
          value={draft.company}
          onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
        />
        <input
          type="text"
          placeholder="User ID (Mongo ObjectId)"
          value={draft.userId}
          onChange={(e) => setDraft((d) => ({ ...d, userId: e.target.value }))}
        />
        <select
          value={draft.status}
          onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
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
        <p className="muted">No applications match.</p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a._id}>
                    <td>
                      {a.user?.name}
                      <br />
                      <span className="muted sm">{a.user?.email}</span>
                    </td>
                    <td>{a.job?.title}</td>
                    <td>{a.job?.company}</td>
                    <td>
                      <span className={`badge status-${a.status}`}>{a.status}</span>
                    </td>
                    <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/applications/${a._id}`} className="link">
                        Open
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
