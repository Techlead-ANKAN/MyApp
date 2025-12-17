import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/utils/cn'
import { Home, Calendar, Dumbbell, GraduationCap } from 'lucide-react'

const navItems = [
  { name: 'Home', path: ROUTES.HOME, icon: Home },
  { name: 'Calendar', path: ROUTES.CALENDAR, icon: Calendar },
  { name: 'Gym', path: ROUTES.GYM, icon: Dumbbell },
  { name: 'Learning', path: ROUTES.LEARNING, icon: GraduationCap },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 shadow-lg">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
