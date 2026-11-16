import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchUpdateById, fetchUpdates, formatUpdateDate } from './updatesApi'

function UpdateDetailedPage() {
  const { updateId } = useParams()
  const [requestState, setRequestState] = useState(null)
  const [relatedUpdates, setRelatedUpdates] = useState([])
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = `${updateId}:${retryCount}`

  useEffect(() => {
    let isCurrent = true

    Promise.all([fetchUpdateById(updateId), fetchUpdates()])
      .then(([update, updateRows]) => {
          if (isCurrent) {
            setRequestState({ requestKey, update, error: null })
            setRelatedUpdates(updateRows.filter((row) => row.id !== update.id))
          }
      })
      .catch((error) => {
          if (isCurrent) {
            setRequestState({ requestKey, update: null, error })
          }
      })

    return () => {
      isCurrent = false
    }
  }, [requestKey, updateId])

  const currentRequest = requestState?.requestKey === requestKey
    ? requestState
    : { update: null, error: null }
  const { update, error } = currentRequest
  const loading = !requestState || requestState.requestKey !== requestKey

  if (error?.status === 404) {
    return <Navigate to="/updates" replace />
  }

  if (loading) {
    return <main className="update-detail-page"><p role="status">Loading update...</p></main>
  }

  if (error) {
    return (
      <main className="update-detail-page">
          <div className="program-data-error" role="alert">
            <p>Unable to load update: {error.message}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
              Try again
            </button>
          </div>
      </main>
    )
  }

  if (!update) {
    return <Navigate to="/updates" replace />
  }

  return (
    <main className="update-detail-page">
      <section className="update-detail-hero">
          <img src={update.image} alt="" />
      </section>

      <article className="update-detail-content">
          {update.published_at && (
            <time className="update-detail-date" dateTime={update.published_at}>
              {formatUpdateDate(update.published_at)}
            </time>
          )}
          <h1>{update.title}</h1>
          {update.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>

      <section className="update-related" aria-labelledby="related-articles-title">
        <h2 id="related-articles-title">Related articles</h2>
        <div className="update-related-grid">
          {relatedUpdates.map((relatedUpdate) => (
            <article className="update-related-card" key={relatedUpdate.id}>
              <Link
                className="update-related-image-link"
                to={`/updates/${relatedUpdate.id}`}
                aria-label={`Read ${relatedUpdate.title}`}
              >
                <img src={relatedUpdate.image} alt="" />
              </Link>
              <h3>{relatedUpdate.title}</h3>
              <p>{relatedUpdate.description}</p>
              <Link className="update-card-link" to={`/updates/${relatedUpdate.id}`}>
                Read more <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
        <Link className="update-detail-back" to="/updates">← Back to updates</Link>
      </section>
    </main>
  )
}

export default UpdateDetailedPage
