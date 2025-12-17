import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

const Select = forwardRef(({ 
  label,
  error,
  options = [],
  className,
  placeholder,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 border rounded-lg text-sm',
          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'border-slate-300 dark:border-slate-700',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'transition-colors duration-200',
          error && 'border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-slate-800">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-rose-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
