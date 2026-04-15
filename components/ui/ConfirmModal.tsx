import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Adicionado para permitir botões vermelhos em ações perigosas
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Container do Modal: 
        Usa bg-card (seu azul #18457c) e border-border (branco translúcido) 
      */}
      <div className="w-full max-w-md rounded-lg bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="mb-2 text-xl font-semibold text-card-foreground">{title}</h2>
        
        {/* Texto de apoio usa sua cor text-muted-foreground (branco 70%) */}
        <p className="mb-6 text-muted-foreground">{message}</p>
        
        <div className="flex justify-end gap-3">
          {/* Botão Cancelar: 
            Usa bg-secondary (Branco) e text-secondary-foreground (Azul) 
          */}
          <button
            onClick={onCancel}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            {cancelText}
          </button>

          {/* Botão Confirmar: 
            Alterna entre Dourado (bg-primary) e Vermelho (bg-destructive) 
          */}
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isDestructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}