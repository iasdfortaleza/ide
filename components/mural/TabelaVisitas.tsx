import { Users, ChevronDown } from "lucide-react";

interface TabelaVisitasProps {
  visitasLancadas: any[];
  duplas: any[];
}

export function TabelaVisitas({ visitasLancadas, duplas }: TabelaVisitasProps) {
  return (
    <details className="group bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg [&_summary::-webkit-details-marker]:hidden">
      <summary className="bg-muted/30 border-b border-border/50 py-3 px-4 md:px-5 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-foreground/70" />
          <div>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-[0.18em] text-foreground drop-shadow-sm leading-none">
              Relatório de <span className="text-foreground/80">Visitas</span>
            </h2>
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-[0.22em] font-semibold mt-1">
              Famílias e Amigos Visitados
            </p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-500" />
      </summary>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/45 text-muted-foreground uppercase text-[9px] md:text-[10px] tracking-[0.18em] font-bold border-b border-border/50">
              <th className="px-3 py-2.5 text-left w-1/4">Data</th>
              <th className="px-3 py-2.5 text-left w-1/3">Dupla Missionária</th>
              <th className="px-3 py-2.5 text-left">Família / Visitado</th>
            </tr>
          </thead>
          <tbody className="text-xs md:text-sm">
            {!visitasLancadas || visitasLancadas.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground italic">
                  Nenhuma visita lançada neste período.
                </td>
              </tr>
            ) : (
              visitasLancadas.map((visita, index) => {
                const dupla = duplas?.find(d => d.id === visita.dupla_id);
                const isEven = index % 2 === 0;
                
                return (
                  <tr key={visita.id} className={`${isEven ? 'bg-background/35' : 'bg-muted/10'} hover:bg-muted/30 transition-colors border-b border-border/35`}>
                    <td className="px-3 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      {new Date(visita.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-foreground/80 truncate max-w-[200px]">
                      {dupla?.nome_dupla || "Desconhecida"}
                    </td>
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
  );
}