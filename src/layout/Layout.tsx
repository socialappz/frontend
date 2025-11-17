import Header from '../components/header/Header'
import CookieConsent from '../components/common/CookieConsent'
import { Outlet, useLocation, useMatch } from 'react-router-dom'
import { useEffect } from 'react'

export default function Layout() {
  const location = useLocation()
  const notLayout = location.pathname === "/dashboard"
  const match = useMatch('/chat/:id')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <>
      {(notLayout || match) ? "" : <Header />}
      <Outlet />
      <CookieConsent />
    </>
  )
}
