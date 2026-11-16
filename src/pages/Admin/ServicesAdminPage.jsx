import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from './authApi'
import AdminSidebar from './AdminSidebar'
import './CountryAdminPage.css'

const servicesEndpoint = import.meta.env.VITE_SERVICES_API_URL || (
  `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')}/services`
)
const pageSize = 8
const emptyService = {
  slug: '',
  title: '',
  text: '',
  description: '',
  image: '',
  detail_image: '',
  paragraphs: '',
  benefits: '',
}

function ServiceImageUpload({ label, existingImage, required, onChange }) {
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
      <span>{label} {required && <b>*</b>}</span>
      {(preview || existingImage) && (
        <div className="country-image-preview">
          <img src={preview || existingImage} alt={`${label} preview`} />
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

function ServicesIcon({ name, size = 18 }) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></>,
    services: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    updates: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m21 15-5-5L5 19" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.4-.9L19 8.5a2.1 2.1 0 0 0-3-3L5.4 16.1 4 20Z" /></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      className="country-admin-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

async function readResponse(response) {
  const text = await response.text()
  let payload = {}
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      throw new Error('The services API returned an invalid response.')
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
    throw new Error('The services API response did not contain a service list.')
  }
  return rows
}

function ServicesAdminPage({ user }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form, setForm] = useState(emptyService)
  const [imageFiles, setImageFiles] = useState({ image: null, detail_image: null })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingSlug, setDeletingSlug] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  async function loadServices() {
    setLoading(true)
    setLoadError('')
    try {
      const response = await apiFetch(servicesEndpoint)
      setServices(getRows(await readResponse(response)))
    } catch (error) {
      setLoadError(error.message || 'Unable to load services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    apiFetch(servicesEndpoint)
      .then(readResponse)
      .then((payload) => {
        if (isCurrent) setServices(getRows(payload))
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message || 'Unable to load services.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return services.filter((service) =>
      [service.title, service.slug, service.text]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    )
  }, [services, search])

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize))
  const visibleServices = filteredServices.slice((page - 1) * pageSize, page * pageSize)

  function openCreateForm() {
    setEditingService(null)
    setForm({ ...emptyService })
    setImageFiles({ image: null, detail_image: null })
    setFormError('')
    setFormOpen(true)
  }

  function openEditForm(service) {
    setEditingService(service)
    setImageFiles({ image: null, detail_image: null })
    setForm({
      ...emptyService,
      ...service,
      paragraphs: Array.isArray(service.paragraphs) ? service.paragraphs.join('\n') : '',
      benefits: Array.isArray(service.benefits) ? service.benefits.join('\n') : '',
    })
    setFormError('')
    setFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      ...form,
      paragraphs: form.paragraphs.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      benefits: form.benefits.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
    }
    const body = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'image' && key !== 'detail_image') {
        if (Array.isArray(value)) {
          value.forEach((item, index) => body.append(`${key}[${index}]`, item))
        } else {
          body.append(key, value)
        }
      }
    })
    if (imageFiles.image) body.append('image_file', imageFiles.image)
    if (imageFiles.detail_image) body.append('detail_image_file', imageFiles.detail_image)
    if (editingService) body.append('_method', 'PUT')

    try {
      const response = await apiFetch(
        editingService
          ? `${servicesEndpoint}/${encodeURIComponent(editingService.slug)}`
          : servicesEndpoint,
        {
          method: 'POST',
          body,
        },
      )
      await readResponse(response)
      setFormOpen(false)
      setPage(1)
      setNotice(editingService ? 'Service updated successfully.' : 'Service created successfully.')
      await loadServices()
    } catch (error) {
      setFormError(error.message || 'Unable to save service.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(service) {
    if (!window.confirm(`Delete ${service.title}? This action cannot be undone.`)) return
    setDeletingSlug(service.slug)
    setNotice('')
    setActionError('')

    try {
      const response = await apiFetch(`${servicesEndpoint}/${encodeURIComponent(service.slug)}`, {
        method: 'DELETE',
      })
      await readResponse(response)
      setNotice(`${service.title} was deleted.`)
      setPage(1)
      await loadServices()
    } catch (error) {
      setActionError(error.message || `Unable to delete ${service.title}.`)
    } finally {
      setDeletingSlug(null)
    }
  }

  return (
    <main className="country-admin">
      <AdminSidebar user={user} />

      <div className="country-admin-main">
        <header className="country-admin-topbar">
          <div className="country-admin-breadcrumb">Admin <span>/</span> Services</div>
          <Link className="country-admin-view-site" to="/services">View website <ServicesIcon name="arrow" size={16} /></Link>
        </header>

        <section className="country-admin-content">
          <div className="country-admin-heading">
            <div>
              <p className="country-admin-eyebrow">CONTENT MANAGEMENT</p>
              <h1>Services</h1>
              <p className="country-admin-subtitle">Manage the service listings and their detail pages.</p>
            </div>
            <button className="country-button country-button-primary" type="button" onClick={openCreateForm}><ServicesIcon name="plus" size={17} /> Add service</button>
          </div>

          <div className="country-admin-stats">
            <article className="country-admin-stat">
              <div className="country-admin-stat-icon stat-icon-blue"><ServicesIcon name="services" size={20} /></div>
              <div><span>Total services</span><strong>{services.length}</strong></div>
              <small>Published service pages</small>
            </article>
          </div>

          {notice && <div className="country-admin-notice" role="status">{notice}</div>}
          {actionError && <div className="country-admin-alert country-admin-load-error" role="alert">{actionError}</div>}
          {loadError && (
            <div className="country-admin-alert country-admin-load-error" role="alert">
              <span>{loadError}</span><button type="button" onClick={loadServices}>Try again</button>
            </div>
          )}

          <section className="country-admin-panel" aria-label="Service list">
            <div className="country-admin-panel-heading">
              <div><h2>All services</h2><p>Review, create, and manage the service pages shown on the website.</p></div>
              <div className="country-admin-search">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="Search services"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                  placeholder="Search services..."
                />
              </div>
            </div>
            <div className="country-admin-toolbar">
              <span className="country-admin-result-count">{filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}</span>
            </div>
            <div className="country-admin-table-wrap">
              <table className="country-admin-table">
                <thead>
                  <tr><th scope="col">SERVICE</th><th scope="col">SLUG</th><th scope="col">SUMMARY</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody>
                  {loading && <tr><td className="country-admin-empty" colSpan="4">Loading services…</td></tr>}
                  {!loading && !loadError && visibleServices.map((service) => (
                    <tr key={service.id ?? service.slug}>
                      <td>
                        <div className="country-admin-country-cell">
                          <span className="country-admin-flag">
                            {service.image ? <img src={service.image} alt="" /> : <ServicesIcon name="services" size={17} />}
                          </span>
                          <span className="country-admin-country-name">{service.title || 'Untitled service'}<small>{service.paragraphs?.length || 0} detail paragraphs</small></span>
                        </div>
                      </td>
                      <td>{service.slug}</td>
                      <td><span className="country-admin-benefit">{service.text || <span className="country-admin-muted">No summary</span>}</span></td>
                      <td>
                        <div className="country-admin-actions">
                          <button type="button" aria-label={`Edit ${service.title}`} title="Edit service" onClick={() => openEditForm(service)}><ServicesIcon name="edit" size={17} /></button>
                          <button className="country-admin-delete" type="button" aria-label={`Delete ${service.title}`} title="Delete service" disabled={deletingSlug === service.slug} onClick={() => handleDelete(service)}><ServicesIcon name="trash" size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && !loadError && visibleServices.length === 0 && (
                    <tr><td className="country-admin-empty" colSpan="4">{search ? 'No services match your search.' : 'No services yet. Add a service to get started.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="country-admin-pagination">
              <span>Showing <strong>{filteredServices.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredServices.length)}</strong> of <strong>{filteredServices.length}</strong></span>
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
          <section className="country-admin-modal" role="dialog" aria-modal="true" aria-labelledby="service-form-title">
            <header className="country-admin-modal-header">
              <div>
                <p className="country-admin-eyebrow">{editingService ? 'EDIT SERVICE' : 'NEW SERVICE'}</p>
                <h2 id="service-form-title">{editingService ? 'Edit service' : 'Add a service'}</h2>
              </div>
              <button type="button" aria-label="Close form" disabled={saving} onClick={() => setFormOpen(false)}><ServicesIcon name="close" /></button>
            </header>
            <form className="country-form" onSubmit={handleSubmit}>
              <div className="country-form-scroll">
                {formError && <div className="country-admin-alert" role="alert">{formError}</div>}
                <div className="country-form-section">
                  <h3>Service information</h3>
                  <p>Set the service title, URL slug, and the summary shown in the catalog.</p>
                  <div className="country-form-grid">
                    <label className="country-field country-field-wide">
                      <span>Title <b>*</b></span>
                      <input value={form.title} required maxLength="255" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                    </label>
                    <label className="country-field country-field-wide">
                      <span>URL slug <b>*</b></span>
                      <input value={form.slug} required pattern="[A-Za-z0-9_-]+" maxLength="255" placeholder="e.g. private-client-solutions" onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
                      <small>Used in the public service page URL. Use letters, numbers, hyphens, or underscores.</small>
                    </label>
                    <label className="country-field country-field-wide">
                      <span>Listing summary <b>*</b></span>
                      <textarea value={form.text} required rows="3" onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))} />
                    </label>
                    <label className="country-field country-field-wide">
                      <span>Detail page description <b>*</b></span>
                      <textarea value={form.description} required rows="4" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                    </label>
                  </div>
                </div>
                <div className="country-form-section">
                  <h3>Images and details</h3>
                  <p>Upload images and add one detail paragraph or benefit per line.</p>
                  <div className="country-form-grid">
                    <ServiceImageUpload
                      label="Listing image"
                      existingImage={editingService?.image}
                      required={!editingService?.image}
                      onChange={(file) => setImageFiles((current) => ({ ...current, image: file }))}
                    />
                    <ServiceImageUpload
                      label="Detail page image"
                      existingImage={editingService?.detail_image}
                      required={!editingService?.detail_image}
                      onChange={(file) => setImageFiles((current) => ({ ...current, detail_image: file }))}
                    />
                    <label className="country-field country-field-wide">
                      <span>Detail paragraphs <b>*</b></span>
                      <textarea value={form.paragraphs} required rows="5" placeholder="One paragraph per line" onChange={(event) => setForm((current) => ({ ...current, paragraphs: event.target.value }))} />
                    </label>
                    <label className="country-field country-field-wide">
                      <span>Key benefits <b>*</b></span>
                      <textarea value={form.benefits} required rows="5" placeholder="One benefit per line" onChange={(event) => setForm((current) => ({ ...current, benefits: event.target.value }))} />
                    </label>
                  </div>
                </div>
              </div>
              <footer className="country-form-footer">
                <button className="country-button country-button-quiet" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
                <button className="country-button country-button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save service'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default ServicesAdminPage
