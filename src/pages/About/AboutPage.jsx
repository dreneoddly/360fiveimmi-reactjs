import { Link } from 'react-router-dom'

const content = {
  hero: {
    eyebrow: 'About',
    title: 'About us',
    description: 'Where you live can shape how you work, raise a family, and plan for the future. We help individuals and families explore residence and citizenship options with thoughtful, personal guidance. From understanding potential destinations to navigating the application journey, our team brings clarity to important international decisions.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
    image_alt: 'A city representing the international opportunities we help clients explore',
  },
  firm: {
    label: 'What we do',
    title: 'Our firm',
    heading: 'A considered approach to residence and citizenship planning.',
    paragraphs: [
      '360Five Immigration supports clients as they assess opportunities across borders. We bring together private-client insight and immigration expertise to help make complex choices easier to understand.',
      'Working alongside clients and their professional advisers, we provide tailored guidance from the first conversation through each stage of the planning process.',
    ],
  },
  principles: {
    vision: {
      title: 'Our Vision',
      description: 'Enhancing human potential through global citizenship. We work towards a world where the sensible flow of people and capital between countries contributes to global peace and prosperity, and where people live with dignity and security in their country of birth or choice.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85',
      image_alt: 'Colleagues sharing ideas during a planning session',
    },
    purpose: {
      title: 'Our Purpose',
      description: 'Advancing global citizenship while supporting the development of countries and their people. We enable families to invest and live in countries of their choice, and assist governments in creating value for their communities.',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85',
      image_alt: 'A team collaborating around a conference table',
    },
    detail: {
      title: 'Our Principles',
      description: 'Like our clients, we place particular emphasis on a practical approach and impeccable quality. To ensure that we consistently satisfy the high expectations of our clients, our firm is guided by four principles that form the basis of how we work:',
      items: [
        'To offer our services only where we can be of genuine assistance',
        'To present our clients with a highly professional and personal service',
        'To find the best solutions available by means of a rigorous and efficient approach',
        'To base our business on honesty, integrity, and the highest ethical standards',
      ],
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85',
      image_alt: 'A team presenting ideas and reviewing a shared plan',
    },
  },
  team: {
    title: 'Meet our amazing team',
    subtitle: 'What we do',
    members: [{ name: 'Babual Parihar', role: 'Director', image: '', image_alt: '' }],
  },
  highlights: [
    {
      title: 'Our Clients',
      description: 'Our clients include entrepreneurs, investors, high-net-worth individuals, and families from around the world. We provide considered guidance for people exploring new opportunities and a more flexible future.',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1000&q=85',
      image_alt: 'Business professionals meeting in a modern office',
    },
    {
      title: 'Key People',
      description: 'Our team brings together experienced professionals with a personal approach. We work collaboratively, listen carefully, and keep clients informed throughout each stage of their journey.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85',
      image_alt: 'Colleagues collaborating during a team meeting',
    },
    {
      title: 'Careers',
      description: 'We value thoughtful, curious people who care about making a difference for clients. Our team aims to create a supportive environment where talent can grow and good ideas are welcomed.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85',
      image_alt: 'Professionals discussing an idea at work',
    },
    {
      title: 'Partner with Us',
      description: 'We work with professional advisers and organizations who share our commitment to thoughtful client service. By working together, we can provide joined-up guidance tailored to each client’s needs.',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85',
      image_alt: 'Advisers speaking with a client in a meeting',
    },
    {
      title: 'Philanthropy',
      description: 'We believe responsible business includes contributing positively to the communities around us. We are committed to acting with care, integrity, and respect in our work and relationships.',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=85',
      image_alt: 'People working together in a community setting',
    },
  ],
}

function AboutPage() {
  const { hero, firm, principles, team, highlights } = content

  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <img className="about-hero-image" src={hero.image} alt={hero.image_alt} />
        <div className="about-hero-copy">
          <span className="about-eyebrow">{hero.eyebrow}</span>
          <h1 id="about-title">{hero.title}</h1>
          <p>{hero.description}</p>
          <Link className="about-enquiry-link" to="/contact">For Enquiries</Link>
        </div>
      </section>

      <section className="about-firm" aria-labelledby="about-firm-title">
        <div className="about-firm-inner">
          <div className="about-firm-heading">
            <span className="about-section-label">{firm.label}</span>
            <h2 id="about-firm-title">{firm.title}</h2>
          </div>
          <div className="about-firm-copy">
            <h3>{firm.heading}</h3>
            {firm.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>

      <section className="about-principles" aria-label="Our vision and purpose">
        <div className="about-principles-inner">
          {[principles.vision, principles.purpose].map((principle) => (
            <article className="about-principle" key={principle.title}>
              <h2>{principle.title}</h2>
              <p>{principle.description}</p>
              <img src={principle.image} alt={principle.image_alt} loading="lazy" />
            </article>
          ))}
        </div>
      </section>

      <section className="about-principles-detail" aria-labelledby="about-principles-title">
        <div className="about-principles-detail-inner">
          <img
            className="about-principles-image"
            src={principles.detail.image}
            alt={principles.detail.image_alt}
            loading="lazy"
          />
          <div className="about-principles-copy">
            <h2 id="about-principles-title">{principles.detail.title}</h2>
            <p>{principles.detail.description}</p>
            <ul>
              {principles.detail.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="about-team" aria-labelledby="about-team-title">
        <header className="about-team-heading">
          <h2 id="about-team-title">{team.title}</h2>
          <p>{team.subtitle}</p>
        </header>
        <div className="about-team-grid">
          {team.members.map((member) => (
            <article className="about-team-card" key={member.name}>
              {member.image
                ? <img className="about-team-portrait" src={member.image} alt={member.image_alt || member.name} loading="lazy" />
                : (
                  <div className="about-team-portrait" role="img" aria-label={`Portrait placeholder for ${member.name}`}>
                    {member.name.split(/\s+/).map((namePart) => namePart[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
              <div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-highlights" aria-label="More about 360Five Immigration">
        {highlights.map((highlight, index) => (
          <article
            className={`about-highlight${index % 2 === 0 ? ' about-highlight-muted' : ''}`}
            key={highlight.title}
          >
            <div className="about-highlight-copy">
              <div className="about-highlight-copy-inner">
                <h2>{highlight.title}</h2>
                <p>{highlight.description}</p>
              </div>
            </div>
            <img src={highlight.image} alt={highlight.image_alt} loading="lazy" />
          </article>
        ))}
      </section>
    </main>
  )
}

export default AboutPage
