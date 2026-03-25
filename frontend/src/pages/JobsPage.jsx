import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const types = [
  { value: '', label: 'All types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [favoriteJobIds, setFavoriteJobIds] = useState(new Set())
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employmentType: '',
    sort: 'newest',
    page: 1,
  })

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filters.search) q.set('search', filters.search)
    if (filters.location) q.set('location', filters.location)
    if (filters.employmentType) q.set('employmentType', filters.employmentType)
    if (filters.sort) q.set('sort', filters.sort)
    q.set('page', String(filters.page))
    q.set('limit', '12')
    try {
      const res = await api(`/api/jobs?${q}`)
      setJobs(res.data || [])
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

  useEffect(() => {
    let cancelled = false
    async function loadFavorites() {
      try {
        if (!user) return
        const res = await api('/api/users/me/favorites')
        const ids = Array.isArray(res.data) ? res.data.map((x) => String(x)) : []
        if (!cancelled) setFavoriteJobIds(new Set(ids))
      } catch (e) {
        if (!cancelled) toast.error(e.message || 'Failed to load favorites')
      }
    }
    loadFavorites()
    return () => {
      cancelled = true
    }
  }, [user])

  async function toggleFavorite(jobId) {
    if (!user) return
    const idStr = String(jobId)
    const isFav = favoriteJobIds.has(idStr)
    try {
      if (isFav) {
        await api(`/api/users/me/favorites/${idStr}`, { method: 'DELETE' })
      } else {
        await api('/api/users/me/favorites', {
          method: 'POST',
          body: JSON.stringify({ jobId: idStr }),
        })
      }
      const res = await api('/api/users/me/favorites')
      const ids = Array.isArray(res.data) ? res.data.map((x) => String(x)) : []
      setFavoriteJobIds(new Set(ids))
    } catch (e) {
      toast.error(e.message || 'Failed to update favorite')
    }
  }

  function submitFilter(e) {
    e.preventDefault()
    setFilters((f) => ({ ...f, page: 1 }))
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Browse jobs</h1>
          <p className="muted">Search by role, company, or location</p>
        </div>
      </header>

      <form className="filter-bar" onSubmit={submitFilter}>
        <input
          type="search"
          className="filter-bar-search"
          placeholder="Search title, company…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          aria-label="Search job title or company"
        />
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
        />
        <select
          value={filters.employmentType}
          onChange={(e) =>
            setFilters((f) => ({ ...f, employmentType: e.target.value, page: 1 }))
          }
        >
          {types.map((t) => (
            <option key={t.value || 'all'} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))
          }
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="company">Company A–Z</option>
        </select>
        <button type="submit" className="btn secondary">
          Search
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p className="muted">No jobs match your filters.</p>
      ) : (
        <>
          <div className="card-grid jobs-grid">
            {jobs.map((job) => (
              <article key={job._id} className="job-card">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                <p className="meta">
                  {job.location || 'Remote / unspecified'} · {job.employmentType}
                </p>
                <p className="desc-preview">
                  {(job.description || '').slice(0, 140)}
                  {(job.description || '').length > 140 ? '…' : ''}
                </p>
                <button
                  type="button"
                  className={favoriteJobIds.has(String(job._id)) ? 'btn primary ghost sm' : 'btn ghost sm'}
                  onClick={() => toggleFavorite(job._id)}
                >
                  {favoriteJobIds.has(String(job._id)) ? 'Saved' : 'Save'}
                </button>
                <Link to={`/jobs/${job._id}/apply`} className="btn primary sm">
                  Apply
                </Link>
              </article>
            ))}
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
