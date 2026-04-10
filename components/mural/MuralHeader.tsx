import Link from "next/link";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MuralHeaderProps {
  nome: string;
  igreja: string;
  startDate: string;
  endDate: string;
}

export function MuralHeader({ nome, igreja, startDate, endDate }: MuralHeaderProps) {
  return (
    <header className="w-full bg-card/90 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col">
          {/* Nome do pelotão em Dourado (text-primary) */}
          <h1 className="text-lg md:text-2xl font-black text-primary tracking-widest uppercase leading-none drop-shadow-sm">
            {nome}
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-widest uppercase flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {igreja}
          </p>
        </div>
      </div>
      
      {/* CALENDÁRIO DISCRETO (DROPDOWN) */}
      <details className="relative group">
        <summary className="list-none cursor-pointer w-10 h-10 rounded-full bg-muted/30 hover:bg-primary/10 transition-colors flex items-center justify-center border border-border/50">
          <Calendar className="w-5 h-5 text-primary" />
        </summary>
        
        <div className="absolute right-0 top-full mt-3 p-4 bg-card border border-border/50 shadow-2xl rounded-xl w-[280px] z-50">
          {/* O formulário GET padrão atualiza a URL com os novos parâmetros ?start=...&end=... */}
          <form method="GET" className="flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
              Filtro de Período
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Data Inicial</label>
              {/* Inputs usando as variáveis transparentes (bg-input) e texto branco (text-foreground) */}
              <Input type="date" name="start" defaultValue={startDate} className="h-8 text-xs bg-input text-foreground border-border/50 focus:ring-primary" />
              
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Data Final</label>
              <Input type="date" name="end" defaultValue={endDate} className="h-8 text-xs bg-input text-foreground border-border/50 focus:ring-primary" />
            </div>
            {/* O botão principal automaticamente puxa bg-primary (Dourado) e text-primary-foreground (Escuro) */}
            <Button type="submit" size="sm" className="h-8 text-xs font-bold w-full mt-2 shadow-md">
              Aplicar Filtro
            </Button>
          </form>
        </div>
      </details>
    </header>
  );
}