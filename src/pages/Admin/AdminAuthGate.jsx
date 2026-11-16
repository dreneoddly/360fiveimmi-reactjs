import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser, isUnauthenticated } from './authApi'

function AdminAuthGate({ children }) {
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let isCurrent = true

    getCurrentUser()
      .then((currentUser) => {
        if (isCurrent) {
          setUser(currentUser)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent && !isUnauthenticated(requestError)) {
          setError(requestError.message || 'Unable to verify your sign-in.')
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [attempt])

  if (loading) {
    return <main className="admin-auth-check" role="status">Checking your sign in…</main>
  }

  if (error) {
    return (
      <main className="admin-auth-check">
        <p role="alert">{error}</p>
        <button type="button" onClick={() => { setLoading(true); setAttempt((value) => value + 1) }}>
          Try again
        </button>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/admin/sign-in" replace state={{ from: location }} />
  }

  return children(user)
}

export default AdminAuthGate
