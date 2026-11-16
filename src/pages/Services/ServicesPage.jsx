import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../../assets/contact card img.jpg'
import { fetchServices } from './servicesApi'

function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    fetchServices()
      .then((serviceRows) => {
        if (isCurrent) {
          setServices(serviceRows)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message || 'Unable to load services.')
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [retryCount])

  return (
    <div className="services-page">
      <main>
        <section className="services-hero" aria-labelledby="services-title">
          <div className="services-hero-image" style={{ backgroundImage: `url("${heroImage}")` }} />
          <div className="services-hero-copy">
            <span className="service-label">Services</span>
            <h1 id="services-title">360Five Immigration Services</h1>
            <p>Our consultants have been partners, directors, and private client specialists at some of the top tax and law firms in the world. As a result, we have specific insight into the unique tax issues facing relocating individuals, their families, and their businesses. We work in conjunction with your existing advisors and in-country specialists, providing technical insight to bridge cross-border tax challenges.</p>
            <Link className="enquiry-link" to="/contact">For Enquiries</Link>
          </div>
        </section>

        <section className="services-catalog" aria-labelledby="catalog-title">
          <h2 id="catalog-title">Our Services</h2>
          <p className="catalog-intro">As the global leader in residence and citizenship planning, Henley &amp; Partners is best placed to expertly guide you through the many residence and citizenship options available, accompanied by a broad range of complementary private client services.</p>
          {loading && <p role="status">Loading services...</p>}
          {error && (
            <div className="program-data-error" role="alert">
              <p>Unable to load services: {error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setError('')
                  setRetryCount((count) => count + 1)
                }}
              >
                Try again
              </button>
            </div>
          )}
          {!loading && !error && services.length === 0 && (
            <p>No services are available.</p>
          )}
          {!loading && !error && services.length > 0 && (
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.slug}>
                  <img src={service.image} alt="" />
                  <div className="service-card-copy">
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                    <Link className="service-read-more" to={`/services/${encodeURIComponent(service.slug)}`}>Read more...</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default ServicesPage
