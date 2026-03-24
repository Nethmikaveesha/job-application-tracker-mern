import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api/client'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams({ page: String(page), limit: '15' })
    if (search.trim()) q.set('search', search.trim())
    try {
      const res = await api(`/api/users?${q}`)
      setUsers(res.data || [])
      setPagination(res.pagination || { page: 1, pages: 1 })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    load()
  }, [load])

  async function setRole(userId, role) {
    try {
      await api(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
      toast.success('Role updated')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function removeUser(userId) {
    if (!confirm('Delete this user? Their applications remain in the database.'))
      return
    try {
      await api(`/api/users/${userId}`, { method: 'DELETE' })
      toast.success('User deleted')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p className="muted">Assign admin privileges or remove accounts</p>
        </div>
      </header>

      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(searchInput)
          setPage(1)
        }}
      >
        <input
          type="search"
          placeholder="Search name or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn secondary">
          Search
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => setRole(u._id, e.target.value)}
                        className="inline-select"
                      >
                        <option value="job_seeker">Job seeker</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn danger ghost sm"
                        onClick={() => removeUser(u._id)}
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
