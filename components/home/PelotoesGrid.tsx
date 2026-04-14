import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";
import type { PelotaoRanking } from "@/services/ranking";

interface PelotoesGridProps {
  pelotoes: PelotaoRanking[];
}

export function PelotoesGrid({ pelotoes }: PelotoesGridProps) {
  const count = pelotoes?.length || 0;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-card px-12 py-14 text-center shadow-lg backdrop-blur-sm">
        <Shield className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <p className="text-lg font-bold uppercase tracking-[0.2em] text-foreground">
          Nenhum pelotão ativo
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre os pelotões no painel.
        </p>
      </div>
    );
  }

  let circleSizeClass =
    "w-[108px] h-[108px] sm:w-[124px] sm:h-[124px] md:w-[138px] md:h-[138px] xl:w-[152px] xl:h-[152px]";
  let itemWidthClass = "w-[132px] sm:w-[150px] md:w-[170px] xl:w-[182px]";
  let gridClass =
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5";
  let gapClass = "gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-6 xl:gap-x-8 xl:gap-y-8";

  if (count <= 4) {
    circleSizeClass =
      "w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[210px] md:h-[210px] xl:w-[230px] xl:h-[230px]";
    itemWidthClass = "w-[170px] sm:w-[210px] md:w-[240px] xl:w-[260px]";
    gridClass = "grid-cols-2 md:grid-cols-2";
    gapClass = "gap-x-8 gap-y-6 sm:gap-x-12 sm:gap-y-8";
  } else if (count <= 6) {
    circleSizeClass =
      "w-[130px] h-[130px] sm:w-[155px] sm:h-[155px] md:w-[180px] md:h-[180px] xl:w-[195px] xl:h-[195px]";
    itemWidthClass = "w-[150px] sm:w-[180px] md:w-[205px] xl:w-[220px]";
    gridClass = "grid-cols-2 sm:grid-cols-3";
    gapClass = "gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-8";
  } else if (count <= 8) {
    circleSizeClass =
      "w-[118px] h-[118px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] xl:w-[172px] xl:h-[172px]";
    itemWidthClass = "w-[140px] sm:w-[165px] md:w-[185px] xl:w-[196px]";
    gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
    gapClass = "gap-x-5 gap-y-5 sm:gap-x-8 sm:gap-y-7";
  }

  return (
    <div className={`grid w-full place-content-center justify-items-center ${gridClass} ${gapClass}`}>
      {pelotoes.map((pelotao, index) => {
        const rank = index + 1;
        
        // Lógica do Texto do Badge
        let rankText = `${rank}º`;
        if (rank === 1) rankText = "Ouro";
        else if (rank === 2) rankText = "Prata";
        else if (rank === 3) rankText = "Bronze";
        
        // Padrões Base (A partir do 4º lugar)
        let badgeColor = "bg-secondary text-secondary-foreground border-border shadow-lg";
        let circleBorder = "border-border bg-card";
        let circleGlow = "shadow-lg group-hover:shadow-xl group-hover:border-primary/40 group-hover:bg-accent/50";
        let nameColor = "text-foreground/90 group-hover:text-foreground";
        let ringColor = "ring-border";
        let ptsColor = "text-foreground font-black drop-shadow-md";
        
        // Pódio Vibrante (Gradientes Triplos para efeito de brilho metálico)
        if (rank === 1) { 
          // OURO
          badgeColor = "bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 text-yellow-950 border-yellow-300 shadow-lg shadow-yellow-500/30";
          circleBorder = "border-yellow-400/60 bg-yellow-400/10";
          circleGlow = "shadow-[0_0_40px_rgba(234,179,8,0.3)] group-hover:shadow-[0_0_60px_rgba(234,179,8,0.5)] group-hover:border-yellow-400 group-hover:bg-yellow-400/20";
          ringColor = "ring-yellow-400/50";
          ptsColor = "text-yellow-400 font-black drop-shadow-md";
        } else if (rank === 2) { 
          // PRATA (Usando Slate para um tom de aço polido mais limpo e reflexivo)
          badgeColor = "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 border-slate-300 shadow-lg shadow-slate-500/30";
          circleBorder = "border-slate-300/60 bg-slate-300/10";
          circleGlow = "shadow-[0_0_30px_rgba(148,163,184,0.3)] group-hover:shadow-[0_0_50px_rgba(148,163,184,0.5)] group-hover:border-slate-300 group-hover:bg-slate-300/20";
          ringColor = "ring-slate-300/50";
          ptsColor = "text-slate-300 font-black drop-shadow-md";
        } else if (rank === 3) { 
          // BRONZE (Tons de Laranja/Âmbar brilhante)
          badgeColor = "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 text-orange-950 border-orange-400 shadow-lg shadow-orange-500/30";
          circleBorder = "border-orange-500/60 bg-orange-500/10";
          circleGlow = "shadow-[0_0_30px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] group-hover:border-orange-500 group-hover:bg-orange-500/20";
          ringColor = "ring-orange-500/50";
          ptsColor = "text-orange-500 font-black drop-shadow-md";
        }

        return (
          <Link
            key={pelotao.id}
            href={`/mural/${pelotao.id}`}
            className={`group ${itemWidthClass} flex flex-col items-center`}
          >
            <div
              className={`relative ${circleSizeClass} rounded-[2rem] border p-2 backdrop-blur-xl transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.05] ${circleBorder} ${circleGlow}`}
            >
              {/* Badge Dinâmico para Ouro/Prata/Bronze */}
              <div className={`absolute -top-1 -right-1 z-20 flex h-8 min-w-[32px] sm:h-9 sm:min-w-[36px] px-2 items-center justify-center rounded-full border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${badgeColor}`}>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                  {rankText}
                </span>
              </div>

              {/* Fundo interno dinâmico */}
              <div className={`relative h-full w-full overflow-hidden rounded-[1.5rem] bg-secondary ring-2 ${ringColor}`}>
                {pelotao.url_imagem_estandarte ? (
                  <Image
                    src={pelotao.url_imagem_estandarte}
                    alt={pelotao.nome}
                    fill
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 220px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    priority={rank <= 4}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Shield className="h-12 w-12 text-primary/30 transition-colors duration-500 group-hover:text-primary/60" />
                  </div>
                )}
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
              </div>
            </div>

            <div className="mt-3.5 w-full text-center px-1">
              <h2 className={`line-clamp-2 text-sm font-extrabold leading-tight drop-shadow-md transition-colors duration-300 sm:text-base md:text-lg ${nameColor}`}>
                {pelotao.nome}
              </h2>
              <p className="mt-1 truncate text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-300 group-hover:text-foreground/90 sm:text-[10px] md:text-[11px]">
                {pelotao.igreja}
              </p>
              
              <div className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-full bg-muted border border-border px-3 py-1 opacity-90 group-hover:opacity-100 group-hover:bg-accent transition-all">
                <span className="text-[10px] sm:text-[11px] font-bold text-foreground">
                  <span className={ptsColor}>{pelotao.pontos7Dias}</span> pts
                </span>
                <span className="w-px h-2.5 bg-border" />
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                  {pelotao.pontosTotal} total
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}