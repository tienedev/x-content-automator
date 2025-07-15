import React from 'react';
import { Toast, ToastTitle, ToastDescription } from './toast';

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToasterProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

export const Toaster: React.FC<ToasterProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className='fixed top-0 right-0 z-50 w-full max-w-sm p-4 space-y-4'>
      {toasts.map(toast => (
        <Toast key={toast.id} variant={toast.variant} onClose={() => onRemoveToast(toast.id)}>
          <div className='grid gap-1'>
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
    </div>
  );
};
