import { create } from 'zustand'

let toastId = 0

export const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = ++toastId
    const newToast = { id, ...toast }
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))
    
    // Auto-remove after duration
    setTimeout(() => {
      get().removeToast(id)
    }, toast.duration || 4000)
    
    return id
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
  
  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// Hook to use toast
export const useToast = () => {
  const { addToast, removeToast } = useToastStore()
  
  return {
    success: (message, options = {}) => 
      addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => 
      addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => 
      addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => 
      addToast({ type: 'info', message, ...options }),
    remove: removeToast,
  }
}
