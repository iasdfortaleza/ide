"use client";

import { useState } from "react";
import Image from "next/image";
import { UserMinus, ChevronDown, X, User, AlertCircle } from "lucide-react";

interface TabelaEstudosInativosProps {
  duplas: any[];
  estudosComLicoes: any[];
  progressoTotal: any[];
  visitasLancadas: any[];
  startDate: string;
  endDate: string;
}

export function TabelaEstudosInativos({
  duplas,
  estudosComLicoes,
  progressoTotal,
  visitasLancadas,
  startDate,
  endDate,
}: TabelaEstudosInativosProps) {
  
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);

  // 1. LÓGICA DE FILTRAGEM (Pega as duplas que NÃO tiveram estudo NEM visita no período)
  const duplasInativas = duplas.filter((dupla) => {
    const duplaFezEstudo = progressoTotal.some((p: any) => {
       const estudanteDestaDupla = dupla.estudantes?.some((e:any) => e.id === p.estudante_id);
       return (
         estudanteDestaDupla && 
         p.data_registro >= startDate && 
         p.data_registro <= endDate
       );
    });

    const duplaFezVisita = visitasLancadas.some(
      (v: any) => v.dupla_id === dupla.id
    );

    return !duplaFezEstudo && !duplaFezVisita;
  });

  const getPrimeiroNome = (nomeCompleto: string) => {
    if (!nomeCompleto) return "";
    return nomeCompleto.split(" ")[0];
  };

  // 2. BUSCA O ÚLTIMO ESTUDO DADO PELA DUPLA GERAL
  const getUltimoEstudoDupla = (dupla: any) => {
    if (!dupla.estudantes || dupla.estudantes.length === 0) return null;
    
    // Pega os IDs de todos os estudantes dessa dupla
    const estudanteIds = dupla.estudantes.map((e:any) => e.id);
    
    // Filtra o histórico geral para achar estudos dados a esses alunos
    const progressosDaDupla = progressoTotal.filter((p:any) => estudanteIds.includes(p.estudante_id));
    
    // Ignora estudos lançados no futuro em relação ao filtro
    const progressoValido = progressosDaDupla.filter((p:any) => p.data_registro <= endDate);
    
    // Ordena do mais recente para o mais antigo
    progressoValido.sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());
    
    return progressoValido[0] || null; // Retorna o mais recente
  };

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

      {/* ACORDEÃO E TABELA DE DUPLAS INATIVAS */}
      <details className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/10 [&_summary::-webkit-details-marker]:hidden">
        <summary className="bg-primary/10 border-b border-border/50 py-3 px-5 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors">
          <div className="flex items-center gap-3">
            <UserMinus className="w-5 h-5 text-primary" />
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none">
              Duplas sem <span className="text-primary">atividades recentes</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                {duplasInativas.length} {duplasInativas.length === 1 ? 'Dupla' : 'Duplas'}
             </span>
            <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform duration-500" />
          </div>
        </summary>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground uppercase text-[9px] md:text-[10px] tracking-widest font-bold">
                <th className="p-3 text-left w-1/2">Dupla Missionária</th>
                <th className="p-3 text-center w-1/4">Qtd. de Estudantes</th>
                <th className="p-3 text-center w-1/4 border-l border-border/50 bg-primary/5">Última Atividade (Estudo)</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {duplasInativas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground italic">
                    Excelente! Todas as duplas registraram pelo menos uma atividade (Estudo ou Visita) neste período.
                  </td>
                </tr>
              ) : (
                duplasInativas.map((dupla, dIndex) => {
                  const isEven = dIndex % 2 === 0;
                  const rowBgClass = isEven ? "bg-card" : "bg-muted/5";
                  const borderClass = "border-b border-border/20"; 
                  
                  const integrantesStr = dupla.membros_dupla 
                    ? dupla.membros_dupla.map((m: any) => getPrimeiroNome(m.nome)).join(" e ")
                    : "";

                  const totalEstudantesAtivos = dupla.estudantes?.filter((e:any) => e.status === 'ativo').length || 0;

                  // Calcula a última atividade dessa dupla
                  const ultimoEstudo = getUltimoEstudoDupla(dupla);
                  let diasParados = -1;
                  let numeroLicao = '-';
                  let dataUltima = null;

                  if (ultimoEstudo) {
                    const licObj = Array.isArray(ultimoEstudo.licao) ? ultimoEstudo.licao[0] : ultimoEstudo.licao;
                    numeroLicao = licObj?.numero_licao || '-';
                    dataUltima = new Date(ultimoEstudo.data_registro).toLocaleDateString("pt-BR", { timeZone: "UTC" });

                    const dUltima = new Date(ultimoEstudo.data_registro);
                    const dFim = new Date(endDate);
                    const diffTime = Math.abs(dFim.getTime() - dUltima.getTime());
                    diasParados = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  }

                  return (
                    <tr key={dupla.id} className={`${rowBgClass} ${borderClass} hover:bg-primary/5 transition-colors`}>
                      
                      {/* COLUNA: DUPLA COM FOTO E MEMBROS */}
                      <td className="px-3 py-3 align-middle border-l-4 border-l-muted-foreground/30">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden bg-muted/50 ${dupla.url_foto_dupla ? 'cursor-pointer hover:border-primary transition-colors opacity-80 hover:opacity-100' : ''}`}
                            onClick={() => dupla.url_foto_dupla && setFotoExpandida(dupla.url_foto_dupla)}
                            title={dupla.url_foto_dupla ? "Clique para ampliar a foto" : "Dupla sem foto"}
                          >
                            {dupla.url_foto_dupla ? (
                              <Image 
                                src={dupla.url_foto_dupla} 
                                alt={dupla.nome_dupla} 
                                width={40} height={40} 
                                className="object-cover w-full h-full hover:scale-110 transition-transform duration-500 grayscale hover:grayscale-0" 
                              />
                            ) : (
                              <User className="w-5 h-5 text-muted-foreground/40" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs md:text-sm text-foreground/80 leading-tight">
                              {dupla.nome_dupla}
                            </span>
                            {integrantesStr && (
                              <span className="text-[10px] text-muted-foreground italic mt-0.5 leading-tight">
                                {integrantesStr}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* COLUNA: QTD DE ESTUDANTES */}
                      <td className="px-3 py-3 text-center align-middle">
                        <span className="font-semibold text-foreground/70">
                          {totalEstudantesAtivos} {totalEstudantesAtivos === 1 ? 'aluno' : 'alunos'}
                        </span>
                      </td>

                      {/* COLUNA: ÚLTIMA ATIVIDADE */}
                      <td className="px-3 py-3 text-center border-l border-border/50 bg-primary/5 align-middle">
                         <div className="flex flex-col items-center justify-center leading-none">
                          {dataUltima ? (
                            <>
                              <span className="font-black text-xs md:text-sm text-foreground/90">L{numeroLicao}</span>
                              <span className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                                {dataUltima}
                              </span>
                              <div className="flex items-center gap-1 mt-1.5 bg-primary/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-primary border border-primary/20">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  <span>Parado há {diasParados} dias</span>
                              </div>
                            </>
                          ) : (
                             <span className="text-[10px] text-muted-foreground font-medium italic">Nenhum estudo registrado</span>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* LEGENDA */}
          <div className="bg-muted/10 p-2 border-t border-border/50 flex flex-wrap items-center justify-center gap-5 text-[9px] uppercase font-black tracking-widest text-muted-foreground opacity-60">
             Lista de duplas que não lançaram nem Estudos nem Visitas no período selecionado
          </div>
        </div>
      </details>
    </>
  );
}