import { Search } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export default function SearchBar({ 
  value,
  onChange,
  placeholder = 'Search...',
  className,
  ...props 
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 focus:bg-white/10 transition-all duration-300 hover:bg-white/[0.07]"
        {...props}
      />
    </div>
  )
}
