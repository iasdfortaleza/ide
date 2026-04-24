"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, ChevronDown, X, User } from "lucide-react";

interface TabelaVisitasProps {
  visitasLancadas: any[];
  duplas: any[];
}

export function TabelaVisitas({ visitasLancadas, duplas }: TabelaVisitasProps) {
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);
  
  const totalVisitas = visitasLancadas?.length || 0;

  return (
    <>
      {/* MODAL DA FOTO EXPANDIDA */}
      {fotoExpandida && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setFotoExpandida(null)}
        >
          <div className="relative w-full max-w-2xl max-h-[80vh] aspect-square rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(var(--color-primary),0.3)] border border-primary/40 bg-card">
            <Image 
              src={fotoExpandida} 
              alt="Foto da Dupla" 
              fill 
              className="object-cover" 
            />
            <button 
              className="absolute top-4 right-4 bg-background/50 text-foreground p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors backdrop-blur-md border border-border"
              onClick={(e) => { e.stopPropagation(); setFotoExpandida(null); }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ACORDEÃO E TABELA DE VISITAS */}
      <details className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/10 [&_summary::-webkit-details-marker]:hidden">
        <summary className="bg-primary/10 border-b border-border/50 py-3 px-5 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none">
              Relatório de <span className="text-primary">Visitas</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                {totalVisitas} {totalVisitas === 1 ? 'Visita' : 'Visitas'}
             </span>
            <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform duration-500" />
          </div>
        </summary>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground uppercase text-[9px] md:text-[10px] tracking-widest font-bold border-b border-border/50">
                <th className="p-3 text-left w-1/3">Dupla Missionária</th>
                <th className="p-3 text-left w-1/4">Data</th>
                <th className="p-3 text-left">Família / Visitado</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              {totalVisitas === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground italic">
                    Nenhuma visita lançada neste período.
                  </td>
                </tr>
              ) : (
                visitasLancadas.map((visita, index) => {
                  const dupla = duplas?.find(d => d.id === visita.dupla_id);
                  
                  // Mesma lógica de zebra da Tabela de Estudos para o fundo azul
                  const isEven = index % 2 === 0;
                  const rowBgClass = isEven ? "bg-card" : "bg-muted/10";
                  const borderClass = "border-b border-border/30";
                  
                  return (
                    <tr key={visita.id} className={`${rowBgClass} ${borderClass} hover:bg-primary/5 transition-colors`}>
                      
                      {/* COLUNA: DUPLA COM FOTO E NOME */}
                      <td className="px-3 py-2.5 align-middle border-l-4 border-l-primary">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-primary/30 overflow-hidden bg-muted ${dupla?.url_foto_dupla ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
                            onClick={() => dupla?.url_foto_dupla && setFotoExpandida(dupla.url_foto_dupla)}
                            title={dupla?.url_foto_dupla ? "Clique para ampliar a foto" : "Dupla sem foto"}
                          >
                            {dupla?.url_foto_dupla ? (
                              <Image 
                                src={dupla.url_foto_dupla} 
                                alt={dupla.nome_dupla || "Foto"} 
                                width={36} height={36} 
                                className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" 
                              />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[11px] md:text-xs text-foreground leading-tight truncate max-w-[150px] md:max-w-[200px]">
                              {dupla?.nome_dupla || "Desconhecida"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* COLUNA: DATA */}
                      <td className="px-3 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                        {new Date(visita.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </td>

                      {/* COLUNA: VISITADO */}
                      <td className="px-3 py-2.5 font-semibold text-primary truncate max-w-[200px]">
                        {visita.nome_visitado}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}