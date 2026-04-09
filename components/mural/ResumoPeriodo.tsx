import { Activity, ChevronDown, AlertCircle, BookOpenCheck, CheckCircle2, Users } from "lucide-react";

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

  // Referência para "Parados": 30 dias atrás a partir de HOJE (Independente do calendário)
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  const data30DiasLimite = trintaDiasAtras.toISOString().split('T')[0];

  // 2. VARIÁVEIS DE CONTAGEM
  let parados30DiasHoje = 0; // Alunos que não estudam há mais de 30 dias em relação a hoje
  let paradosNoFiltro = 0;   // Alunos que não tiveram atividade no período do calendário
  let concluidosAcumulado = 0; // Alunos que já concluíram o estudo (Histórico Total)
  let concluidosNoFiltro = 0;  // Alunos que concluíram dentro do período do calendário

  // 3. LÓGICA DE ESTUDOS PARADOS E CONCLUÍDOS (Por Aluno)
  for (const aluno of estudantesAtivos) {
    const progressoAluno = progressoTotal.filter(p => p.estudante_id === aluno.id);
    progressoAluno.sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());

    // --- PARADOS (Situação Real Atual) ---
    const ultimoEstudoGeral = progressoAluno[0];
    if (!ultimoEstudoGeral || ultimoEstudoGeral.data_registro < data30DiasLimite) {
      parados30DiasHoje++;
    }

    // --- PARADOS (Dentro do Período Selecionado) ---
    const teveEstudoNoCalendario = progressoAluno.some(p => p.data_registro >= startDate && p.data_registro <= endDate);
    if (!teveEstudoNoCalendario) {
      paradosNoFiltro++;
    }

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
    <details className="group bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg [&_summary::-webkit-details-marker]:hidden">
      <summary className="bg-muted/30 border-b border-border/50 py-2 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none flex items-center gap-2">
              Painel de <span className="text-primary">Indicadores</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 sm:mt-1">
              Período: {startFormatado} a {endFormatado}
            </span>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-500" />
      </summary>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 bg-background/20">
        
        {/* 1. PARADOS */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-destructive/10 border-b border-destructive/20 p-2.5 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-destructive">Estudos Parados</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-destructive/70 tracking-wider text-center">Histórico</span>
              <span className="text-3xl font-black text-destructive/90">{parados30DiasHoje}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Neste Período</span>
              <span className="text-3xl font-black text-foreground/80">{paradosNoFiltro}</span>
            </div>
          </div>
        </div>

        {/* 2. REALIZADOS */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-blue-500/10 border-b border-blue-500/20 p-2.5 flex items-center justify-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500">Realizados</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Histórico</span>
              <span className="text-3xl font-black text-blue-500/90">{realizadosAcumulado}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Neste Período</span>
              <span className="text-3xl font-black text-foreground/80">{realizadosNoFiltro}</span>
            </div>
          </div>
        </div>

        {/* 3. CONCLUÍDOS */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-green-500/10 border-b border-green-500/20 p-2.5 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-green-500">Concluídos</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Histórico</span>
              <span className="text-3xl font-black text-green-500/90">{concluidosAcumulado}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Neste Período</span>
              <span className="text-3xl font-black text-foreground/80">{concluidosNoFiltro}</span>
            </div>
          </div>
        </div>

        {/* 4. VISITAS */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-primary/10 border-b border-primary/20 p-2.5 flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-primary">Visitas</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Histórico</span>
              <span className="text-3xl font-black text-primary/90">{visitasAcumulado}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Neste Período</span>
              <span className="text-3xl font-black text-foreground/80">{visitasNoFiltro}</span>
            </div>
          </div>
        </div>

      </div>
    </details>
  );
}