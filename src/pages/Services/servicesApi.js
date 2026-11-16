const servicesEndpoint =
  import.meta.env.VITE_SERVICES_API_URL || 'http://127.0.0.1:8000/api/services'

async function getServiceResponse(endpoint) {
  const response = await fetch(endpoint)
  if (!response.ok) {
    const error = new Error(`Services API returned ${response.status}.`)
    error.status = response.status
    throw error
  }

  return response.json()
}

function mapService(service) {
  return {
    ...service,
    detailImage: service.detail_image,
  }
}

export async function fetchServices() {
  const payload = await getServiceResponse(servicesEndpoint)
  if (!Array.isArray(payload)) {
    throw new Error('The services API response did not contain a service list.')
  }

  return payload.map(mapService)
}

export async function fetchServiceBySlug(slug) {
  const payload = await getServiceResponse(
    `${servicesEndpoint}/${encodeURIComponent(slug)}`,
  )
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('The services API response did not contain a service.')
  }

  return mapService(payload)
}
