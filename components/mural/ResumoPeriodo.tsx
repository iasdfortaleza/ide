import { Activity, ChevronDown, BookOpenCheck, CheckCircle2, Users } from "lucide-react";

interface ResumoPeriodoProps {
  estudantesAtivos: any[];
  estudosComLicoes: any[];
  progressoTotal: any[];
  visitasTotais: any[];
  startDate: string;
  endDate: string;
}

export function ResumoPeriodo({
  estudantesAtivos,
  estudosComLicoes,
  progressoTotal,
  visitasTotais,
  startDate,
  endDate
}: ResumoPeriodoProps) {
  
  // 1. CÁLCULO DO PERÍODO SELECIONADO NO CALENDÁRIO
  const dtStart = new Date(startDate);
  const dtEnd = new Date(endDate);
  
  const startFormatado = dtStart.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const endFormatado = dtEnd.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  // 2. VARIÁVEIS DE CONTAGEM
  let concluidosAcumulado = 0; // Alunos que já concluíram o estudo (Histórico Total)
  let concluidosNoFiltro = 0;  // Alunos que concluíram dentro do período do calendário

  // 3. LÓGICA DE ESTUDOS CONCLUÍDOS (Por Aluno)
  for (const aluno of estudantesAtivos) {
    const progressoAluno = progressoTotal.filter(p => p.estudante_id === aluno.id);
    progressoAluno.sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());

    // --- CONCLUÍDOS ---
    const livro = estudosComLicoes.find(e => e.id === aluno.estudo_biblico_id);
    if (livro && livro.licoes?.length > 0) {
      const totalLicoes = livro.licoes.length;
      
      // Verifica se o aluno já concluiu em ALGUM momento (Histórico)
      const jaConcluiu = progressoAluno.some(p => {
        const licObj = Array.isArray(p.licao) ? p.licao[0] : p.licao;
        return (licObj?.numero_licao >= totalLicoes);
      });

      if (jaConcluiu) {
        concluidosAcumulado++;
      }

      // Verifica se a conclusão ocorreu especificamente DENTRO do período
      const concluiuNoFiltro = progressoAluno.some(p => {
        const licObj = Array.isArray(p.licao) ? p.licao[0] : p.licao;
        return (licObj?.numero_licao >= totalLicoes) && (p.data_registro >= startDate && p.data_registro <= endDate);
      });

      if (concluiuNoFiltro) {
        concluidosNoFiltro++;
      }
    }
  }

  // 4. TOTAIS DE LANÇAMENTOS (Realizados e Visitas)
  const realizadosAcumulado = progressoTotal.length;
  const realizadosNoFiltro = progressoTotal.filter(p => p.data_registro >= startDate && p.data_registro <= endDate).length;

  const visitasAcumulado = visitasTotais.length;
  const visitasNoFiltro = visitasTotais.filter(v => v.data_visita >= startDate && v.data_visita <= endDate).length;

  return (
    <details className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/10 [&_summary::-webkit-details-marker]:hidden">
      <summary className="bg-primary/10 border-b border-border/50 py-3 px-5 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none flex items-center gap-2">
              Painel de <span className="text-primary">Indicadores</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">
              Período: {startFormatado} a {endFormatado}
            </span>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform duration-500" />
      </summary>

      {/* Ajustado para 3 colunas em telas maiores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 md:p-6 bg-muted/5">
        
        {/* 1. REALIZADOS (Azul) */}
        <div className="flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:border-blue-400/50 transition-colors">
          <div className="bg-blue-400/10 border-b border-blue-400/20 p-2.5 flex items-center justify-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-400">Realizados</h3>
          </div>
          <div className="flex divide-x divide-border/30 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Histórico</span>
              <span className="text-3xl font-black text-blue-400">{realizadosAcumulado}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Neste Período</span>
              <span className="text-3xl font-black text-foreground">{realizadosNoFiltro}</span>
            </div>
          </div>
        </div>

        {/* 2. CONCLUÍDOS (Verde) */}
        <div className="flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:border-green-400/50 transition-colors">
          <div className="bg-green-400/10 border-b border-green-400/20 p-2.5 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-green-400">Concluídos</h3>
          </div>
          <div className="flex divide-x divide-border/30 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Histórico</span>
              <span className="text-3xl font-black text-green-400">{concluidosAcumulado}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Neste Período</span>
              <span className="text-3xl font-black text-foreground">{concluidosNoFiltro}</span>
            </div>
          </div>
        </div>

        {/* 3. VISITAS (Dourado/Primary) */}
        <div className="flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
          <div className="bg-primary/10 border-b border-primary/20 p-2.5 flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-primary">Visitas</h3>
          </div>
          <div className="flex divide-x divide-border/30 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Histórico</span>
              <span className="text-3xl font-black text-primary">{visitasAcumulado}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Neste Período</span>
              <span className="text-3xl font-black text-foreground">{visitasNoFiltro}</span>
            </div>
          </div>
        </div>

      </div>
    </details>
  );
}