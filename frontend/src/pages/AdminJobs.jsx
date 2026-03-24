import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api/client'

const emptyForm = {
  title: '',
  company: '',
  location: '',
  employmentType: 'full-time',
  description: '',
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams({ page: String(page), limit: '20', sort: 'newest' })
    try {
      const res = await api(`/api/jobs?${q}`)
      setJobs(res.data || [])
      setPagination(res.pagination || { page: 1, pages: 1 })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  function startEdit(job) {
    setEditingId(job._id)
    setForm({
      title: job.title,
      company: job.company,
      location: job.location || '',
      employmentType: job.employmentType,
      description: job.description || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const res = await api(`/api/jobs/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        toast.success(res.message || 'Job updated')
      } else {
        const res = await api('/api/jobs', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        toast.success(res.message || 'Job created')
      }
      cancelEdit()
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeJob(id) {
    if (!confirm('Delete this job?')) return
    try {
      await api(`/api/jobs/${id}`, { method: 'DELETE' })
      toast.success('Job deleted')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Jobs</h1>
          <p className="muted">Create and manage job postings</p>
        </div>
      </header>

      <section className="card form-card">
        <h2>{editingId ? 'Edit job' : 'Add job'}</h2>
        <form onSubmit={handleSubmit} className="form grid-form">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              maxLength={200}
            />
          </label>
          <label>
            Company
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              required
              maxLength={120}
            />
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              maxLength={120}
            />
          </label>
          <label>
            Employment type
            <select
              value={form.employmentType}
              onChange={(e) =>
                setForm((f) => ({ ...f, employmentType: e.target.value }))
              }
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </label>
          <label className="full-width">
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              maxLength={8000}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update job' : 'Create job'}
            </button>
            {editingId && (
              <button type="button" className="btn ghost" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location || '—'}</td>
                    <td>{job.employmentType}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn ghost sm"
                        onClick={() => startEdit(job)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn danger ghost sm"
                        onClick={() => removeJob(job._id)}
                      >
                        Delete
                      </button>
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
              disabled={page <= 1}
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
              disabled={page >= pagination.pages}
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
