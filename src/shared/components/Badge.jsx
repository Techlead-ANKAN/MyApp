import { cn } from '@/shared/utils/cn'

export default function Badge({ 
  children, 
  variant = 'default',
  className,
  ...props 
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    hard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
