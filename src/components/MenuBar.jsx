import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logoImage from '../assets/360FIVE_immi_AI-02.svg'
import { defaultMenuItems } from './menuConfig'

function MenuBar({
  items = defaultMenuItems,
  contactHref = '/contact',
  // phone = '+855 12 255 256',
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (

    <header className="site-header">
      <div className="header-inner">
        <Link
          className="header-logo"
          to="/"
          aria-label="360 Five home"
        >
          <img src={logoImage} alt="360 Five" />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span /><span />
          <span className="sr-only">Toggle navigation</span>
        </button>

        <nav
          id="primary-navigation"
          className={`primary-navigation ${menuOpen ? 'is-open' : ''}`}
        >
          <div className="navigation-links">
            {items.map((item) => (
              <NavLink
                className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}
                to={item.href}
                key={item.label}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              className="header-contact-link"
              to={contactHref}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">▤</span>
              Contact
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default MenuBar
