import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false)
  const [twoFaToken, setTwoFaToken] = useState('')
  const [twoFaSecret, setTwoFaSecret] = useState('')
  const [twoFaOtpauthUrl, setTwoFaOtpauthUrl] = useState('')
  const [twoFaBusy, setTwoFaBusy] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setTwoFactorEnabled(Boolean(user.twoFactorEnabled))
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

  async function setup2FA() {
    setTwoFaBusy(true)
    try {
      const res = await api('/api/users/me/2fa/setup', { method: 'POST' })
      setTwoFaSecret(res.twoFactorSecret || '')
      setTwoFaOtpauthUrl(res.otpauthUrl || '')
      setTwoFactorEnabled(false)
      toast.success('2FA secret generated. Enter code to enable.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTwoFaBusy(false)
    }
  }

  async function enable2FA() {
    if (twoFaToken.trim().length === 0) {
      toast.error('Enter the 6-digit 2FA code')
      return
    }
    setTwoFaBusy(true)
    try {
      const res = await api('/api/users/me/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ token: twoFaToken.trim() }),
      })
      toast.success(res.message || '2FA enabled')
      setTwoFactorEnabled(Boolean(res.twoFactorEnabled))
      setTwoFaToken('')
      await refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTwoFaBusy(false)
    }
  }

  async function disable2FA() {
    setTwoFaBusy(true)
    try {
      const res = await api('/api/users/me/2fa/disable', { method: 'POST' })
      toast.success(res.message || '2FA disabled')
      setTwoFactorEnabled(false)
      setTwoFaSecret('')
      setTwoFaOtpauthUrl('')
      setTwoFaToken('')
      await refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTwoFaBusy(false)
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

      <section className="section">
        <h2>Two-factor authentication (2FA)</h2>
        <p className="muted">Optional TOTP. If enabled, you will need a 6-digit code during login.</p>

        {twoFactorEnabled ? (
          <div className="inline-actions">
            <span className="badge status-accepted">Enabled</span>
            <button
              type="button"
              className="btn ghost"
              disabled={twoFaBusy}
              onClick={disable2FA}
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          <>
            <div className="inline-actions">
              <button
                type="button"
                className="btn secondary"
                disabled={twoFaBusy}
                onClick={setup2FA}
              >
                {twoFaBusy ? 'Working…' : 'Set up 2FA'}
              </button>
            </div>

            {twoFaSecret ? (
              <div className="card form-card" style={{ padding: '1rem', marginTop: '0.75rem' }}>
                <p className="muted sm">Secret (Base32):</p>
                <p>
                  <code>{twoFaSecret}</code>
                </p>
                <p className="muted sm">OTPAUTH URI:</p>
                <p className="sm">
                  <code>{twoFaOtpauthUrl}</code>
                </p>
                <label>
                  6-digit code
                  <input
                    value={twoFaToken}
                    onChange={(e) => setTwoFaToken(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </label>
                <button
                  type="button"
                  className="btn primary"
                  disabled={twoFaBusy}
                  onClick={enable2FA}
                >
                  Enable 2FA
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
