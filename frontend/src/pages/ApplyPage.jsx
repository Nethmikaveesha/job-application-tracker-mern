import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, getToken } from '../api/client'

export default function ApplyPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [notes, setNotes] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [resume, setResume] = useState(null)
  const [coverLetter, setCoverLetter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api(`/api/jobs/${jobId}`)
        if (!cancelled) setJob(res.data)
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
  }, [jobId])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData()
    fd.append('jobId', jobId)
    fd.append('notes', notes)
    if (phone.trim()) fd.append('phone', phone.trim())
    if (website.trim()) fd.append('website', website.trim())
    if (resume) fd.append('resume', resume)
    if (coverLetter) fd.append('coverLetter', coverLetter)

    try {
      const token = getToken()
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Apply failed')
      toast.success(data.message || 'Application submitted')
      navigate(`/applications/${data.data._id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>
  if (!job) {
    return (
      <div className="page">
        <p>Job not found.</p>
        <Link to="/jobs">Back to jobs</Link>
      </div>
    )
  }

  return (
    <div className="page narrow">
      <Link to="/jobs" className="back-link">
        ← Back to jobs
      </Link>
      <h1>Apply</h1>
      <p className="lead">
        <strong>{job.title}</strong> at {job.company}
      </p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Why you are a good fit…"
          />
        </label>
        <label>
          Phone (optional)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            placeholder="e.g. +1 555 123 4567"
          />
        </label>
        <label>
          Website (optional)
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            maxLength={200}
            placeholder="LinkedIn or portfolio URL"
          />
        </label>
        <label>
          Resume (PDF or Word, max 5MB)
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
          />
        </label>
        <label>
          Cover letter (optional)
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setCoverLetter(e.target.files?.[0] || null)}
          />
        </label>
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
    </div>
  )
}
