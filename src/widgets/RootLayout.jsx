import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { ROUTES } from '@/shared/constants/routes'
import { Menu } from 'lucide-react'

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Hide layout on auth pages
  const isAuthPage = [ROUTES.LOGIN, ROUTES.SIGNUP].includes(location.pathname)

  if (isAuthPage) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-surface-muted dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        {/* Top toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 transition-colors duration-200"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Content with proper container */}
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  )
}
