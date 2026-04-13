import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle2, CircleDashed } from "lucide-react";

interface ResumoMetasProps {
  estudosDaSemana: number;
  visitasDaSemana: number;
  metas: {
    ano: number;
    alvo_anual: number;
    alvo_alcancado: number;
  } | null;
}

export function ResumoMetas({ estudosDaSemana, visitasDaSemana, metas }: ResumoMetasProps) {
  const anoAtual = new Date().getFullYear();

  return (
    <div className="grid md:grid-cols-2 gap-6 pt-4">
      
      {/* CARD 1: RESUMO DO PERÍODO */}
      <Card className="bg-card/30 border-border/50 backdrop-blur-md shadow-lg">
        <div className="bg-muted/20 py-2 text-center border-b border-border/50">
          <h3 className="uppercase tracking-widest font-bold text-[10px] md:text-xs text-foreground/70">
            Resumo do Período
          </h3>
        </div>
        <CardContent className="p-4 md:p-6 flex justify-around items-center">
          <div className="text-center space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Estudos Realizados
            </p>
            <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-xl font-black text-3xl text-primary shadow-inner">
              {estudosDaSemana}
            </div>
          </div>
          
          <div className="w-px h-16 bg-border/50" /> {/* Divisor Visual */}
          
          <div className="text-center space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Visitas Feitas
            </p>
            <div className="bg-background border border-border/50 px-6 py-2 rounded-xl font-black text-3xl text-foreground/80 shadow-inner">
              {visitasDaSemana}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: METAS ANUAIS */}
      <Card className="bg-card/30 border-border/50 backdrop-blur-md shadow-lg">
        <div className="bg-muted/20 py-2 text-center border-b border-border/50">
          <h3 className="uppercase tracking-widest font-bold text-[10px] md:text-xs text-foreground/70 flex items-center justify-center gap-2">
            <Target className="w-3 h-3 text-primary" /> Alvo de Batismo Anual ({metas?.ano || anoAtual})
          </h3>
        </div>
        <CardContent className="p-4 md:p-6 flex justify-between items-center gap-2">
          {/* Alvo */}
          <div className="flex flex-col items-center justify-center bg-background border border-border/50 p-3 rounded-xl flex-1 shadow-sm">
            <Target className="w-4 h-4 text-muted-foreground mb-1" />
            <p className="text-[9px] uppercase font-bold text-muted-foreground">Alvo</p>
            <p className="font-black text-xl">{metas?.alvo_anual || 0}</p>
          </div>
          
          {/* Alcançado */}
          <div className="flex flex-col items-center justify-center bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex-1 shadow-sm scale-105">
            <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
            <p className="text-[9px] uppercase font-bold text-green-500">Batismos</p>
            <p className="font-black text-2xl text-green-500">{metas?.alvo_alcancado || 0}</p>
          </div>

          {/* Faltam */}
          <div className="flex flex-col items-center justify-center bg-background border border-border/50 p-3 rounded-xl flex-1 shadow-sm">
            <CircleDashed className="w-4 h-4 text-orange-500/70 mb-1" />
            <p className="text-[9px] uppercase font-bold text-muted-foreground">Faltam</p>
            <p className="font-black text-xl text-orange-500/80">
              {Math.max(0, (metas?.alvo_anual || 0) - (metas?.alvo_alcancado || 0))}
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}