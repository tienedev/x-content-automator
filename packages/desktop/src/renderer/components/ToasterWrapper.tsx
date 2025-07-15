import React from 'react';
import { Toaster } from '@x-community/ui';
import { useToastContext } from '@/contexts/ToastContext';

export const ToasterWrapper: React.FC = () => {
  const { toasts, removeToast } = useToastContext();

  return <Toaster toasts={toasts} onRemoveToast={removeToast} />;
};
