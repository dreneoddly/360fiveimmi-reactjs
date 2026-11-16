import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoImage from '../../assets/360FIVE_immi_AI-02.svg'
import { getCurrentUser, isUnauthenticated, signIn } from './authApi'
import './AdminSignInPage.css'

function AdminSignInPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    getCurrentUser()
      .then(() => {
        if (isCurrent) navigate('/admin/countries', { replace: true })
      })
      .catch((requestError) => {
        if (isCurrent && !isUnauthenticated(requestError)) {
          setError(requestError.message || 'Unable to connect to the authentication service.')
        }
      })
      .finally(() => {
        if (isCurrent) setCheckingSession(false)
      })

    return () => {
      isCurrent = false
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signIn({ email, password, remember })
      const destination = location.state?.from?.pathname
      navigate(destination?.startsWith('/admin/') ? destination : '/admin/countries', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="admin-sign-in">
      <section className="admin-sign-in-brand-panel">
        <Link to="/" className="admin-sign-in-logo" aria-label="360Five home">
          <img src={logoImage} alt="360Five Immigration" />
        </Link>
        <div className="admin-sign-in-brand-copy">
          <span className="admin-sign-in-kicker">360FIVE IMMIGRATION</span>
          <h1>Confident decisions.<br />A world of possibility.</h1>
          <p>Manage country programs and keep your global mobility content up to date.</p>
        </div>
        <div className="admin-sign-in-brand-footer">© 360Five Immigration</div>
      </section>

      <section className="admin-sign-in-content">
        <div className="admin-sign-in-mobile-logo">
          <Link to="/" aria-label="360Five home"><img src={logoImage} alt="360Five Immigration" /></Link>
        </div>
        <div className="admin-sign-in-card">
          <div className="admin-sign-in-heading">
            <span className="admin-sign-in-eyebrow">ADMINISTRATION</span>
            <h2>Welcome back</h2>
            <p>Sign in to access the country management workspace.</p>
          </div>

          {error && <div className="admin-sign-in-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="admin-sign-in-field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>
            <label className="admin-sign-in-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>
            <label className="admin-sign-in-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>
            <button
              className="admin-sign-in-submit"
              type="submit"
              disabled={checkingSession || submitting}
            >
              {checkingSession ? 'Checking session…' : submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="admin-sign-in-help">Need access? Contact your system administrator.</p>
        </div>
      </section>
    </main>
  )
}

export default AdminSignInPage
