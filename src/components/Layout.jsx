import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ContactCard from './ContactCard/ContactCard'
import Footer from './Footer/Footer'
import MenuBar from './MenuBar'

function Layout() {
  const { pathname } = useLocation()
  const contentRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const content = contentRef.current
    if (!content || !('IntersectionObserver' in window)) return undefined

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    const observeRevealElements = (root) => {
      if (root instanceof Element && root.matches('[data-reveal]')) {
        revealObserver.observe(root)
      }
      root.querySelectorAll?.('[data-reveal]').forEach((element) => {
        revealObserver.observe(element)
      })
    }

    observeRevealElements(content)

    const contentObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(observeRevealElements)
      })
    })
    contentObserver.observe(content, { childList: true, subtree: true })

    return () => {
      revealObserver.disconnect()
      contentObserver.disconnect()
    }
  }, [pathname])

  return (
    <div className="app-shell">
      <MenuBar />
      <div key={pathname} ref={contentRef} className="page-content animate-page-fade-in">
        <Outlet />
      </div>
      {pathname !== '/contact' && <ContactCard />}
      <Footer />
    </div>
  )
}

export default Layout
