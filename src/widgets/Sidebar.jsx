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
  // { name: 'Learning', path: ROUTES.LEARNING, icon: GraduationCap },
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
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-transform duration-200 shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">MyApp</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
          {/* Profile link */}
          <Link
            to={ROUTES.PROFILE}
            onClick={() => onClose()}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <User className="w-5 h-5" />
            <span>{user ? (user.user_metadata?.full_name || 'Profile') : 'Profile'}</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-900 dark:text-slate-100 text-sm font-medium">{user ? (user.user_metadata?.full_name || 'Ankan') : 'Ankan'}</span>
              </div>
              <button 
                onClick={handleSignOut} 
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center">MyApp v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
