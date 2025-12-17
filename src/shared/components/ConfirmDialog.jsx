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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full animate-scale-up shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4 mb-6">
          <div className={cn(
            'p-3 rounded-xl',
            variant === 'danger' ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
          )}>
            <AlertTriangle className={cn(
              'w-6 h-6',
              variant === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
            )} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
