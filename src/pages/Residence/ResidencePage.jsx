import residenceHeroImage from '../../assets/contact card img.jpg'
import ProgramExplorer from '../../components/ProgramDetails/ProgramExplorer'

const residenceCountriesEndpoint =
  '/api/countries?category=Residence'

function ResidencePage() {
  return (
    <main className="residence-page">
      <section className="services-hero residence-intro" aria-labelledby="residence-title">
        <img
          className="services-hero-image residence-intro-image"
          src={residenceHeroImage}
          alt="City architecture representing international opportunities"
        />
        <div className="services-hero-copy residence-intro-copy">
          <span className="service-label">Residence</span>
          <h1 id="residence-title">Leading Residence by Investment Programs</h1>
          <p>
            Individuals of talent and means need not limit their lives and
            business interests to one country. Residence by investment programs,
            also known as golden visa programs, provide high-net-worth
            individuals with the option to relocate and the right to live, work,
            study, and receive healthcare in their new countries of residence.
            Being able to change residence to a suitable country or have multiple
            residences is an increasingly important aspect of international
            planning for private clients.
          </p>
          <a className="enquiry-link" href="/contact">For Enquiries</a>
        </div>
      </section>

      {/* <nav className="residence-page-nav" aria-label="Residence page sections">
        <a href="#residence-programs">Residence by Investment Programs</a>
        <a href="#residence-planning">Residence Planning</a>
        <a href="#important-points">Important Points</a>
      </nav> */}

      <section
        className="residence-page-programs"
        id="residence-programs"
        aria-labelledby="residence-programs-title"
      >
        <div className="home-section-container">
          <h2 id="residence-programs-title">Residence by Investment Programs</h2>
          <ProgramExplorer
            category="Residence"
            endpoint={residenceCountriesEndpoint}
          />
        </div>
      </section>

      <section
        className="residence-information"
        id="residence-planning"
        aria-labelledby="residence-planning-title"
      >
        <div className="home-section-container">
          <h2 id="residence-planning-title">Residence Planning</h2>
          <p>
            The right residence strategy depends on your personal, family, and
            business priorities. Our team helps compare destinations, understand
            eligibility, and plan a route that supports your long-term goals.
          </p>
        </div>
      </section>

      <section
        className="residence-information residence-information-muted"
        id="important-points"
        aria-labelledby="important-points-title"
      >
        <div className="home-section-container">
          <h2 id="important-points-title">Important Points</h2>
          <p>
            Program rules, investment options, and processing times can change.
            Review current requirements and residency obligations with an
            adviser before making a decision.
          </p>
        </div>
      </section>
    </main>
  )
}

export default ResidencePage
