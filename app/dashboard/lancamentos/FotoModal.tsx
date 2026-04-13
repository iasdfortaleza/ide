'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Image as ImageIcon, X } from 'lucide-react';

interface FotoModalProps {
  url_foto_dupla: string | null;
  nome_dupla: string;
}

export default function FotoModal({ url_foto_dupla, nome_dupla }: FotoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garante que o Portal só será acionado no cliente para evitar erros de hidratação no Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // Evita que o modal feche se o usuário clicar em cima da própria imagem ampliada
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Impede o clique de propagar para o <summary> (evita que o acordeão abra/feche ao clicar na foto)
  const handleThumbnailClick = (e: React.MouseEvent) => {
    if (url_foto_dupla) {
      e.preventDefault(); 
      e.stopPropagation();
      setIsOpen(true);
    }
  };

  // O conteúdo do modal que será ejetado para a raiz do documento
  const modalContent = isOpen && url_foto_dupla ? (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)} // Fecha ao clicar no fundo
    >
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] p-3 bg-secondary/10 hover:bg-destructive hover:text-destructive-foreground text-foreground backdrop-blur-md rounded-full border border-border transition-all shadow-lg hover:scale-110"
        title="Fechar visualização"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      <div 
        className="relative w-[95vw] h-[85vh] max-w-6xl animate-in zoom-in-95 duration-300"
        onClick={handleContainerClick} 
      >
        <Image 
          src={url_foto_dupla} 
          alt={`Foto ampliada de ${nome_dupla}`} 
          fill 
          sizes="100vw"
          className="object-contain drop-shadow-2xl" 
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* 1. Miniatura Clicável */}
      <div 
        onClick={handleThumbnailClick}
        className={`w-12 h-12 md:w-14 md:h-14 min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px] rounded-full bg-secondary relative flex items-center justify-center overflow-hidden border-2 border-primary/40 shrink-0 shadow-sm ${url_foto_dupla ? 'cursor-pointer hover:border-primary transition-colors hover:shadow-primary/50' : ''}`}
        title={url_foto_dupla ? "Clique para ampliar" : "Sem foto"}
      >
        {url_foto_dupla ? (
          <Image 
            src={url_foto_dupla} 
            alt={nome_dupla} 
            fill 
            sizes="(max-width: 768px) 48px, 56px"
            className="object-cover" 
          />
        ) : (
          <ImageIcon className="w-6 h-6 text-secondary-foreground/30" />
        )}
      </div>

      {/* 2. Modal Independente Renderizado via Portal */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}