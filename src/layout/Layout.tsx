import Header from '../components/header/Header'
import { Outlet, useLocation, useMatch } from 'react-router-dom'
// import Footer from '../components/footer/Footer'

export default function Layout() {
  const location = useLocation()
  const notLayout = location.pathname === "/dashboard"
  const match = useMatch('/chat/:id')

  return (
    <>
      {(notLayout || match) ? "" : <Header />}
      <Outlet />
      {/* {(notLayout || match) ? "" : <Footer />} */}
    </>
  )
}
