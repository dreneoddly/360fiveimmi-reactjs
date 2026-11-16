function ProgramCard({ program, onSelect }) {
  const {
    country,
    flag,
    type,
    benefit,
    minimumInvestment,
    processingTime,
  } = program

  return (
    <article className="residence-program-card">
      <div className="program-card-top">
        {flag && <img className="program-flag" src={flag} alt={`${country} flag`} />}
        <span className={`program-type${type === 'Citizenship' ? ' citizenship-program-type' : ''}`}>
          {type}
        </span>
      </div>
      <h3>{country}</h3>
      <p className="program-benefit">
        <strong>Key Benefit:</strong> {benefit}
      </p>
      <dl className="program-details">
        <div>
          <dt>{type === 'Residence' ? 'Minimum investment' : 'Investment requirements'}</dt>
          <dd>{minimumInvestment}</dd>
        </div>
        <div>
          <dt>Processing time</dt>
          <dd>{processingTime}</dd>
        </div>
      </dl>
      <span className="program-card-link">View benefits, requirements &amp; process</span>
      <button
        className="residence-program-trigger"
        type="button"
        aria-label={`View ${country} ${type.toLowerCase()} program details`}
        onClick={() => onSelect(program)}
      />
    </article>
  )
}

export default ProgramCard
