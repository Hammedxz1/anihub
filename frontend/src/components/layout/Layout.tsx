import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main key={location.pathname} className="page-transition flex-1">
        <Outlet />
      </main>
    </div>
  )
}
