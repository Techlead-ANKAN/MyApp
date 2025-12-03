import { cn } from '@/shared/utils/cn'

export default function Card({ 
  children, 
  className,
  hover = false,
  glass = true,
  ...props 
}) {
  const baseStyles = 'rounded-2xl p-6 shadow-2xl'
  const glassStyles = glass ? 'bg-white/[0.02] backdrop-blur-2xl border border-white/10' : 'bg-dark-800 border border-dark-700'
  const hoverStyles = hover ? 'hover:shadow-2xl hover:shadow-accent-blue/20 hover:-translate-y-1 hover:border-white/20 transition-all duration-300' : ''
  
  return (
    <div
      className={cn(
        baseStyles,
        glassStyles,
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
