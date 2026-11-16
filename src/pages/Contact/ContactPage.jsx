import { useState } from 'react'
import { contactBackgrounds } from './contactConfig'

const sampleMapEmbedUrl = 'https://www.google.com/maps?q=Morgan+Tower+Phnom+Penh&output=embed'
const inquiriesEndpoint = `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')}/contact-inquiries`

function ContactPage({ backgroundImage = contactBackgrounds.construction }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmitting(true)
    setSubmitted(false)
    setSubmitError('')

    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch(inquiriesEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const text = await response.text()
      let result = {}
      if (text) {
        try {
          result = JSON.parse(text)
        } catch {
          throw new Error('The contact service returned an invalid response. Please try again.')
        }
      }

      if (!response.ok) {
        const validationMessage = Object.values(result.errors || {})[0]?.[0]
        throw new Error(validationMessage || result.message || `Unable to submit your message (HTTP ${response.status}).`)
      }

      form.reset()
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error.message || 'Unable to submit your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="contact-main" style={{ '--contact-background-image': `url(${backgroundImage})` }}>
      <section className="contact-card" aria-labelledby="contact-title">
        <header className="card-heading">
          <h1 id="contact-title">General Enquiry</h1>
          <p>Let Us Help You Today</p>
        </header>

        <div className="contact-grid">
          <form className="enquiry-form" onSubmit={handleSubmit}>
            <h2>General Enquiry</h2>
            <label className="sr-only" htmlFor="interest">Program of interest</label>
            <select id="interest" name="program_interest" defaultValue="" required>
              <option value="" disabled>Program of interest *</option>
              <option>Residence by Investment</option>
              <option>Citizenship by Investment</option>
              <option>Global Mobility</option>
            </select>

            <label className="sr-only" htmlFor="contact-method">Preferred contact method</label>
            <select id="contact-method" name="preferred_contact_method" defaultValue="" required>
              <option value="" disabled>How would you like to be contacted *</option>
              <option>Email</option>
              <option>Telephone</option>
            </select>

            <label className="sr-only" htmlFor="message">Message</label>
            <textarea id="message" name="message" placeholder="Type your message here..." />

            <h2 className="details-title">Contact Information</h2>
            <div className="name-fields">
              <label className="sr-only" htmlFor="first-name">First name</label>
              <input id="first-name" name="first_name" placeholder="First name" required />
              <label className="sr-only" htmlFor="last-name">Last name</label>
              <input id="last-name" name="last_name" placeholder="Last name" required />
            </div>
            <label className="sr-only" htmlFor="telephone">Telephone number</label>
            <input id="telephone" name="telephone" placeholder="Telephone number" type="tel" required />
            <label className="sr-only" htmlFor="email">Email address</label>
            <input id="email" name="email" placeholder="Email address" type="email" required />
            <label className="sr-only" htmlFor="nationality">Nationality</label>
            <input id="nationality" name="nationality" placeholder="Your nationality" />
            <label className="sr-only" htmlFor="country">Country you currently reside in</label>
            <input id="country" name="residence_country" placeholder="Country you currently reside in*" required />

            <label className="consent">
              <input type="checkbox" name="consent" value="1" required />
              <span>
                Please keep me updated and send me information and news about Henley &amp; Partners and its group companies, event invitations, press references, and publications via e-mail. Detailed information on how we process your personal data can be found in Henley &amp; Partners&apos; Privacy Policy, available <a href="/privacy">here</a>.
              </span>
            </label>

            <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit'}</button>
            {submitError && <p className="contact-submit-error" role="alert">{submitError}</p>}
            {submitted && <p className="success-message" role="status">Thank you. We will be in touch soon.</p>}
          </form>

          <aside className="contact-aside">
            <iframe
              className="map-image"
              src={sampleMapEmbedUrl}
              title="Morgan Tower office location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <address>
              Morgan Tower, 8th Floor, Office No.8F-01/17B, Koh Pich, Phnom Penh (12101), Cambodia
            </address>
            <a className="directions" href="https://maps.google.com/?q=Morgan+Tower+Phnom+Penh" target="_blank" rel="noreferrer">
              Get Direction <span aria-hidden="true">›</span>
            </a>
            <h2>Contact Details</h2>
            <a href="mailto:babual.pirhar@lohaneco.com">babual.pirhar@lohaneco.com</a>
            <a href="tel:+85570228907">(+855) 70 228 907</a>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default ContactPage
