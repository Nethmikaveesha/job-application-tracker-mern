import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const body = { name, email }
    if (password.length > 0) {
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters')
        setLoading(false)
        return
      }
      body.password = password
    }
    try {
      const res = await api('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      toast.success(res.message || 'Profile updated')
      setPassword('')
      await refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>Profile</h1>
      <p className="muted">Update your name, email, or password</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          New password (optional)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Leave blank to keep current"
          />
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
