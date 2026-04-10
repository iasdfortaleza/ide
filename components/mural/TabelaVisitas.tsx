import { Users, ChevronDown } from "lucide-react";

interface TabelaVisitasProps {
  visitasLancadas: any[];
  duplas: any[];
}

export function TabelaVisitas({ visitasLancadas, duplas }: TabelaVisitasProps) {
  return (
    <details className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/10 [&_summary::-webkit-details-marker]:hidden">
      <summary className="bg-primary/10 border-b border-border/50 py-3 px-5 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none">
            Relatório de <span className="text-primary">Visitas</span>
          </h2>
        </div>
        <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform duration-500" />
      </summary>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground uppercase text-[9px] md:text-[10px] tracking-widest font-bold border-b border-border/50">
              <th className="p-3 text-left w-1/4">Data</th>
              <th className="p-3 text-left w-1/3">Dupla Missionária</th>
              <th className="p-3 text-left">Família / Visitado</th>
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
                
                // Mesma lógica de zebra da Tabela de Estudos para o fundo azul
                const isEven = index % 2 === 0;
                const rowBgClass = isEven ? "bg-card" : "bg-muted/10";
                const borderClass = "border-b border-border/30";
                
                return (
                  <tr key={visita.id} className={`${rowBgClass} ${borderClass} hover:bg-primary/5 transition-colors`}>
                    <td className="px-3 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      {new Date(visita.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-foreground/90 truncate max-w-[200px]">
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