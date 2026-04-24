import { Activity, ChevronDown, BookOpenCheck, Users } from "lucide-react";

interface ResumoPeriodoProps {
  estudantesAtivos: any[];
  estudosComLicoes: any[];
  progressoTotal: any[];
  visitasTotais: any[];
  startDate: string;
  endDate: string;
}

export function ResumoPeriodo({
  estudantesAtivos, // Mantido na interface para não quebrar o componente pai, mas sem uso interno
  estudosComLicoes, // Mantido na interface para não quebrar o componente pai, mas sem uso interno
  progressoTotal,
  visitasTotais,
  startDate,
  endDate
}: ResumoPeriodoProps) {
  
  // 1. TOTAIS DE LANÇAMENTOS DO PERÍODO (Realizados e Visitas)
  const realizadosNoFiltro = progressoTotal.filter(
    p => p.data_registro >= startDate && p.data_registro <= endDate
  ).length;

  const visitasNoFiltro = visitasTotais.filter(
    v => v.data_visita >= startDate && v.data_visita <= endDate
  ).length;

  return (
    <details className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/10 [&_summary::-webkit-details-marker]:hidden">
      <summary className="bg-primary/10 border-b border-border/50 py-3 px-5 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none flex items-center gap-2">
              Painel de <span className="text-primary">Indicadores</span>
            </h2>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform duration-500" />
      </summary>

      {/* Ajustado para 2 colunas em telas maiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:p-6 bg-muted/5">
        
        {/* 1. ESTUDOS REALIZADOS (Azul) */}
        <div className="flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:border-blue-400/50 transition-colors">
          <div className="bg-blue-400/10 border-b border-blue-400/20 p-2.5 flex items-center justify-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-400">Estudos Realizados</h3>
          </div>
          <div className="flex items-center justify-center flex-1 p-5">
            <span className="text-4xl font-black text-foreground">{realizadosNoFiltro}</span>
          </div>
        </div>

        {/* 2. VISITAS REALIZADAS (Dourado/Primary) */}
        <div className="flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
          <div className="bg-primary/10 border-b border-primary/20 p-2.5 flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-primary">Visitas Realizadas</h3>
          </div>
          <div className="flex items-center justify-center flex-1 p-5">
            <span className="text-4xl font-black text-foreground">{visitasNoFiltro}</span>
          </div>
        </div>

      </div>
    </details>
  );
}