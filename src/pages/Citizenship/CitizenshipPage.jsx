import citizenshipHeroImage from '../../assets/contact card img.jpg'
import ProgramExplorer from '../../components/ProgramDetails/ProgramExplorer'

const citizenshipCountriesEndpoint =
  '/api/countries?category=Citizenship'

function CitizenshipPage() {
  return (
    <main className="residence-page citizenship-page">
      <section className="services-hero residence-intro" aria-labelledby="citizenship-title">
        <img
          className="services-hero-image residence-intro-image"
          src={citizenshipHeroImage}
          alt="City architecture representing international opportunities"
        />
        <div className="services-hero-copy residence-intro-copy">
          <span className="service-label">Citizenship</span>
          <h1 id="citizenship-title">Leading Citizenship by Investment Programs</h1>
          <p>
            Citizenship by investment programs offer individuals and families
            the opportunity to obtain citizenship in another country through
            qualifying investment. A second citizenship can support greater
            global mobility and provide additional options for your family and
            future plans. Each program has its own eligibility rules,
            investment routes, and application process, so it is important to
            choose an option that suits your circumstances.
          </p>
          <a className="enquiry-link" href="/contact">For Enquiries</a>
        </div>
      </section>

      {/* <nav className="residence-page-nav" aria-label="Citizenship page sections">
        <a href="#citizenship-programs">Citizenship by Investment Programs</a>
        <a href="#citizenship-planning">Citizenship Planning</a>
        <a href="#citizenship-points">Important Points</a>
      </nav> */}

      <section
        className="residence-page-programs"
        id="citizenship-programs"
        aria-labelledby="citizenship-programs-title"
      >
        <div className="home-section-container">
          <h2 id="citizenship-programs-title">Citizenship by Investment Programs</h2>
          <ProgramExplorer
            category="Citizenship"
            endpoint={citizenshipCountriesEndpoint}
          />
        </div>
      </section>

      <section
        className="residence-information"
        id="citizenship-planning"
        aria-labelledby="citizenship-planning-title"
      >
        <div className="home-section-container">
          <h2 id="citizenship-planning-title">Citizenship Planning</h2>
          <p>
            The right citizenship strategy depends on your family, current
            citizenship, mobility needs, and long-term priorities. Our team can
            help you compare available programs and understand the steps and
            responsibilities involved.
          </p>
        </div>
      </section>

      <section
        className="residence-information residence-information-muted"
        id="citizenship-points"
        aria-labelledby="citizenship-points-title"
      >
        <div className="home-section-container">
          <h2 id="citizenship-points-title">Important Points</h2>
          <p>
            Eligibility criteria, investment requirements, and processing
            timelines differ by country and may change. Review current program
            rules and any obligations with an adviser before proceeding.
          </p>
        </div>
      </section>
    </main>
  )
}

export default CitizenshipPage
