"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, ChevronDown, X, User } from "lucide-react";

interface TabelaEstudosProps {
  duplas: any[];
  estudosComLicoes: any[];
  progressoTotal: any[];
  startDate: string;
  endDate: string;
}

export function TabelaEstudos({
  duplas,
  estudosComLicoes,
  progressoTotal,
  startDate,
  endDate,
}: TabelaEstudosProps) {
  
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);

  // 1. LÓGICA DE FILTRAGEM
  const duplasFiltradas = duplas
    .map((dupla) => {
      const alunosAtivosNoPeriodo = (dupla.estudantes || []).filter((aluno: any) => {
        if (aluno.status !== "ativo") return false;

        const temAtividadeNoPeriodo = progressoTotal.some(
          (p: any) =>
            p.estudante_id === aluno.id &&
            p.data_registro >= startDate &&
            p.data_registro <= endDate
        );

        return temAtividadeNoPeriodo;
      });

      return {
        ...dupla,
        estudantes: alunosAtivosNoPeriodo,
      };
    })
    .filter((dupla) => dupla.estudantes.length > 0);

  // 2. FUNÇÃO DE STATUS DO ALUNO
  const getStatusAluno = (estudanteId: string, livroId: string) => {
    const progressoAluno = progressoTotal.filter((p) => p.estudante_id === estudanteId);
    
    progressoAluno.sort((a, b) => {
      return new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime();
    });

    const progressoValido = progressoAluno.filter((p) => p.data_registro <= endDate);
    
    // Pegamos os objetos inteiros para poder extrair a data
    const licaoAtualObj = progressoValido[0] || null;
    const licaoAnteriorObj = progressoValido[1] || null;

    let maiorLicaoNumero = 0;
    progressoValido.forEach((p) => {
      const licObj = Array.isArray(p.licao) ? p.licao[0] : p.licao;
      if (licObj && licObj.numero_licao > maiorLicaoNumero) {
        maiorLicaoNumero = licObj.numero_licao;
      }
    });

    const livro = estudosComLicoes?.find((e) => e.id === livroId);
    const totalLicoes = livro?.licoes ? livro.licoes.length : 20;
    const porcentagem = totalLicoes > 0 ? (maiorLicaoNumero / totalLicoes) * 100 : 0;

    let color = "bg-zinc-500/30"; 
    let activeColor = "bg-yellow-500"; 
    
    if (porcentagem > 0 && porcentagem <= 33) activeColor = "bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]";
    else if (porcentagem > 33 && porcentagem <= 66) activeColor = "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]";
    else if (porcentagem > 66 && porcentagem < 100) activeColor = "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]";
    else if (porcentagem >= 100) activeColor = "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]";

    return { maiorLicaoNumero, totalLicoes, color, activeColor, licaoAtualObj, licaoAnteriorObj };
  };

  const formatarData = (data: string | null) => {
    if (!data) return null;
    return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const getPrimeiroNome = (nomeCompleto: string) => {
    if (!nomeCompleto) return "";
    return nomeCompleto.split(" ")[0];
  };

  return (
    <>
      {/* MODAL DA FOTO EXPANDIDA */}
      {fotoExpandida && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setFotoExpandida(null)}
        >
          <div className="relative w-full max-w-2xl max-h-[80vh] aspect-square rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)] border border-primary/20">
            <Image 
              src={fotoExpandida} 
              alt="Foto da Dupla" 
              fill 
              className="object-cover" 
            />
            <button 
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); setFotoExpandida(null); }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ACORDEÃO E TABELA DE ESTUDOS */}
      <details open className="group bg-card/40 backdrop-blur-sm border border-primary/20 rounded-xl overflow-hidden shadow-2xl shadow-primary/5 [&_summary::-webkit-details-marker]:hidden">
        <summary className="bg-primary/10 border-b border-primary/20 py-2 px-4 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none">
              Acompanhamento de <span className="text-primary">Estudos</span>
            </h2>
          </div>
          <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform duration-500" />
        </summary>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-muted/50 text-foreground/70 uppercase text-[9px] md:text-[10px] tracking-widest font-bold">
                <th className="p-2 text-left w-1/4">Dupla Missionária</th>
                <th className="p-2 text-left w-1/5">Aluno / Família</th>
                <th className="p-2 text-center">Progresso Geral</th>
                <th className="p-2 text-center w-24 border-r border-border/50">Lição Anterior</th>
                <th className="p-2 text-center w-24 bg-primary/5">Lição Atual</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {duplasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground italic">
                    Nenhum estudo bíblico lançado neste período.
                  </td>
                </tr>
              ) : (
                duplasFiltradas.map((dupla, dIndex) => {
                  const isEven = dIndex % 2 === 0;
                  const rowBgClass = isEven ? "bg-background/40" : "bg-muted/5";
                  const borderClass = "border-b border-border/20"; 
                  
                  const integrantesStr = dupla.membros_dupla 
                    ? dupla.membros_dupla.map((m: any) => getPrimeiroNome(m.nome)).join(" e ")
                    : "";

                  return dupla.estudantes.map((aluno: any, index: number) => {
                    const { maiorLicaoNumero, totalLicoes, color, activeColor, licaoAtualObj, licaoAnteriorObj } = getStatusAluno(aluno.id, aluno.estudo_biblico_id);
                    const blocos = Array.from({ length: totalLicoes }, (_, i) => i < maiorLicaoNumero);

                    // Pega a data formatada para a Lição Atual
                    const dataLiAtual = licaoAtualObj ? formatarData(licaoAtualObj.data_registro) : null;
                    
                    // Pega número e data para a Lição Anterior
                    const numeroLiAnterior = licaoAnteriorObj ? (Array.isArray(licaoAnteriorObj.licao) ? licaoAnteriorObj.licao[0].numero_licao : licaoAnteriorObj.licao.numero_licao) : '-';
                    const dataLiAnterior = licaoAnteriorObj ? formatarData(licaoAnteriorObj.data_registro) : null;

                    return (
                      <tr key={aluno.id} className={`${rowBgClass} ${borderClass} hover:bg-primary/5 transition-colors`}>
                        
                        {/* COLUNA: DUPLA COM FOTO E MEMBROS */}
                        {index === 0 ? (
                          <td rowSpan={dupla.estudantes.length} className="px-2 py-1 align-middle border-l-4 border-l-primary">
                            <div className="flex items-center gap-2.5">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden bg-background ${dupla.url_foto_dupla ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
                                onClick={() => dupla.url_foto_dupla && setFotoExpandida(dupla.url_foto_dupla)}
                                title={dupla.url_foto_dupla ? "Clique para ampliar a foto" : "Dupla sem foto"}
                              >
                                {dupla.url_foto_dupla ? (
                                  <Image 
                                    src={dupla.url_foto_dupla} 
                                    alt={dupla.nome_dupla} 
                                    width={32} height={32} 
                                    className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" 
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-muted-foreground/40" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] md:text-xs text-foreground/90 leading-tight">
                                  {dupla.nome_dupla}
                                </span>
                                {integrantesStr && (
                                  <span className="text-[8px] md:text-[9px] text-muted-foreground italic mt-[1px] leading-tight">
                                    {integrantesStr}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        ) : null}

                        <td className="px-2 py-1 font-semibold text-[11px] md:text-xs text-foreground/80 truncate max-w-[150px]">{aluno.nome_pessoa}</td>
                        <td className="px-2 py-1 align-middle">
                          <div className="flex flex-wrap gap-[2px] items-center justify-center">
                            {blocos.map((preenchido, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-2 rounded-[1px] transition-all duration-500 ${preenchido ? activeColor : color}`}
                              />
                            ))}
                          </div>
                        </td>

                        {/* COLUNA: Lição Anterior */}
                        <td className="px-2 py-1 text-center border-r border-border/50 align-middle">
                           <div className="flex flex-col items-center justify-center leading-none">
                            <span className="font-bold text-xs text-foreground">{numeroLiAnterior}</span>
                            {dataLiAnterior && (
                              <span className="text-[8px] text-muted-foreground opacity-70 mt-0.5">
                                {dataLiAnterior}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* COLUNA: Lição Atual (Ex: 5/20 e Data) */}
                        <td className="px-2 py-1 text-center bg-primary/5 align-middle">
                           <div className="flex flex-col items-center justify-center leading-none">
                            <div className="flex items-baseline justify-center gap-0.5">
                              <span className="font-black text-sm text-foreground">{maiorLicaoNumero}</span>
                              <span className="text-[8px] text-muted-foreground font-bold">/{totalLicoes}</span>
                            </div>
                            {dataLiAtual && (
                              <span className="mt-0.5 text-[8px] text-muted-foreground font-semibold bg-background/50 px-1 py-0.5 rounded border border-border/40">
                                {dataLiAtual}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })
              )}
            </tbody>
          </table>

          <div className="bg-background/80 p-1 flex flex-wrap items-center justify-center gap-4 text-[8px] uppercase font-black tracking-widest text-muted-foreground/70 opacity-60">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-[1px] bg-yellow-500" /> Início</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-[1px] bg-orange-500" /> Meio</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-[1px] bg-blue-500" /> Quase lá</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-[1px] bg-green-500" /> Pronto</div>
          </div>
        </div>
      </details>
    </>
  );
}