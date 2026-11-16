import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout'
import HomePage from '../pages/Home/HomePage'
import ResidencePage from '../pages/Residence/ResidencePage'
import CitizenshipPage from '../pages/Citizenship/CitizenshipPage'
import ServicesPage from '../pages/Services/ServicesPage'
import ServiceDetailedPage from '../pages/Services/ServiceDetailedPage'
import UpdatesPage from '../pages/Updates/UpdatesPage'
import UpdateDetailedPage from '../pages/Updates/UpdateDetailedPage'
import AboutPage from '../pages/About/AboutPage'
import ContactPage from '../pages/Contact/ContactPage'
import NotFoundPage from '../pages/NotFound/NotFoundPage'
import CountryAdminPage from '../pages/Admin/CountryAdminPage'
import ServicesAdminPage from '../pages/Admin/ServicesAdminPage'
import UpdatesAdminPage from '../pages/Admin/UpdatesAdminPage'
import ContactInquiriesAdminPage from '../pages/Admin/ContactInquiriesAdminPage'
import AdminAccountsPage from '../pages/Admin/AdminAccountsPage'
import AdminAuthGate from '../pages/Admin/AdminAuthGate'
import AdminSignInPage from '../pages/Admin/AdminSignInPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/countries" replace />} />
      <Route path="/admin/sign-in" element={<AdminSignInPage />} />
      <Route
        path="/admin/countries"
        element={
          <AdminAuthGate>
            {(user) => <CountryAdminPage user={user} />}
          </AdminAuthGate>
        }
      />
      <Route
        path="/admin/services"
        element={
          <AdminAuthGate>
            {(user) => <ServicesAdminPage user={user} />}
          </AdminAuthGate>
        }
      />
      <Route
        path="/admin/updates"
        element={
          <AdminAuthGate>
            {(user) => <UpdatesAdminPage user={user} />}
          </AdminAuthGate>
        }
      />
      <Route
        path="/admin/contact"
        element={
          <AdminAuthGate>
            {(user) => <ContactInquiriesAdminPage user={user} />}
          </AdminAuthGate>
        }
      />
      <Route
        path="/admin/accounts"
        element={
          <AdminAuthGate>
            {(user) => <AdminAccountsPage user={user} />}
          </AdminAuthGate>
        }
      />
      <Route path="/admin/*" element={<Navigate to="/admin/sign-in" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/residence" element={<ResidencePage />} />
        <Route path="/citizenship" element={<CitizenshipPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailedPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/updates/:updateId" element={<UpdateDetailedPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
