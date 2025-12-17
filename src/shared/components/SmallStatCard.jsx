import { cn } from '@/shared/utils/cn'
import Card from './Card'

export default function SmallStatCard({ 
  label, 
  value, 
  subtext,
  icon: Icon, 
  accent = 'primary',
  className 
}) {
  const accentColors = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <Card 
      hover 
      className={cn('flex items-start gap-4', className)}
    >
      {/* Icon Badge */}
      {Icon && (
        <div className={cn(
          'p-3 rounded-xl',
          accentColors[accent]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </Card>
  )
}
