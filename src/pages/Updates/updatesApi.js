const updatesEndpoint =
  import.meta.env.VITE_UPDATES_API_URL || 'http://127.0.0.1:8000/api/updates'

async function getUpdateResponse(endpoint) {
  const response = await fetch(endpoint)
  if (!response.ok) {
    const error = new Error(`Updates API returned ${response.status}.`)
    error.status = response.status
    throw error
  }

  return response.json()
}

function mapUpdate(update) {
  if (
    !update ||
    typeof update !== 'object' ||
    !Number.isInteger(Number(update.id)) ||
    typeof update.title !== 'string' ||
    typeof update.image !== 'string' ||
    typeof update.description !== 'string' ||
    !Array.isArray(update.paragraphs)
  ) {
    throw new Error('The updates API returned an update with invalid fields.')
  }

  return {
    ...update,
    id: Number(update.id),
  }
}

export async function fetchUpdates() {
  const payload = await getUpdateResponse(updatesEndpoint)
  if (!Array.isArray(payload)) {
    throw new Error('The updates API response did not contain an update list.')
  }

  return payload.map(mapUpdate)
}

export async function fetchUpdateById(id) {
  const updateId = Number(id)
  if (!Number.isInteger(updateId) || updateId < 1) {
    const error = new Error('The update ID must be a positive number.')
    error.status = 404
    throw error
  }

  return mapUpdate(
    await getUpdateResponse(`${updatesEndpoint}/${encodeURIComponent(updateId)}`),
  )
}

export function formatUpdateDate(value) {
  if (!value) return null

  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) {
    throw new Error('The updates API returned an invalid publication date.')
  }

  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date)
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]))

  return `${dateParts.day}-${dateParts.month}-${dateParts.year}`
}
