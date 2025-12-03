import { NavLink, Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/utils/cn'
import {
  Home,
  Calendar,
  Dumbbell,
  Wrench,
  GraduationCap,
  X,
  User,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'

const navItems = [
  { name: 'Dashboard', path: ROUTES.HOME, icon: Home },
  { name: 'Calendar', path: ROUTES.CALENDAR, icon: Calendar },
  { name: 'Gym', path: ROUTES.GYM, icon: Dumbbell },
  { name: 'Gym Admin', path: ROUTES.GYM_ADMIN, icon: Wrench },
  { name: 'Learning', path: ROUTES.LEARNING, icon: GraduationCap },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const handleSignOut = async () => {
    await signOut()
    onClose()
  }
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-dark-900/95 backdrop-blur-2xl border-r border-white/10 z-50 transition-transform duration-300 shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-white">MyApp</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
          {/* Profile link */}
          <Link
            to={ROUTES.PROFILE}
            onClick={() => onClose()}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">{user ? (user.user_metadata?.full_name || 'Profile') : 'Profile'}</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="glass rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">{user ? (user.user_metadata?.full_name || 'Ankan') : 'Ankan'}</span>
              </div>
              <button onClick={handleSignOut} className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10">
                <span className="inline-flex items-center space-x-1"><LogOut className="w-3 h-3" /><span>Sign Out</span></span>
              </button>
            </div>
            <p className="text-gray-400 text-xs text-center">MyApp v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
