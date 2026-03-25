import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, uploadsUrl } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [notes, setNotes] = useState('')
  const [adminStatus, setAdminStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverLetterFile, setCoverLetterFile] = useState(null)
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false)

  const owns =
    data &&
    user &&
    String(data.user?._id || data.user) === String(user.id)

  const isAdmin = user?.role === 'admin'
  const canEditNotes = (user?.role === 'job_seeker' && owns) || isAdmin
  const canUploadCoverLetter = user?.role === 'job_seeker' && owns

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api(`/api/applications/${id}`)
        if (!cancelled) {
          setData(res.data)
          setNotes(res.data.notes || '')
          setAdminStatus(res.data.status || 'pending')
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
  }, [id])

  async function saveNotes() {
    setSaving(true)
    try {
      const res = await api(`/api/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      })
      setData(res.data)
      toast.success(res.message || 'Saved')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus() {
    setSaving(true)
    try {
      const res = await api(`/api/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: adminStatus }),
      })
      setData(res.data)
      toast.success(res.message || 'Status updated')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm('Delete this application?')) return
    try {
      await api(`/api/applications/${id}`, { method: 'DELETE' })
      toast.success('Application removed')
      navigate(isAdmin ? '/admin/applications' : '/applications')
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function uploadCoverLetter() {
    if (!coverLetterFile) {
      toast.error('Please select a cover letter file')
      return
    }
    setUploadingCoverLetter(true)
    try {
      const fd = new FormData()
      fd.append('coverLetter', coverLetterFile)
      const res = await api(`/api/applications/${id}/cover-letter`, {
        method: 'PATCH',
        body: fd,
      })
      setData(res.data)
      setCoverLetterFile(null)
      toast.success(res.message || 'Cover letter updated')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setUploadingCoverLetter(false)
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>
  if (!data) return <div className="page"><p>Not found</p></div>

  const job = data.job
  const applicant = data.user
  const websiteUrl = data.website
    ? String(data.website).startsWith('http')
      ? data.website
      : `https://${data.website}`
    : ''

  return (
    <div className="page narrow">
      <Link
        to={isAdmin ? '/admin/applications' : '/applications'}
        className="back-link"
      >
        ← Back
      </Link>
      <header className="detail-header">
        <h1>{job?.title}</h1>
        <p className="company">{job?.company}</p>
        <span className={`badge status-${data.status}`}>{data.status}</span>
      </header>

      <dl className="detail-list">
        <dt>Applied</dt>
        <dd>{new Date(data.appliedAt).toLocaleString()}</dd>
        {job?.location ? (
          <>
            <dt>Location</dt>
            <dd>{job.location}</dd>
          </>
        ) : null}
        <dt>Type</dt>
        <dd>{job?.employmentType}</dd>
        {data.phone ? (
          <>
            <dt>Phone</dt>
            <dd>{data.phone}</dd>
          </>
        ) : null}
        {data.website ? (
          <>
            <dt>Website</dt>
            <dd>
              <a href={websiteUrl} target="_blank" rel="noreferrer">
                {data.website}
              </a>
            </dd>
          </>
        ) : null}
        {isAdmin && applicant && (
          <>
            <dt>Applicant</dt>
            <dd>
              {applicant.name} ({applicant.email})
            </dd>
          </>
        )}
      </dl>

      {isAdmin && (
        <section className="section admin-box">
          <h2>Update status</h2>
          <div className="inline-actions">
            <select
              value={adminStatus}
              onChange={(e) => setAdminStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              type="button"
              className="btn primary"
              onClick={updateStatus}
              disabled={saving}
            >
              Save status
            </button>
          </div>
        </section>
      )}

      {job?.description ? (
        <section className="section">
          <h2>Job description</h2>
          <div className="prose">{job.description}</div>
        </section>
      ) : null}

      <section className="section">
        <h2>Notes</h2>
        {canEditNotes ? (
          <>
            <textarea
              className="full"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
            />
            <button
              type="button"
              className="btn primary"
              onClick={saveNotes}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save notes'}
            </button>
          </>
        ) : (
          <p>{data.notes || '—'}</p>
        )}
      </section>

      {(data.resumePath || data.coverLetterPath || canUploadCoverLetter) && (
        <section className="section">
          <h2>Files</h2>
          <ul className="file-links">
            {data.resumePath ? (
              <li>
                <a href={uploadsUrl(data.resumePath)} target="_blank" rel="noreferrer">
                  Resume
                </a>
              </li>
            ) : null}
            {data.coverLetterPath ? (
              <li>
                <a
                  href={uploadsUrl(data.coverLetterPath)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Cover letter
                </a>
              </li>
            ) : null}
          </ul>

          {canUploadCoverLetter && (
            <div className="inline-actions" style={{ marginTop: '0.75rem' }}>
              <label>
                Replace cover letter
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) =>
                    setCoverLetterFile(e.target.files?.[0] || null)
                  }
                />
              </label>
              <button
                type="button"
                className="btn primary"
                disabled={uploadingCoverLetter}
                onClick={uploadCoverLetter}
              >
                {uploadingCoverLetter ? 'Uploading…' : 'Upload cover letter'}
              </button>
            </div>
          )}
        </section>
      )}

      {(canEditNotes || isAdmin) && (
        <button type="button" className="btn danger ghost" onClick={remove}>
          Delete application
        </button>
      )}
    </div>
  )
}
