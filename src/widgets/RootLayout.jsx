import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { ROUTES } from '@/shared/constants/routes'

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Hide layout on auth pages
  const isAuthPage = [ROUTES.LOGIN, ROUTES.SIGNUP].includes(location.pathname)

  if (isAuthPage) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        {/* Top toggle (overlay, minimal spacing) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white"
          aria-label="Open sidebar"
        >
          ☰
        </button>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  )
}
