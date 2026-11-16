import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from './authApi'
import AdminSidebar from './AdminSidebar'
import './CountryAdminPage.css'

const countriesEndpoint =
  import.meta.env.VITE_COUNTRIES_API_URL || '/api/countries'
const pageSize = 8
const emptyCountry = {
  name: '',
  iso2: '',
  iso3: '',
  category: 'Residence',
  flag_image: '',
  minimum_investment: '',
  key_benefit: '',
  processing_time: '',
  details_intro: '',
  benefits: '',
  requirements: '',
  steps: '',
}

function getRows(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data
  if (!Array.isArray(rows)) {
    throw new Error('The countries API response did not contain a country list.')
  }
  return rows
}

async function readResponse(response) {
  const body = await response.text()
  let payload

  if (body) {
    try {
      payload = JSON.parse(body)
    } catch {
      throw new Error('The countries API returned an invalid response.')
    }
  }

  if (!response.ok || payload?.error) {
    throw new Error(
      payload?.message || payload?.msg || `Request failed with status ${response.status}.`,
    )
  }

  return payload
}

function CountryIcon({ name, size = 18 }) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.4-.9L19 8.5a2.1 2.1 0 0 0-3-3L5.4 16.1 4 20Z" /></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
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

function CountryForm({
  country,
  isEditing,
  removeFlagImage,
  onChange,
  onFlagFileChange,
  onRemoveFlagImage,
  onSubmit,
  onCancel,
  saving,
  error,
}) {
  const imageInput = useRef(null)
  const [filePreview, setFilePreview] = useState('')

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview)
    }
  }, [filePreview])

  const handleChange = (event) => {
    const { name, value } = event.target
    onChange((current) => ({ ...current, [name]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null
    onFlagFileChange(file)
    setFilePreview(file ? URL.createObjectURL(file) : '')
    if (file) onRemoveFlagImage(false)
  }

  const handleRemoveImage = () => {
    onFlagFileChange(null)
    onRemoveFlagImage(true)
    setFilePreview('')
    if (imageInput.current) imageInput.current.value = ''
  }

  const imagePreview = filePreview || (!removeFlagImage ? country.flag_image : '')

  return (
    <form className="country-form" onSubmit={onSubmit}>
      <div className="country-form-scroll">
        {error && <div className="country-admin-alert" role="alert">{error}</div>}
        <div className="country-form-section">
          <h3>Country information</h3>
          <p>Set the country identity and the program category it belongs to.</p>
          <div className="country-form-grid">
            <label className="country-field country-field-wide">
              <span>Country name <b>*</b></span>
              <input name="name" value={country.name} onChange={handleChange} required maxLength="120" placeholder="e.g. Portugal" />
            </label>
            <label className="country-field">
              <span>ISO alpha-2</span>
              <input name="iso2" value={country.iso2} onChange={handleChange} maxLength="2" placeholder="e.g. PT" />
            </label>
            <label className="country-field">
              <span>ISO alpha-3</span>
              <input name="iso3" value={country.iso3} onChange={handleChange} maxLength="3" placeholder="e.g. PRT" />
            </label>
            <label className="country-field">
              <span>Program category <b>*</b></span>
              <select name="category" value={country.category} onChange={handleChange} required>
                <option value="Residence">Residence</option>
                <option value="Citizenship">Citizenship</option>
              </select>
            </label>
            <div className="country-field country-field-wide">
              <span>Country flag image {!isEditing && <b>*</b>}</span>
              {imagePreview && (
                <div className="country-image-preview">
                  <img src={imagePreview} alt={`${country.name || 'Country'} flag preview`} />
                  <button className="country-button country-button-quiet" type="button" onClick={handleRemoveImage}>
                    Remove image
                  </button>
                </div>
              )}
              <input
                ref={imageInput}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                aria-label="Upload country flag image"
                onChange={handleImageChange}
                required={!imagePreview && !isEditing}
              />
              <small>Choose an image file (up to 5 MB). Uploading a new image replaces the current one.</small>
            </div>
          </div>
        </div>

        <div className="country-form-section">
          <h3>Program overview</h3>
          <p>These details appear on the public residence and citizenship pages.</p>
          <div className="country-form-grid">
            <label className="country-field">
              <span>Minimum investment</span>
              <input name="minimum_investment" type="text" value={country.minimum_investment} onChange={handleChange} required maxLength="255" placeholder="e.g. USD 250,000" />
            </label>
            <label className="country-field">
              <span>Processing time</span>
              <input name="processing_time" value={country.processing_time} onChange={handleChange} required maxLength="50" placeholder="e.g. 6–12 months" />
            </label>
            <label className="country-field country-field-wide">
              <span>Key benefit</span>
              <input name="key_benefit" value={country.key_benefit} onChange={handleChange} required maxLength="255" placeholder="Short benefit shown in program cards" />
            </label>
            <label className="country-field country-field-wide">
              <span>Program details introduction</span>
              <textarea name="details_intro" value={country.details_intro || ''} onChange={handleChange} rows="3" maxLength="1000" placeholder="Introductory text shown at the top of the program details modal" />
            </label>
            <label className="country-field country-field-wide">
              <span>Benefits</span>
              <textarea name="benefits" value={country.benefits} onChange={handleChange} rows="3" placeholder="Add one benefit per line" />
            </label>
            <label className="country-field country-field-wide">
              <span>Requirements</span>
              <textarea name="requirements" value={country.requirements} onChange={handleChange} rows="3" placeholder="Add one requirement per line" />
            </label>
            <label className="country-field country-field-wide">
              <span>Application steps</span>
              <textarea name="steps" value={country.steps} onChange={handleChange} rows="3" placeholder="Add one step per line" />
            </label>
          </div>
        </div>
      </div>
      <footer className="country-form-footer">
        <button className="country-button country-button-quiet" type="button" onClick={onCancel}>Cancel</button>
        <button className="country-button country-button-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save country'}
        </button>
      </footer>
    </form>
  )
}

function CountryAdminPage({ user }) {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All countries')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState(null)
  const [formCountry, setFormCountry] = useState(emptyCountry)
  const [flagFile, setFlagFile] = useState(null)
  const [removeFlagImage, setRemoveFlagImage] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  async function loadCountries() {
    setLoading(true)
    setLoadError('')
    try {
      const response = await apiFetch(countriesEndpoint)
      const payload = await readResponse(response)
      setCountries(getRows(payload))
    } catch (error) {
      setLoadError(error.message || 'Unable to load countries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    apiFetch(countriesEndpoint)
      .then(readResponse)
      .then((payload) => {
        if (isCurrent) setCountries(getRows(payload))
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message || 'Unable to load countries.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return countries.filter((country) => {
      const matchesCategory =
        categoryFilter === 'All countries' ||
        String(country.category || '').toLowerCase() === categoryFilter.toLowerCase()
      const matchesSearch =
        !query ||
        [country.name, country.iso2, country.iso3, country.category]
          .some((value) => String(value || '').toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [countries, categoryFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredCountries.length / pageSize))
  const visibleCountries = filteredCountries.slice((page - 1) * pageSize, page * pageSize)
  const residenceCount = countries.filter(
    (country) => String(country.category).toLowerCase() === 'residence',
  ).length
  const citizenshipCount = countries.filter(
    (country) => String(country.category).toLowerCase() === 'citizenship',
  ).length

  function openCreateForm() {
    setEditingCountry(null)
    setFormCountry({ ...emptyCountry })
    setFlagFile(null)
    setRemoveFlagImage(false)
    setFormError('')
    setFormOpen(true)
  }

  function openEditForm(country) {
    setEditingCountry(country)
    setFormCountry({ ...emptyCountry, ...country })
    setFlagFile(null)
    setRemoveFlagImage(false)
    setFormError('')
    setFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const isEditing = Boolean(editingCountry)
    const id = editingCountry?.id ?? editingCountry?.iso3 ?? editingCountry?.name
    const countryPayload = new FormData()
    Object.keys(emptyCountry).forEach((key) => {
      if (key !== 'flag_image') countryPayload.append(key, formCountry[key] ?? '')
    })
    if (flagFile) {
      countryPayload.append('flag_image_file', flagFile)
    } else {
      countryPayload.append('flag_image', removeFlagImage ? '' : formCountry.flag_image || '')
    }
    if (removeFlagImage) countryPayload.append('remove_flag_image', '1')
    if (isEditing) countryPayload.append('_method', 'PUT')

    try {
      const response = await apiFetch(
        isEditing ? `${countriesEndpoint}/${encodeURIComponent(id)}` : countriesEndpoint,
        {
          method: 'POST',
          body: countryPayload,
        },
      )
      await readResponse(response)
      setFormOpen(false)
      setPage(1)
      setNotice(isEditing ? 'Country updated successfully.' : 'Country created successfully.')
      await loadCountries()
    } catch (error) {
      setFormError(error.message || 'Unable to save country.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(country) {
    const id = country.id ?? country.iso3 ?? country.name
    if (!window.confirm(`Delete ${country.name}? This action cannot be undone.`)) return
    setDeletingId(id)
    setNotice('')
    setActionError('')

    try {
      const response = await apiFetch(`${countriesEndpoint}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      await readResponse(response)
      setNotice(`${country.name} was deleted.`)
      setPage(1)
      await loadCountries()
    } catch (error) {
      setActionError(error.message || `Unable to delete ${country.name}.`)
    } finally {
      setDeletingId(null)
    }
  }

  function setFilter(category) {
    setCategoryFilter(category)
    setPage(1)
  }

  return (
    <main className="country-admin">
      <AdminSidebar user={user} />

      <div className="country-admin-main" id="country-management">
        <header className="country-admin-topbar">
          <div className="country-admin-breadcrumb">Admin <span>/</span> Countries</div>
          <Link className="country-admin-view-site" to="/">
            View website <CountryIcon name="arrow" size={16} />
          </Link>
        </header>

        <section className="country-admin-content">
          <div className="country-admin-heading">
            <div>
              <p className="country-admin-eyebrow">CONTENT MANAGEMENT</p>
              <h1>Countries</h1>
              <p className="country-admin-subtitle">Manage country profiles and investment program details.</p>
            </div>
            <button className="country-button country-button-primary" type="button" onClick={openCreateForm}>
              <CountryIcon name="plus" size={17} /> Add country
            </button>
          </div>

          <div className="country-admin-stats">
            <article className="country-admin-stat">
              <div className="country-admin-stat-icon stat-icon-blue"><CountryIcon name="globe" size={20} /></div>
              <div><span>Total countries</span><strong>{countries.length}</strong></div>
              <small>Across all programs</small>
            </article>
            <article className="country-admin-stat">
              <div className="country-admin-stat-icon stat-icon-green"><span aria-hidden="true">⌂</span></div>
              <div><span>Residence programs</span><strong>{residenceCount}</strong></div>
              <small>Residence by investment</small>
            </article>
            <article className="country-admin-stat">
              <div className="country-admin-stat-icon stat-icon-purple"><span aria-hidden="true">✧</span></div>
              <div><span>Citizenship programs</span><strong>{citizenshipCount}</strong></div>
              <small>Citizenship by investment</small>
            </article>
          </div>

          {notice && <div className="country-admin-notice" role="status">{notice}</div>}
          {actionError && <div className="country-admin-alert country-admin-load-error" role="alert">{actionError}</div>}
          {loadError && (
            <div className="country-admin-alert country-admin-load-error" role="alert">
              <span>{loadError}</span>
              <button type="button" onClick={loadCountries}>Try again</button>
            </div>
          )}

          <section className="country-admin-panel" aria-label="Country list">
            <div className="country-admin-panel-heading">
              <div><h2>All countries</h2><p>Review and manage your country program content.</p></div>
              <div className="country-admin-search">
                <CountryIcon name="search" size={17} />
                <input
                  aria-label="Search countries"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                  placeholder="Search countries..."
                />
                {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><CountryIcon name="close" size={15} /></button>}
              </div>
            </div>

            <div className="country-admin-toolbar">
              <div className="country-admin-tabs" role="tablist" aria-label="Filter by program category">
                {['All countries', 'Residence', 'Citizenship'].map((category) => (
                  <button
                    key={category}
                    className={categoryFilter === category ? 'is-selected' : ''}
                    type="button"
                    role="tab"
                    aria-selected={categoryFilter === category}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <span className="country-admin-result-count">{filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'}</span>
            </div>

            <div className="country-admin-table-wrap">
              <table className="country-admin-table">
                <thead>
                  <tr>
                    <th scope="col">COUNTRY</th>
                    <th scope="col">CATEGORY</th>
                    <th scope="col">MINIMUM INVESTMENT</th>
                    <th scope="col">PROCESSING TIME</th>
                    <th scope="col">KEY BENEFIT</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td className="country-admin-empty" colSpan="6">Loading countries…</td></tr>}
                  {!loading && !loadError && visibleCountries.map((country) => {
                    const id = country.id ?? country.iso3 ?? country.name
                    return (
                      <tr key={id}>
                        <td>
                          <div className="country-admin-country-cell">
                            <span className="country-admin-flag">
                              {country.flag_image || country.flag
                                ? <img src={country.flag_image || country.flag} alt="" />
                                : <CountryIcon name="globe" size={17} />}
                            </span>
                            <span className="country-admin-country-name">{country.name || 'Unnamed country'}<small>{[country.iso2, country.iso3].filter(Boolean).join(' · ') || 'Country profile'}</small></span>
                          </div>
                        </td>
                        <td><span className={`country-admin-badge ${String(country.category).toLowerCase() === 'citizenship' ? 'badge-citizenship' : 'badge-residence'}`}>{country.category || 'Uncategorized'}</span></td>
                        <td>{country.minimum_investment || <span className="country-admin-muted">Not set</span>}</td>
                        <td>{country.processing_time || <span className="country-admin-muted">Not set</span>}</td>
                        <td><span className="country-admin-benefit">{country.key_benefit || <span className="country-admin-muted">Not set</span>}</span></td>
                        <td>
                          <div className="country-admin-actions">
                            <button type="button" aria-label={`Edit ${country.name}`} title="Edit country" onClick={() => openEditForm(country)}><CountryIcon name="edit" size={17} /></button>
                            <button className="country-admin-delete" type="button" aria-label={`Delete ${country.name}`} title="Delete country" disabled={deletingId === id} onClick={() => handleDelete(country)}><CountryIcon name="trash" size={17} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {!loading && !loadError && visibleCountries.length === 0 && (
                    <tr><td className="country-admin-empty" colSpan="6">{search || categoryFilter !== 'All countries' ? 'No countries match your filters.' : 'No countries yet. Add a country to get started.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="country-admin-pagination">
              <span>
                Showing <strong>{filteredCountries.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredCountries.length)}</strong> of <strong>{filteredCountries.length}</strong>
              </span>
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
          <section className="country-admin-modal" role="dialog" aria-modal="true" aria-labelledby="country-form-title">
            <header className="country-admin-modal-header">
              <div><p className="country-admin-eyebrow">{editingCountry ? 'EDIT COUNTRY' : 'NEW COUNTRY'}</p><h2 id="country-form-title">{editingCountry ? 'Edit country' : 'Add a country'}</h2></div>
              <button type="button" aria-label="Close form" disabled={saving} onClick={() => setFormOpen(false)}><CountryIcon name="close" /></button>
            </header>
            <CountryForm
              country={formCountry}
              isEditing={Boolean(editingCountry)}
              removeFlagImage={removeFlagImage}
              onChange={setFormCountry}
              onFlagFileChange={setFlagFile}
              onRemoveFlagImage={setRemoveFlagImage}
              onSubmit={handleSubmit}
              onCancel={() => setFormOpen(false)}
              saving={saving}
              error={formError}
            />
          </section>
        </div>
      )}
    </main>
  )
}

export default CountryAdminPage
