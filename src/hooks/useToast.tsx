import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export interface ToastItem {
  id: number
  message: string
  variant: 'success' | 'info' | 'error'
}

interface ToastContextValue {
  toasts: ToastItem[]
  push: (message: string, variant?: ToastItem['variant']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  return <ToastContext.Provider value={{ toasts, push }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
