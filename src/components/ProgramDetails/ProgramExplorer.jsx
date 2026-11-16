import { useEffect, useMemo, useState } from 'react'
import ProgramCard from './ProgramCard'
import ProgramDetailsModal from './ProgramDetailsModal'

const temporaryCountriesApi =
  'https://countriesnow.space/api/v0.1/countries/flag/images'
const countryRequests = new Map()
const temporaryFeaturedCountries = {
  Residence: [
    'Australia',
    'Cyprus',
    'Greece',
    'Latvia',
    'Malaysia',
    'Mauritius',
    'Singapore',
  ],
  Citizenship: [
    'Antigua and Barbuda',
    'Dominica',
    'Grenada',
    'St. Kitts and Nevis',
    'St. Lucia',
    'Turkey',
  ],
}

function getCountryRows(endpoint) {
  if (!countryRequests.has(endpoint)) {
    const request = fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Country API returned ${response.status}.`)
        }
        return response.json()
      })
      .then((payload) => {
        if (payload?.error) {
          throw new Error(payload.msg || 'The country API returned an error.')
        }

        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : null

        if (!rows) {
          throw new Error('The country API response did not contain a country list.')
        }

        return rows
      })
      .catch((error) => {
        countryRequests.delete(endpoint)
        throw error
      })

    countryRequests.set(endpoint, request)
  }

  return countryRequests.get(endpoint)
}

function normalizeCategory(value) {
  const category = String(value || '').trim().toLowerCase()
  if (category.includes('citizen')) return 'Citizenship'
  if (category.includes('residen')) return 'Residence'
  return null
}

function normalizeCountryName(value) {
  return String(value)
    .toLowerCase()
    .replace(/\bsaint\b/g, 'st')
    .replace(/[^a-z0-9]/g, '')
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not available from this data source'
  }
  return String(value)
}

function mapCountryRow(row, category) {
  const countryCategory = normalizeCategory(row.category)

  return {
    id: row.id ?? row.iso3 ?? row.name,
    country: row.name || 'Unknown country',
    flag: row.flag_image || row.flag || '',
    type: countryCategory || category,
    minimumInvestment: formatValue(row.minimum_investment),
    benefit: formatValue(row.key_benefit),
    processingTime: formatValue(row.processing_time),
    detailsIntro: row.details_intro || '',
    benefits: row.benefits || '',
    requirements: row.requirements || '',
    steps: row.steps || '',
  }
}

function ProgramExplorer({ category, endpoint }) {
  const requestedCategory = normalizeCategory(category)
  const countriesEndpoint =
    endpoint || import.meta.env.VITE_COUNTRIES_API_URL || temporaryCountriesApi
  const isTemporarySource =
    !endpoint && !import.meta.env.VITE_COUNTRIES_API_URL
  const [rows, setRows] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    getCountryRows(countriesEndpoint)
      .then((countryRows) => {
        if (isCurrent) {
          setRows(countryRows)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message || 'Unable to load country data.')
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [countriesEndpoint, retryCount])

  const programs = useMemo(() => {
    return rows
      .filter((row) => {
        const rowCategory = normalizeCategory(row.category)
        const matchesCategory = !rowCategory || rowCategory === requestedCategory
        const featuredCountries = temporaryFeaturedCountries[requestedCategory] || []
        const matchesTemporarySelection =
          !isTemporarySource ||
          featuredCountries.some(
            (country) => normalizeCountryName(country) === normalizeCountryName(row.name),
          )
        return matchesCategory && matchesTemporarySelection
      })
      .map((row) => mapCountryRow(row, requestedCategory))
      .filter((program) => program.country !== 'Unknown country')
  }, [isTemporarySource, requestedCategory, rows])

  return (
    <>
      {isTemporarySource && (
        <p className="program-data-notice">
          Temporary public country data is in use for the sample countries
          shown. It provides names and flags only, not program details.
        </p>
      )}
      {loading && <p role="status">Loading {category.toLowerCase()} programs...</p>}
      {error && (
        <div className="program-data-error" role="alert">
          <p>Unable to load programs: {error}</p>
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
      {!loading && !error && programs.length === 0 && (
        <p>No {category.toLowerCase()} programs are available.</p>
      )}
      {!loading && !error && programs.length > 0 && (
        <div className="residence-program-grid">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onSelect={setSelectedProgram}
            />
          ))}
        </div>
      )}
      {selectedProgram && (
        <ProgramDetailsModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </>
  )
}

export default ProgramExplorer
