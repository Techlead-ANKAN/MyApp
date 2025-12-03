import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

const Checkbox = forwardRef(({ 
  label,
  className,
  ...props 
}, ref) => {
  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
        {...props}
      />
      {label && (
        <span className="text-gray-300 text-sm">{label}</span>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
