import { useEffect, useRef } from 'react'

function getDetailItems(value) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }

  if (typeof value !== 'string' || !value.trim()) {
    return ['Not available from this data source.']
  }

  const trimmedValue = value.trim()
  if (trimmedValue.startsWith('[')) {
    try {
      const parsedValue = JSON.parse(trimmedValue)
      if (Array.isArray(parsedValue)) {
        return parsedValue.map(String).filter(Boolean)
      }
    } catch {
      return trimmedValue.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    }
  }

  return trimmedValue
    .split(/\r?\n/)
    .map((item) => item.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean)
}

function ProgramDetailsModal({ program, onClose }) {
  const dialogRef = useRef(null)
  const benefits = getDetailItems(program.benefits)
  const requirements = getDetailItems(program.requirements)
  const steps = getDetailItems(program.steps)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="program-details-modal"
      aria-labelledby="program-modal-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <header className="program-modal-header">
        {program.flag && <img src={program.flag} alt="" />}
        <div className="program-modal-heading">
          <h2 id="program-modal-title">{program.country}</h2>
          <p className="program-modal-category">{program.type} by Investment</p>
        </div>
        <button className="program-modal-close" type="button" aria-label="Close program details" onClick={onClose}>
          ×
        </button>
      </header>

      <div className="program-modal-summary" aria-label={`${program.country} program overview`}>
        <div>
          <span>Minimum investment</span>
          <strong>{program.minimumInvestment}</strong>
        </div>
        <div>
          <span>Key benefit</span>
          <strong>{program.benefit}</strong>
        </div>
        <div>
          <span>Processing time</span>
          <strong>{program.processingTime}</strong>
        </div>
      </div>

      <div className="program-modal-content">
        <p className="program-modal-intro">
          {program.detailsIntro?.trim() ||
            `Program details for ${program.country} are shown below when provided by the current data source.`}
        </p>
        <section aria-labelledby="program-modal-benefits">
          <h3 id="program-modal-benefits">Benefits</h3>
          <ul>{benefits.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
        </section>
        <section aria-labelledby="program-modal-requirements">
          <h3 id="program-modal-requirements">Requirements</h3>
          <ul>{requirements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
        </section>
        <section aria-labelledby="program-modal-processing">
          <h3 id="program-modal-processing">Steps</h3>
          <ol>{steps.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>
        </section>
      </div>

      <footer className="program-modal-footer">
        <a href="/contact">Ask about {program.country}</a>
      </footer>
    </dialog>
  )
}

export default ProgramDetailsModal
