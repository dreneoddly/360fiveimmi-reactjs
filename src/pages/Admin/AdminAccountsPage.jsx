import { Link } from 'react-router-dom'
import AdminUsersPanel from './AdminUsersPanel'
import AdminSidebar from './AdminSidebar'
import './CountryAdminPage.css'

function AdminAccountsPage({ user }) {
  return (
    <main className="country-admin">
      <AdminSidebar user={user} />

      <div className="country-admin-main">
        <header className="country-admin-topbar">
          <div className="country-admin-breadcrumb">Admin <span>/</span> Admin accounts</div>
          <Link className="country-admin-view-site" to="/">
            View website <span aria-hidden="true">→</span>
          </Link>
        </header>
        <section className="country-admin-content">
          <div className="country-admin-heading">
            <div>
              <p className="country-admin-eyebrow">WORKSPACE ACCESS</p>
              <h1>Admin accounts</h1>
              <p className="country-admin-subtitle">Manage who can sign in to the admin workspace.</p>
            </div>
          </div>
          <AdminUsersPanel currentUser={user} />
        </section>
      </div>
    </main>
  )
}

export default AdminAccountsPage
