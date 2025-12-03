import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

const Textarea = forwardRef(({ 
  label,
  error,
  className,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 border border-white/10 rounded-xl',
          'bg-white/5 backdrop-blur-md text-white',
          'placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 focus:bg-white/10',
          'transition-all duration-300 min-h-[100px] resize-y',
          'hover:bg-white/[0.07]',
          error && 'border-red-500/50 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
