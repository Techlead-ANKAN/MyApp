import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import { cn } from '@/shared/utils/cn'

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-dark-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 max-w-md w-full animate-scale-up shadow-2xl">
        <div className="flex items-start space-x-4 mb-6">
          <div className={cn(
            'p-3 rounded-2xl',
            variant === 'danger' ? 'bg-red-500/20 shadow-lg shadow-red-500/20' : 'bg-yellow-500/20 shadow-lg shadow-yellow-500/20'
          )}>
            <AlertTriangle className={cn(
              'w-7 h-7',
              variant === 'danger' ? 'text-red-400' : 'text-yellow-400'
            )} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant}
            className="flex-1 shadow-lg"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
