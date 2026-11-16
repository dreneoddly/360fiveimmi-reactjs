import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from './authApi'
import AdminSidebar from './AdminSidebar'
import './CountryAdminPage.css'

const updatesEndpoint = import.meta.env.VITE_UPDATES_API_URL || (
  `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')}/updates`
)
const pageSize = 8
const emptyUpdate = {
  title: '',
  published_at: '',
  description: '',
  paragraphs: '',
}

function UpdatesIcon({ name, size = 18 }) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></>,
    services: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    updates: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m21 15-5-5L5 19" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.4-.9L19 8.5a2.1 2.1 0 0 0-3-3L5.4 16.1 4 20Z" /></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  }

  return (
    <svg aria-hidden="true" className="country-admin-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function UpdateImageUpload({ existingImage, required, onChange }) {
  const [preview, setPreview] = useState('')

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  function handleChange(event) {
    const file = event.target.files?.[0] || null
    setPreview(file ? URL.createObjectURL(file) : '')
    onChange(file)
  }

  return (
    <label className="country-field country-field-wide">
      <span>Article image {required && <b>*</b>}</span>
      {(preview || existingImage) && (
        <div className="country-image-preview">
          <img src={preview || existingImage} alt="Article image preview" />
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
        required={required}
        onChange={handleChange}
      />
      <small>Choose an image file up to 5 MB{existingImage ? '. Select a file to replace the current image.' : '.'}</small>
    </label>
  )
}

async function readResponse(response) {
  const text = await response.text()
  let payload = {}
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      throw new Error('The updates API returned an invalid response.')
    }
  }

  if (!response.ok || payload?.error) {
    const validationMessage = Object.values(payload.errors || {})[0]?.[0]
    throw new Error(validationMessage || payload?.message || `Request failed with status ${response.status}.`)
  }
  return payload
}

function getRows(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data
  if (!Array.isArray(rows)) {
    throw new Error('The updates API response did not contain an update list.')
  }
  return rows
}

function UpdatesAdminPage({ user }) {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState(null)
  const [form, setForm] = useState(emptyUpdate)
  const [imageFile, setImageFile] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  async function loadUpdates() {
    setLoading(true)
    setLoadError('')
    try {
      const response = await apiFetch(updatesEndpoint)
      setUpdates(getRows(await readResponse(response)))
    } catch (error) {
      setLoadError(error.message || 'Unable to load updates.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    apiFetch(updatesEndpoint)
      .then(readResponse)
      .then((payload) => {
        if (isCurrent) setUpdates(getRows(payload))
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message || 'Unable to load updates.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredUpdates = useMemo(() => {
    const query = search.trim().toLowerCase()
    return updates.filter((update) =>
      [update.title, update.description]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    )
  }, [updates, search])

  const totalPages = Math.max(1, Math.ceil(filteredUpdates.length / pageSize))
  const visibleUpdates = filteredUpdates.slice((page - 1) * pageSize, page * pageSize)

  function openCreateForm() {
    setEditingUpdate(null)
    setForm({ ...emptyUpdate })
    setImageFile(null)
    setFormError('')
    setFormOpen(true)
  }

  function openEditForm(update) {
    setEditingUpdate(update)
    setForm({
      ...emptyUpdate,
      ...update,
      published_at: update.published_at?.slice(0, 10) || '',
      paragraphs: Array.isArray(update.paragraphs) ? update.paragraphs.join('\n') : '',
    })
    setImageFile(null)
    setFormError('')
    setFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const body = new FormData()
    body.append('title', form.title)
    body.append('published_at', form.published_at)
    body.append('description', form.description)
    form.paragraphs.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
      .forEach((paragraph, index) => body.append(`paragraphs[${index}]`, paragraph))
    if (imageFile) body.append('image_file', imageFile)
    if (editingUpdate) body.append('_method', 'PUT')

    try {
      const response = await apiFetch(
        editingUpdate
          ? `${updatesEndpoint}/${encodeURIComponent(editingUpdate.id)}`
          : updatesEndpoint,
        { method: 'POST', body },
      )
      await readResponse(response)
      setFormOpen(false)
      setPage(1)
      setNotice(editingUpdate ? 'Update article saved successfully.' : 'Update article created successfully.')
      await loadUpdates()
    } catch (error) {
      setFormError(error.message || 'Unable to save update article.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(update) {
    if (!window.confirm(`Delete "${update.title}"? This action cannot be undone.`)) return
    setDeletingId(update.id)
    setNotice('')
    setActionError('')

    try {
      const response = await apiFetch(`${updatesEndpoint}/${encodeURIComponent(update.id)}`, {
        method: 'DELETE',
      })
      await readResponse(response)
      setNotice(`"${update.title}" was deleted.`)
      setPage(1)
      await loadUpdates()
    } catch (error) {
      setActionError(error.message || `Unable to delete "${update.title}".`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="country-admin">
      <AdminSidebar user={user} />

      <div className="country-admin-main">
        <header className="country-admin-topbar">
          <div className="country-admin-breadcrumb">Admin <span>/</span> Updates</div>
          <Link className="country-admin-view-site" to="/updates">View website <UpdatesIcon name="arrow" size={16} /></Link>
        </header>
        <section className="country-admin-content">
          <div className="country-admin-heading">
            <div>
              <p className="country-admin-eyebrow">CONTENT MANAGEMENT</p>
              <h1>Updates</h1>
              <p className="country-admin-subtitle">Manage update articles and their public detail pages.</p>
            </div>
            <button className="country-button country-button-primary" type="button" onClick={openCreateForm}><UpdatesIcon name="plus" size={17} /> Add update</button>
          </div>
          <div className="country-admin-stats">
            <article className="country-admin-stat">
              <div className="country-admin-stat-icon stat-icon-blue"><UpdatesIcon name="updates" size={20} /></div>
              <div><span>Total updates</span><strong>{updates.length}</strong></div>
              <small>Published articles</small>
            </article>
          </div>
          {notice && <div className="country-admin-notice" role="status">{notice}</div>}
          {actionError && <div className="country-admin-alert country-admin-load-error" role="alert">{actionError}</div>}
          {loadError && (
            <div className="country-admin-alert country-admin-load-error" role="alert">
              <span>{loadError}</span><button type="button" onClick={loadUpdates}>Try again</button>
            </div>
          )}

          <section className="country-admin-panel" aria-label="Update articles">
            <div className="country-admin-panel-heading">
              <div><h2>All updates</h2><p>Review, create, and manage articles shown on the website.</p></div>
              <div className="country-admin-search">
                <UpdatesIcon name="updates" size={17} />
                <input aria-label="Search updates" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search updates..." />
              </div>
            </div>
            <div className="country-admin-toolbar">
              <span className="country-admin-result-count">{filteredUpdates.length} {filteredUpdates.length === 1 ? 'article' : 'articles'}</span>
            </div>
            <div className="country-admin-table-wrap">
              <table className="country-admin-table">
                <thead><tr><th scope="col">ARTICLE</th><th scope="col">PUBLISHED</th><th scope="col">DESCRIPTION</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading && <tr><td className="country-admin-empty" colSpan="4">Loading updates…</td></tr>}
                  {!loading && !loadError && visibleUpdates.map((update) => (
                    <tr key={update.id}>
                      <td>
                        <div className="country-admin-country-cell">
                          <span className="country-admin-flag">{update.image ? <img src={update.image} alt="" /> : <UpdatesIcon name="updates" size={17} />}</span>
                          <span className="country-admin-country-name">{update.title || 'Untitled update'}<small>{update.paragraphs?.length || 0} content paragraphs</small></span>
                        </div>
                      </td>
                      <td>{update.published_at || <span className="country-admin-muted">Not set</span>}</td>
                      <td><span className="country-admin-benefit">{update.description || <span className="country-admin-muted">No description</span>}</span></td>
                      <td><div className="country-admin-actions">
                        <button type="button" aria-label={`Edit ${update.title}`} title="Edit article" onClick={() => openEditForm(update)}><UpdatesIcon name="edit" size={17} /></button>
                        <button className="country-admin-delete" type="button" aria-label={`Delete ${update.title}`} title="Delete article" disabled={deletingId === update.id} onClick={() => handleDelete(update)}><UpdatesIcon name="trash" size={17} /></button>
                      </div></td>
                    </tr>
                  ))}
                  {!loading && !loadError && visibleUpdates.length === 0 && (
                    <tr><td className="country-admin-empty" colSpan="4">{search ? 'No updates match your search.' : 'No update articles yet. Add one to get started.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="country-admin-pagination">
              <span>Showing <strong>{filteredUpdates.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredUpdates.length)}</strong> of <strong>{filteredUpdates.length}</strong></span>
              <div>
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </footer>
          </section>
        </section>
      </div>

      {formOpen && (
        <div className="country-admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false) }}>
          <section className="country-admin-modal" role="dialog" aria-modal="true" aria-labelledby="update-form-title">
            <header className="country-admin-modal-header">
              <div><p className="country-admin-eyebrow">{editingUpdate ? 'EDIT UPDATE' : 'NEW UPDATE'}</p><h2 id="update-form-title">{editingUpdate ? 'Edit article' : 'Add an update'}</h2></div>
              <button type="button" aria-label="Close form" disabled={saving} onClick={() => setFormOpen(false)}><UpdatesIcon name="close" /></button>
            </header>
            <form className="country-form" onSubmit={handleSubmit}>
              <div className="country-form-scroll">
                {formError && <div className="country-admin-alert" role="alert">{formError}</div>}
                <div className="country-form-section">
                  <h3>Article information</h3>
                  <p>Write the update headline and the short description used in article cards.</p>
                  <div className="country-form-grid">
                    <label className="country-field country-field-wide">
                      <span>Title <b>*</b></span>
                      <input value={form.title} required maxLength="255" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                    </label>
                    <label className="country-field">
                      <span>Publication date</span>
                      <input type="date" value={form.published_at} onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))} />
                    </label>
                    <label className="country-field country-field-wide">
                      <span>Card description <b>*</b></span>
                      <textarea value={form.description} required rows="3" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                    </label>
                    <UpdateImageUpload
                      existingImage={editingUpdate?.image}
                      required={!editingUpdate?.image}
                      onChange={setImageFile}
                    />
                  </div>
                </div>
                <div className="country-form-section">
                  <h3>Article content</h3>
                  <p>Add the full article text, one paragraph per line.</p>
                  <div className="country-form-grid">
                    <label className="country-field country-field-wide">
                      <span>Article paragraphs <b>*</b></span>
                      <textarea value={form.paragraphs} required rows="8" placeholder="One paragraph per line" onChange={(event) => setForm((current) => ({ ...current, paragraphs: event.target.value }))} />
                    </label>
                  </div>
                </div>
              </div>
              <footer className="country-form-footer">
                <button className="country-button country-button-quiet" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
                <button className="country-button country-button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save article'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default UpdatesAdminPage
