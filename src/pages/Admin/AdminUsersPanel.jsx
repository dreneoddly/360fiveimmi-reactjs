import { useEffect, useState } from 'react'
import { apiFetch } from './authApi'

const adminsEndpoint = (
  import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/$/, '') + '/admins'

async function readResponse(response) {
  const text = await response.text()
  let payload = {}

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      throw new Error('The admin API returned an invalid response.')
    }
  }

  if (!response.ok) {
    const validationMessage = Object.values(payload.errors || {})[0]?.[0]
    throw new Error(validationMessage || payload.message || 'Unable to complete this admin request.')
  }
  return payload
}

function AdminUsersPanel({ currentUser }) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [saving, setSaving] = useState(false)

  async function loadAdmins() {
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch(adminsEndpoint)
      const payload = await readResponse(response)
      setAdmins(payload.data)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load admin accounts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    apiFetch(adminsEndpoint)
      .then(readResponse)
      .then((payload) => {
        if (isCurrent) setAdmins(payload.data)
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message || 'Unable to load admin accounts.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  function openCreate() {
    setEditingAdmin(null)
    setForm({ name: '', email: '', password: '', password_confirmation: '' })
    setError('')
    setModalOpen(true)
  }

  function openEdit(admin) {
    setEditingAdmin(admin)
    setForm({ name: admin.name, email: admin.email, password: '', password_confirmation: '' })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const body = { name: form.name, email: form.email }
    if (!editingAdmin || form.password) {
      body.password = form.password
      body.password_confirmation = form.password_confirmation
    }

    try {
      const response = await apiFetch(
        editingAdmin ? `${adminsEndpoint}/${editingAdmin.id}` : adminsEndpoint,
        {
          method: editingAdmin ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      await readResponse(response)
      setModalOpen(false)
      setNotice(editingAdmin ? 'Admin account updated.' : 'Admin account created.')
      await loadAdmins()
    } catch (requestError) {
      setError(requestError.message || 'Unable to save admin account.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(admin) {
    if (admin.id === currentUser.id) {
      setError('You cannot remove your own admin account.')
      return
    }
    if (!window.confirm(`Remove admin access for ${admin.name}?`)) return
    setError('')
    setNotice('')

    try {
      const response = await apiFetch(`${adminsEndpoint}/${admin.id}`, { method: 'DELETE' })
      await readResponse(response)
      setNotice(`${admin.name} was removed from the admin accounts.`)
      await loadAdmins()
    } catch (requestError) {
      setError(requestError.message || 'Unable to remove admin account.')
    }
  }

  return (
    <section className="country-admin-panel admin-users-panel" aria-labelledby="admin-users-title">
      <div className="country-admin-panel-heading">
        <div>
          <h2 id="admin-users-title">All admin accounts</h2>
          <p>Create and manage who can sign in to this admin workspace.</p>
        </div>
        <button className="country-button country-button-primary" type="button" onClick={openCreate}>
          <span aria-hidden="true">＋</span> Add admin
        </button>
      </div>

      {notice && <div className="country-admin-notice admin-users-message" role="status">{notice}</div>}
      {error && <div className="country-admin-alert admin-users-message" role="alert">{error}</div>}

      <div className="country-admin-table-wrap">
        <table className="country-admin-table">
          <thead>
            <tr>
              <th scope="col">ADMIN</th>
              <th scope="col">EMAIL</th>
              <th scope="col">CREATED</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="country-admin-empty" colSpan="4">Loading admins…</td></tr>}
            {!loading && admins.map((admin) => (
              <tr key={admin.id}>
                <td>
                  <div className="country-admin-country-cell">
                    <span className="country-admin-avatar">{admin.name.slice(0, 2).toUpperCase()}</span>
                    <span className="country-admin-country-name">{admin.name}
                      {admin.id === currentUser.id && <small>Signed-in account</small>}
                    </span>
                  </div>
                </td>
                <td>{admin.email}</td>
                <td>{admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="country-admin-actions">
                    <button type="button" aria-label={`Edit ${admin.name}`} title="Edit admin" onClick={() => openEdit(admin)}>
                      <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m14 5 5 5M4 20l4.4-.9L19 8.5a2.1 2.1 0 0 0-3-3L5.4 16.1 4 20Z" /></svg>
                    </button>
                    <button className="country-admin-delete" type="button" aria-label={`Remove ${admin.name}`} title="Remove admin" disabled={admin.id === currentUser.id || admins.length <= 1} onClick={() => handleDelete(admin)}>
                      <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && admins.length === 0 && (
              <tr><td className="country-admin-empty" colSpan="4">No admin accounts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="country-admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModalOpen(false) }}>
          <section className="country-admin-modal admin-user-modal" role="dialog" aria-modal="true" aria-labelledby="admin-user-form-title">
            <header className="country-admin-modal-header">
              <div>
                <p className="country-admin-eyebrow">{editingAdmin ? 'EDIT ACCOUNT' : 'NEW ADMIN'}</p>
                <h2 id="admin-user-form-title">{editingAdmin ? 'Edit admin account' : 'Add an admin'}</h2>
              </div>
              <button type="button" aria-label="Close form" disabled={saving} onClick={() => setModalOpen(false)}>×</button>
            </header>
            <form className="admin-user-form" onSubmit={handleSubmit}>
              <div className="admin-user-form-fields">
                {error && <div className="country-admin-alert" role="alert">{error}</div>}
                <label className="country-field">
                  <span>Name <b>*</b></span>
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength="255" autoComplete="name" />
                </label>
                <label className="country-field">
                  <span>Email <b>*</b></span>
                  <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength="255" autoComplete="email" />
                </label>
                <label className="country-field">
                  <span>{editingAdmin ? 'New password (optional)' : 'Password'} {!editingAdmin && <b>*</b>}</span>
                  <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editingAdmin} minLength="12" autoComplete="new-password" />
                  {editingAdmin && <small>Leave blank to keep the current password.</small>}
                </label>
                <label className="country-field">
                  <span>Confirm password {!editingAdmin && <b>*</b>}</span>
                  <input type="password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} required={!editingAdmin || Boolean(form.password)} minLength="12" autoComplete="new-password" />
                </label>
                {!editingAdmin && <p className="admin-user-password-note">Use at least 12 characters. This account will be able to manage countries and admin accounts.</p>}
              </div>
              <footer className="country-form-footer">
                <button className="country-button country-button-quiet" type="button" disabled={saving} onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="country-button country-button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save admin'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default AdminUsersPanel
