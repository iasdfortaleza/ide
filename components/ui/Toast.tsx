import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({ id, message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  // Auto-fechamento do Toast
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Configuração visual baseada no tipo
  const styles = {
    success: {
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      border: 'border-l-4 border-l-emerald-400',
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-destructive" />,
      border: 'border-l-4 border-l-destructive',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-primary" />, // Dourado
      border: 'border-l-4 border-l-primary',
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-400" />,
      border: 'border-l-4 border-l-blue-400',
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 overflow-hidden rounded-md bg-card p-4 shadow-xl border border-border ${currentStyle.border} animate-in slide-in-from-right-5 fade-in duration-300`}
    >
      <div className="flex items-center gap-3">
        {currentStyle.icon}
        <p className="text-sm font-medium text-card-foreground">{message}</p>
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}