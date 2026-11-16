import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchUpdates, formatUpdateDate } from './updatesApi'

function UpdatesPage() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [activeUpdate, setActiveUpdate] = useState(0)
  const [isFeaturePaused, setIsFeaturePaused] = useState(false)

  useEffect(() => {
    let isCurrent = true

    fetchUpdates()
      .then((updateRows) => {
        if (isCurrent) {
          setUpdates(updateRows)
          setActiveUpdate(0)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message || 'Unable to load updates.')
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [retryCount])

  const featuredUpdate = updates[activeUpdate]

  useEffect(() => {
    if (isFeaturePaused || updates.length < 2) {
      return undefined
    }

    const slideTimer = window.setInterval(() => {
      setActiveUpdate((currentUpdate) => (currentUpdate + 1) % updates.length)
    }, 5000)

    return () => window.clearInterval(slideTimer)
  }, [isFeaturePaused, updates.length])

  return (
    <main className="updates-page">
      {loading && <p role="status">Loading updates...</p>}
      {error && (
        <div className="program-data-error" role="alert">
          <p>Unable to load updates: {error}</p>
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
      {!loading && !error && updates.length === 0 && (
        <p>No updates are available.</p>
      )}
      {!loading && !error && featuredUpdate && (
        <section
          className="updates-feature"
          aria-labelledby="updates-feature-title"
          aria-roledescription="carousel"
          onMouseEnter={() => setIsFeaturePaused(true)}
          onMouseLeave={() => setIsFeaturePaused(false)}
          onFocus={() => setIsFeaturePaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsFeaturePaused(false)
            }
          }}
        >
          <div
            className="updates-feature-image"
            key={featuredUpdate.image}
            style={{ backgroundImage: `url("${featuredUpdate.image}")` }}
            role="img"
            aria-label={featuredUpdate.title}
          />
          <div className="updates-feature-copy">
            <h1 id="updates-feature-title">{featuredUpdate.title}</h1>
            <p>{featuredUpdate.description}</p>
            <Link className="updates-read-more" to={`/updates/${featuredUpdate.id}`}>Read more <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      )}

      {!loading && !error && updates.length > 0 && (
        <section className="updates-list" aria-labelledby="updates-title">
          <h2 id="updates-title">Update</h2>
          <div className="updates-grid">
            {updates.map((update) => (
              <article className="update-card" key={update.id}>
                <img src={update.image} alt="" />
                {update.published_at && (
                  <time dateTime={update.published_at}>{formatUpdateDate(update.published_at)}</time>
                )}
                <h3>{update.title}</h3>
                <p>{update.description}</p>
                <Link className="update-card-link" to={`/updates/${update.id}`}>Read more <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default UpdatesPage
