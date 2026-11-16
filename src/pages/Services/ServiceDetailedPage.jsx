import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchServiceBySlug } from './servicesApi'

function ServiceDetailedPage() {
  const { slug } = useParams()
  const [requestState, setRequestState] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${slug}:${retryCount}`

  useEffect(() => {
    let isCurrent = true

    fetchServiceBySlug(slug)
      .then((serviceRow) => {
        if (isCurrent) {
          setRequestState({ requestKey, service: serviceRow, error: null })
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setRequestState({ requestKey, service: null, error: requestError })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [requestKey, slug])

  const currentRequest = requestState?.requestKey === requestKey
    ? requestState
    : { service: null, error: null }
  const { service, error } = currentRequest
  const loading = !requestState || requestState.requestKey !== requestKey

  if (error?.status === 404) {
    return <Navigate to="/services" replace />
  }

  if (loading) {
    return <main className="service-detail-page"><p role="status">Loading service...</p></main>
  }

  if (error) {
    return (
      <main className="service-detail-page">
        <div className="program-data-error" role="alert">
          <p>Unable to load service: {error.message}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (!service) {
    return <Navigate to="/services" replace />
  }

  return (
    <main className="service-detail-page">
      <section data-reveal className="reveal-on-scroll services-hero service-detail-hero" aria-labelledby={`${service.slug}-title`}>
        <div className="services-hero-image service-detail-image" style={{ backgroundImage: `url("${service.image}")` }} />
        <div className="services-hero-copy service-detail-copy">
          <span className="service-label">Services</span>
          <h1 id={`${service.slug}-title`}>{service.title}</h1>
          <p>{service.description}</p>
          <Link className="enquiry-link" to="/contact">For Enquiries</Link>
        </div>
      </section>

      <section data-reveal className="reveal-on-scroll service-detail-content" aria-labelledby="our-service-title">
        <div className="service-detail-columns">
          <div className="service-detail-text">
            <h2 id="our-service-title">OUR SERVICES</h2>
            {service.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p>Key aspects include:</p>
            <ul>
              {service.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          </div>
          <div className="service-detail-side-image" style={{ backgroundImage: `url("${service.detailImage}")` }} />
        </div>

        <div className="service-benefits">
          <h2>Key Benefits</h2>
          <p>Our service is designed to provide clarity, reduce avoidable risk, and give you confidence as you plan your next international move or investment.</p>
          <ul>
            {service.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
          </ul>
        </div>
      </section>
    </main>
  )
}

export default ServiceDetailedPage
