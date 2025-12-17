import { cn } from '@/shared/utils/cn'

export default function Card({ 
  children, 
  className,
  hover = false,
  ...props 
}) {
  const baseStyles = 'rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card'
  const hoverStyles = hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200' : ''
  
  return (
    <div
      className={cn(
        baseStyles,
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
