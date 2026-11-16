import { Link } from 'react-router-dom'
import heroImage from '../../assets/contact card img.jpg'

function ContactCard({ backgroundImage = heroImage }) {
  return (
    <section className="contact-card-banner" aria-labelledby="contact-card-title">
      <div className="contact-card-copy">
        <h2 id="contact-card-title">Contact Us Today</h2>
        <p>As the global leader in residence and citizenship planning, 360Five Immigration is best placed to advise you and your family. Contact us for a free consultation.</p>
        <Link className="contact-card-button" to="/contact">Enquiry</Link>
      </div>
      <div
        className="contact-card-image"
        role="img"
        aria-label="Modern buildings in Phnom Penh"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
    </section>
  )
}

export default ContactCard
