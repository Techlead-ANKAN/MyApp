import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

const Checkbox = forwardRef(({ 
  label,
  className,
  ...props 
}, ref) => {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 bg-white dark:bg-slate-800"
        {...props}
      />
      {label && (
        <span className="text-slate-700 dark:text-slate-300 text-sm">{label}</span>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
