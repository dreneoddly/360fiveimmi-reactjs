import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from './authApi'
import AdminSidebar from './AdminSidebar'
import './CountryAdminPage.css'

const inquiriesEndpoint = `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')}/contact-inquiries`
const statuses = ['new', 'in_progress', 'resolved']

async function readResponse(response) {
  const text = await response.text()
  let payload = {}

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      throw new Error('The contact messages API returned an invalid response.')
    }
  }

  if (!response.ok) {
    const validationMessage = Object.values(payload.errors || {})[0]?.[0]
    throw new Error(validationMessage || payload.message || `Request failed with status ${response.status}.`)
  }

  return payload
}

function formatDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function ContactInquiriesAdminPage({ user }) {
  const [inquiries, setInquiries] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, from: 0, to: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  async function loadInquiries(pageToLoad = page) {
    setLoading(true)
    setLoadError('')

    try {
      const response = await apiFetch(`${inquiriesEndpoint}?page=${pageToLoad}`)
      const payload = await readResponse(response)
      if (!Array.isArray(payload.data)) {
        throw new Error('The contact messages API response did not contain a message list.')
      }

      setInquiries(payload.data)
      setPagination({
        currentPage: payload.current_page || pageToLoad,
        lastPage: payload.last_page || 1,
        total: payload.total || 0,
        from: payload.from || 0,
        to: payload.to || 0,
      })
    } catch (error) {
      setLoadError(error.message || 'Unable to load contact messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    apiFetch(`${inquiriesEndpoint}?page=${page}`)
      .then(readResponse)
      .then((payload) => {
        if (!Array.isArray(payload.data)) {
          throw new Error('The contact messages API response did not contain a message list.')
        }
        if (isCurrent) {
          setInquiries(payload.data)
          setPagination({
            currentPage: payload.current_page || page,
            lastPage: payload.last_page || 1,
            total: payload.total || 0,
            from: payload.from || 0,
            to: payload.to || 0,
          })
        }
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message || 'Unable to load contact messages.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [page])

  async function handleStatusChange(inquiry, status) {
    setUpdatingId(inquiry.id)
    setActionError('')
    setNotice('')

    try {
      const response = await apiFetch(`${inquiriesEndpoint}/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const updatedInquiry = await readResponse(response)
      setInquiries((current) => current.map((item) => (
        item.id === inquiry.id ? updatedInquiry : item
      )))
      setNotice(`Message from ${inquiry.first_name} ${inquiry.last_name} marked ${status.replace('_', ' ')}.`)
    } catch (error) {
      setActionError(error.message || 'Unable to update the message status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="country-admin">
      <AdminSidebar user={user} />

      <div className="country-admin-main">
        <header className="country-admin-topbar">
          <div className="country-admin-breadcrumb">Admin <span>/</span> Contact messages</div>
          <Link className="country-admin-view-site" to="/contact">View contact page <span aria-hidden="true">↗</span></Link>
        </header>

        <section className="country-admin-content">
          <div className="country-admin-heading">
            <div>
              <p className="country-admin-eyebrow">INQUIRY MANAGEMENT</p>
              <h1>Contact messages</h1>
              <p className="country-admin-subtitle">Read and manage messages submitted through the Contact Us form.</p>
            </div>
            <button className="country-button country-button-quiet" type="button" onClick={() => loadInquiries(page)} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh messages'}
            </button>
          </div>

          <div className="country-admin-stats">
            <article className="country-admin-stat">
              <div className="country-admin-stat-icon stat-icon-blue" aria-hidden="true">✉</div>
              <div><span>Total messages</span><strong>{pagination.total}</strong></div>
              <small>All submitted inquiries</small>
            </article>
          </div>

          {notice && <div className="country-admin-notice" role="status">{notice}</div>}
          {actionError && <div className="country-admin-alert country-admin-load-error" role="alert">{actionError}</div>}
          {loadError && (
            <div className="country-admin-alert country-admin-load-error" role="alert">
              <span>{loadError}</span><button type="button" onClick={() => loadInquiries(page)}>Try again</button>
            </div>
          )}

          <section className="country-admin-panel" aria-label="Contact messages">
            <div className="country-admin-panel-heading">
              <div>
                <h2>All submissions</h2>
                <p>Messages are shown with the submitter’s contact details and inquiry preferences.</p>
              </div>
              <span className="country-admin-result-count">{pagination.total} {pagination.total === 1 ? 'message' : 'messages'}</span>
            </div>
            <div className="contact-inquiry-list">
              {loading && <p className="country-admin-empty" role="status">Loading contact messages…</p>}
              {!loading && !loadError && inquiries.map((inquiry) => (
                <article className="contact-inquiry-card" key={inquiry.id}>
                  <header className="contact-inquiry-card-header">
                    <div>
                      <h3>{inquiry.first_name} {inquiry.last_name}</h3>
                      <time dateTime={inquiry.created_at}>{formatDate(inquiry.created_at)}</time>
                    </div>
                    <label className="contact-inquiry-status">
                      <span>Status</span>
                      <select
                        aria-label={`Status for message from ${inquiry.first_name} ${inquiry.last_name}`}
                        value={inquiry.status}
                        disabled={updatingId === inquiry.id}
                        onChange={(event) => handleStatusChange(inquiry, event.target.value)}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </label>
                  </header>
                  <div className="contact-inquiry-details">
                    <div><span>Email</span><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div>
                    <div><span>Telephone</span><a href={`tel:${inquiry.telephone}`}>{inquiry.telephone}</a></div>
                    <div><span>Program of interest</span><strong>{inquiry.program_interest}</strong></div>
                    <div><span>Preferred contact</span><strong>{inquiry.preferred_contact_method}</strong></div>
                    <div><span>Nationality</span><strong>{inquiry.nationality || 'Not provided'}</strong></div>
                    <div><span>Residence country</span><strong>{inquiry.residence_country}</strong></div>
                  </div>
                  <div className="contact-inquiry-message">
                    <span>Message</span>
                    <p>{inquiry.message || 'No message provided.'}</p>
                  </div>
                  <p className="contact-inquiry-consent">
                    Marketing consent: {inquiry.consent ? 'Granted' : 'Not granted'}
                  </p>
                </article>
              ))}
              {!loading && !loadError && inquiries.length === 0 && (
                <p className="country-admin-empty">No contact messages have been submitted yet.</p>
              )}
            </div>
            <footer className="country-admin-pagination">
              <span>Showing <strong>{pagination.from}–{pagination.to}</strong> of <strong>{pagination.total}</strong></span>
              <div>
                <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button>
                <span>Page {pagination.currentPage} of {pagination.lastPage}</span>
                <button type="button" disabled={page >= pagination.lastPage || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </footer>
          </section>
        </section>
      </div>
    </main>
  )
}

export default ContactInquiriesAdminPage
