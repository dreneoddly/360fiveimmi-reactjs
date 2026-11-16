import { Link } from 'react-router-dom'
import logoImage from '../../assets/360FIVE_immi_AI-02.svg'

const firmLinks = [
  ['About', '/about'],
  ['Worldwide Office', '/about'],
  ['Events and Webinars', '/updates'],
  ['Research and Publication', '/updates'],
  ['News room', '/updates'],
  ['Contact', '/contact'],
  ['Career', '/about'],
]

const serviceLinks = [
  ['Residence and Citizenship', '/residence'],
  ['Real Estate', '/services'],
  ['Education', '/services'],
  ['Concierge', '/services'],
  ['Goverment', '/services'],
  ['Services', '/services'],
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="footer-logo" to="/" aria-label="360 Five home">
            <img src={logoImage} alt="360 Five" />
          </Link>
          <p>360five Immigration is the global leader in residence and citizenship planning. Each year, hundreds of wealthy individuals and their advisors rely on our expertise and experience in this area.</p>
          <div className="footer-socials" aria-label="Social media">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://t.me/" target="_blank" rel="noreferrer" aria-label="Telegram">➤</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
          </div>
        </div>

        <FooterLinkColumn title="Our Firm" links={firmLinks} />
        <FooterLinkColumn title="Our Service" links={serviceLinks} />

        <div className="footer-contact">
          <h2>Contact us</h2>
          <a href="https://maps.google.com/?q=Morgan+Tower+Phnom+Penh" target="_blank" rel="noreferrer"><span aria-hidden="true">✦</span> Phnom Penh, Cambodia</a>
          <a href="mailto:babual.pirhar@lohaneco.com"><span aria-hidden="true">✉</span> babual.pirhar@lohaneco.com</a>
          <a href="tel:+85570228907"><span aria-hidden="true">⌕</span> (+855) 70 228 907</a>
        </div>
      </div>
    </footer>
  )
}

function FooterLinkColumn({ title, links }) {
  return (
    <div className="footer-links">
      <h2>{title}</h2>
      {links.map(([label, href]) => (
        <Link key={label} to={href}>{label}</Link>
      ))}
    </div>
  )
}

export default Footer
