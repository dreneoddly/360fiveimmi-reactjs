import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="simple-page">
      <p className="eyebrow">404</p>
      <h1>Page not found.</h1>
      <Link className="not-found-link" to="/">Return to the homepage</Link>
    </main>
  )
}

export default NotFoundPage
