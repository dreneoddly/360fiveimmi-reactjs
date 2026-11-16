const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/$/, '')

export class AuthApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.errors = errors
  }
}

async function fetchApi(url, options) {
  try {
    return await fetch(url, options)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new AuthApiError(
        `Cannot reach the Laravel API at ${apiBaseUrl}. Make sure Laravel is running and the React dev server is using its API proxy.`,
      )
    }
    throw error
  }
}

async function readJsonResponse(response) {
  const text = await response.text()
  let payload = {}

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      if (response.status === 419) {
        throw new AuthApiError(
          'The sign-in security check failed (419). Refresh the page and try again. If it keeps happening, restart the Laravel and React servers.',
          response.status,
        )
      }
      if (!response.ok) {
        throw new AuthApiError(
          `The Laravel API returned HTTP ${response.status}. Check that Laravel is running and review its log for details.`,
          response.status,
        )
      }
      throw new AuthApiError('The authentication service returned an invalid response.', response.status)
    }
  }

  if (!response.ok) {
    const validationMessage = Object.values(payload.errors || {})[0]?.[0]
    const message = response.status === 419
      ? 'The sign-in security check failed (419). Refresh the page and try again. If it keeps happening, restart the Laravel and React servers.'
      : response.status >= 500
        ? `The Laravel server could not complete this request (HTTP ${response.status}). Check the Laravel log for details.`
        : validationMessage || payload.message || 'Unable to complete the authentication request.'
    throw new AuthApiError(
      message,
      response.status,
      payload.errors || {},
    )
  }

  return payload
}

async function initializeCsrf() {
  const response = await fetchApi(`${apiBaseUrl}/auth/csrf`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (!response.ok) {
    throw new AuthApiError('Unable to initialize secure sign in. Please try again.', response.status)
  }

  const payload = await readJsonResponse(response)
  const token = payload.csrf_token
  if (!token) {
    throw new AuthApiError('The server did not return a CSRF token. Check the API session and CORS settings.')
  }
  return token
}

export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('X-CSRF-TOKEN', await initializeCsrf())
  }

  return fetchApi(url, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })
}

export async function signIn(credentials) {
  const response = await apiFetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  const payload = await readJsonResponse(response)
  return payload.user
}

export async function getCurrentUser() {
  const response = await apiFetch(`${apiBaseUrl}/auth/me`)
  const payload = await readJsonResponse(response)
  return payload.user
}

export async function signOut() {
  const response = await apiFetch(`${apiBaseUrl}/auth/logout`, { method: 'POST' })
  await readJsonResponse(response)
}

export function isUnauthenticated(error) {
  return error instanceof AuthApiError && [401, 403].includes(error.status)
}
