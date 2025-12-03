import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'
import { ROUTES } from '@/shared/constants/routes'
import Button from '@/shared/components/Button'
import { Menu, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export default function Header({ onMenuClick }) {
  const { user, signOut } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Failed to sign out')
    } else {
      toast.success('Signed out successfully')
    }
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path === ROUTES.HOME) return 'Dashboard'
    if (path === ROUTES.CALENDAR) return 'Calendar'
    if (path === ROUTES.GYM) return 'Gym Tracker'
    if (path === ROUTES.LEARNING) return 'Learning Path'
    if (path === ROUTES.PROFILE) return 'Profile'
    return 'MyApp'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dark-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left: Menu + Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="hidden md:block text-white text-sm">
              {user?.email?.split('@')[0]}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-xl border border-white/10 py-2 animate-scale-up">
              <Link
                to={ROUTES.PROFILE}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-white text-sm">Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleSignOut()
                  setShowUserMenu(false)
                }}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
                <span className="text-white text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
