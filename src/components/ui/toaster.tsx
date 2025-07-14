import React from 'react'
import { Toast, ToastTitle, ToastDescription } from './toast'
import { useToastContext } from '../../contexts/ToastContext'

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastContext()

  return (
    <div className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
        >
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>
        </Toast>
      ))}
    </div>
  )
}