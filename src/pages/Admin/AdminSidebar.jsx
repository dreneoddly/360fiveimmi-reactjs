import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { signOut } from './authApi'

const navigation = [
  { label: 'Countries', to: '/admin/countries', icon: 'globe' },
  { label: 'Services', to: '/admin/services', icon: 'services' },
  { label: 'Updates', to: '/admin/updates', icon: 'updates' },
  { label: 'Contact messages', to: '/admin/contact', icon: 'messages' },
  { label: 'Admin accounts', to: '/admin/accounts', icon: 'users' },
]

function AdminIcon({ name, size = 18 }) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></>,
    services: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    updates: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m21 15-5-5L5 19" /></>,
    messages: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      className="country-admin-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function AdminSidebar({ user }) {
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    setSignOutError('')
    try {
      await signOut()
      window.location.assign('/admin/sign-in')
    } catch (error) {
      setSignOutError(error.message || 'Unable to sign out.')
    }
  }

  return (
    <aside className="country-admin-sidebar">
      <Link className="country-admin-brand" to="/" aria-label="360Five home">
        <span className="country-admin-brand-mark">360</span>
        <span>360FIVE <small>IMMIGRATION</small></span>
      </Link>
      <div className="country-admin-menu-label">WORKSPACE</div>
      <nav className="country-admin-navigation" aria-label="Admin navigation">
        {navigation.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) => `country-admin-nav-link${isActive ? '' : ' country-admin-nav-link-secondary'}`}
            to={to}
          >
            <AdminIcon name={icon} />
            <span>{label}</span>
            <AdminIcon name="chevron" size={15} />
          </NavLink>
        ))}
      </nav>
      {signOutError && <div className="country-admin-alert admin-sidebar-error" role="alert">{signOutError}</div>}
      <div className="country-admin-sidebar-bottom">
        <span className="country-admin-avatar">{(user?.name || 'A').slice(0, 2).toUpperCase()}</span>
        <span className="country-admin-user">{user?.name || 'Administrator'}<small>{user?.email || 'Signed in'}</small></span>
        <button className="country-admin-sign-out" type="button" onClick={handleSignOut} aria-label="Sign out" title="Sign out">
          <AdminIcon name="logout" size={17} />
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
