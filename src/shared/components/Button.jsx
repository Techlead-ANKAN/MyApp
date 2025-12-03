import { cn } from '@/shared/utils/cn'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  disabled,
  ...props 
}) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-accent-blue to-accent-purple hover:shadow-lg hover:shadow-accent-blue/30 text-white',
    secondary: 'bg-white/5 hover:bg-white/10 backdrop-blur-md text-gray-200 border border-white/10',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-500/30 text-white',
    ghost: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md',
    outline: 'bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-accent-blue/50',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
