import heroImage from './assets/contact card img.jpg'
import ProgramExplorer from './components/ProgramDetails/ProgramExplorer'

const residenceCountriesEndpoint =
  '/api/countries?category=Residence'
const citizenshipCountriesEndpoint =
  '/api/countries?category=Citizenship'

const heroContent = {
  image: heroImage,
  imagePosition: 'center',
  title: 'The Global Leader in Residence and Citizenship Planning',
  subtitle: 'Invest in a Secure Future Today',
  buttonText: 'Review Program Options',
  buttonLink: '#programs',
}

const companyStats = [
  { value: '50+', label: 'Offices worldwide' },
  { value: '30K+', label: 'Clients served' },
  { value: '46+', label: 'Residence and citizenship options' },
  { value: '72+', label: 'Years leading the sector' },
]

const specialistServices = [
  {
    title: 'Private Client Solutions',
    text: 'Tailored guidance for individuals and families navigating international residence, citizenship, and wealth planning.',
    link: '/services/residence-citizenship',
  },
  {
    title: 'Government Advisory Practice',
    text: 'Strategic advice and insight to support governments developing and strengthening residence and citizenship programs.',
    link: '/services/residence-citizenship',
  },
  {
    title: 'Supporting Private Client',
    text: 'Specialist support for cross-border tax, real estate, and education decisions as part of your broader plans.',
    link: '/services/tax',
  },
]

const updateStories = [
  {
    date: '21 August 2026',
    title: 'Supporting Private Client',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85',
    description: 'Refined by over 25 years of residence and citizenship advisory sector leadership, Henley & Partners’ unique strategic advisory process creates lifelong value for you and your family.',
  },
  {
    title: 'Supporting Private Client',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=85',
    description: 'Refined by over 25 years of residence and citizenship advisory sector leadership, Henley & Partners...',
  },
  {
    title: 'Supporting Private Client',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=85',
    description: 'Refined by over 25 years of residence and citizenship advisory sector leadership, Henley & Partners...',
  },
  {
    title: 'Supporting Private Client',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=500&q=85',
    description: 'Refined by over 25 years of residence and citizenship advisory sector leadership, Henley & Partners...',
  },
]

function App() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-art" aria-hidden="true">
          <img
            className="hero-image"
            src={heroContent.image}
            alt=""
            style={{ objectPosition: heroContent.imagePosition }}
          />
        </div>

        <div className="hero-panel">
          <h1 id="hero-title" className="hero-title">
            {heroContent.title}
          </h1>
          <p className="hero-subtitle">{heroContent.subtitle}</p>
          <a className="hero-button" href={heroContent.buttonLink}>
            {heroContent.buttonText}
          </a>
        </div>
      </section>

      <section className="why-360five" aria-labelledby="why-360five-title">
        <div className="home-section-container">
          <h2 id="why-360five-title">Why 360Five Immigration</h2>
          <p className="why-360five-copy">
            With over 25 years of institutional experience, 360Five Immigration
            is supported by an integrated residence and citizenship advisory
            firm. Through thoughtful bespoke advice and citizenship planning
            solutions, we help individuals and families make informed decisions
            and navigate their global mobility goals with confidence.
          </p>
          <dl className="company-stats">
            {companyStats.map((stat) => (
              <div className="company-stat" key={stat.label}>
                <dt>{stat.value}</dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="residence-programs" id="programs" aria-labelledby="programs-title">
        <div className="home-section-container">
          <h2 id="programs-title">Top-Tier Residence Programs</h2>
          <a className="program-category-link" href="/services/residence-citizenship">
            Residence by Investment Programs <span aria-hidden="true">→</span>
          </a>
          <ProgramExplorer
            category="Residence"
            endpoint={residenceCountriesEndpoint}
          />
        </div>
      </section>

      <section className="citizenship-programs" aria-labelledby="citizenship-title">
        <div className="home-section-container">
          <h2 id="citizenship-title">Top-Tier Citizenship Programs</h2>
          <a className="program-category-link" href="/services/residence-citizenship">
            Citizenship by Investment Programs <span aria-hidden="true">→</span>
          </a>
          <ProgramExplorer
            category="Citizenship"
            endpoint={citizenshipCountriesEndpoint}
          />
        </div>
      </section>

      <section className="specialist-services" aria-labelledby="specialist-services-title">
        <div className="home-section-container specialist-services-layout">
          <div className="specialist-services-list">
            <h2 id="specialist-services-title">Specialist Services</h2>
            {specialistServices.map((service) => (
              <article className="specialist-service" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a className="specialist-service-link" href={service.link}>Learn more...</a>
              </article>
            ))}
          </div>
          <img
            className="specialist-services-image"
            src={heroImage}
            alt="City buildings in Phnom Penh"
          />
        </div>
      </section>

      <section className="home-updates" aria-labelledby="home-updates-title">
        <div className="home-section-container">
          <h2 id="home-updates-title">Update</h2>
          <div className="home-updates-layout">
            <article className="home-update-feature">
              <time dateTime="2026-08-21">{updateStories[0].date}</time>
              <h3>{updateStories[0].title}</h3>
              <p>{updateStories[0].description}</p>
              <a className="specialist-service-link home-update-read-more" href="/updates">Read more...</a>
              <img src={updateStories[0].image} alt="Colleagues collaborating in a planning meeting" />
            </article>
            <div className="home-update-list">
              {updateStories.slice(1).map((story, index) => (
                <article className="home-update-item" key={`${story.title}-${index}`}>
                  <img src={story.image} alt="" />
                  <div className="home-update-item-copy">
                    <h3>{story.title}</h3>
                    <p>{story.description}</p>
                    <a className="specialist-service-link home-update-read-more" href="/updates">Read more...</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
