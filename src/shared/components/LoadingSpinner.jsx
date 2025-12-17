import { cn } from '@/shared/utils/cn'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }
  
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-primary-600 border-t-transparent',
          sizes[size],
          className
        )}
      />
    </div>
  )
}
