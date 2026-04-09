import { Target, CheckCircle2, CircleDashed, ChevronDown, TrendingUp } from "lucide-react";

interface AlvoBatismoProps {
  metas: {
    ano: number;
    alvo_anual: number;
    alvo_alcancado: number;
  } | null;
}

export function AlvoBatismo({ metas }: AlvoBatismoProps) {
  const alvo = metas?.alvo_anual || 0;
  const alcancado = metas?.alvo_alcancado || 0;
  const faltam = Math.max(0, alvo - alcancado);
  
  // Cálculo da porcentagem para a barra de progresso
  const porcentagem = alvo > 0 ? Math.min(100, Math.round((alcancado / alvo) * 100)) : 0;

  return (
    <details open className="group bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg [&_summary::-webkit-details-marker]:hidden">
      <summary className="bg-muted/30 border-b border-border/50 py-3 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none">
            Alvo de <span className="text-primary">Batismo</span>
          </h2>
        </div>
        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-500" />
      </summary>

      <div className="p-4 md:p-6 bg-background/20 space-y-6">
        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card: ALVO */}
          <div className="relative overflow-hidden flex flex-col items-center justify-center bg-card/60 border border-border/50 p-6 rounded-2xl shadow-sm group/card">
            <Target className="w-6 h-6 text-muted-foreground mb-2 opacity-50 group-hover/card:scale-110 transition-transform" />
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Alvo Geral</p>
            <p className="font-black text-4xl mt-1 tracking-tighter text-foreground/90">{alvo}</p>
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover/card:opacity-[0.08] transition-opacity">
               <Target size={80} />
            </div>
          </div>
          
          {/* Card: BATISMOS */}
          <div className="relative overflow-hidden flex flex-col items-center justify-center bg-primary/5 border border-primary/20 p-6 rounded-2xl shadow-sm group/card">
            <CheckCircle2 className="w-6 h-6 text-primary mb-2 group-hover/card:scale-110 transition-transform" />
            <p className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">Batismos Realizados</p>
            <p className="font-black text-5xl mt-1 text-primary tracking-tighter">{alcancado}</p>
            <div className="absolute -bottom-2 -right-2 opacity-[0.05] group-hover/card:opacity-[0.1] transition-opacity text-primary">
               <TrendingUp size={80} />
            </div>
          </div>

          {/* Card: FALTAM */}
          <div className="relative overflow-hidden flex flex-col items-center justify-center bg-card/60 border border-border/50 p-6 rounded-2xl shadow-sm group/card">
            <CircleDashed className="w-6 h-6 text-muted-foreground mb-2 opacity-50 group-hover/card:rotate-90 transition-transform duration-700" />
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Restante</p>
            <p className="font-black text-4xl mt-1 text-foreground/80 tracking-tighter">{faltam}</p>
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover/card:opacity-[0.08] transition-opacity">
               <CircleDashed size={80} />
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESSO VISUAL INFERIOR */}
        <div className="bg-card/40 border border-border/40 p-4 rounded-2xl">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progresso da Meta</span>
                <span className="text-xl font-black text-primary">{porcentagem}%</span>
            </div>
            <div className="w-full h-4 bg-background rounded-full overflow-hidden border border-border/50 p-0.5">
                <div 
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    style={{ width: `${porcentagem}%` }}
                />
            </div>
        </div>
      </div>
    </details>
  );
}