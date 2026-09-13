import { Outlet } from 'react-router-dom'
import Header from './Header'
import MobileNav from './MobileNav'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
