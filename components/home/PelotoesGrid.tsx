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
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-white/5 px-12 py-14 text-center backdrop-blur-xl shadow-2xl">
        <Shield className="mb-4 h-16 w-16 text-primary/40" />
        <p className="text-lg font-bold uppercase tracking-[0.2em] text-white/80">
          Nenhum pelotão ativo
        </p>
        <p className="mt-2 text-sm text-white/40">
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
        
        let badgeColor = "bg-[#1a1f26] text-white/70 border-white/10 shadow-lg";
        let circleBorder = "border-white/10 bg-white/[0.05]";
        let circleGlow = "shadow-[0_15px_40px_rgba(0,0,0,0.4)] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:border-white/30 group-hover:bg-white/[0.1]";
        let nameColor = "text-white/90 group-hover:text-white";
        let ringColor = "ring-white/5";
        let ptsColor = "text-primary";
        
        if (rank === 1) { 
          badgeColor = "bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 border-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.6)]";
          circleBorder = "border-yellow-500/60 bg-yellow-500/10";
          circleGlow = "shadow-[0_0_40px_rgba(234,179,8,0.3)] group-hover:shadow-[0_0_60px_rgba(234,179,8,0.5)] group-hover:border-yellow-400 group-hover:bg-yellow-500/20";
          nameColor = "text-yellow-400 group-hover:text-yellow-300";
          ringColor = "ring-yellow-500/30";
          ptsColor = "text-yellow-400";
        } else if (rank === 2) { 
          badgeColor = "bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-900 border-white shadow-[0_0_20px_rgba(212,212,216,0.5)]";
          circleBorder = "border-zinc-400/60 bg-zinc-400/10";
          circleGlow = "shadow-[0_0_30px_rgba(212,212,216,0.2)] group-hover:shadow-[0_0_50px_rgba(212,212,216,0.4)] group-hover:border-zinc-300 group-hover:bg-zinc-400/20";
          nameColor = "text-zinc-300 group-hover:text-zinc-200";
          ringColor = "ring-zinc-400/30";
          ptsColor = "text-zinc-300";
        } else if (rank === 3) { 
          badgeColor = "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950 border-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.5)]";
          circleBorder = "border-amber-600/60 bg-amber-600/10";
          circleGlow = "shadow-[0_0_30px_rgba(217,119,6,0.2)] group-hover:shadow-[0_0_50px_rgba(217,119,6,0.4)] group-hover:border-amber-500 group-hover:bg-amber-600/20";
          nameColor = "text-amber-500 group-hover:text-amber-400";
          ringColor = "ring-amber-600/30";
          ptsColor = "text-amber-500";
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
              {/* O Rank desceu ligeiramente de -top-3 para -top-1 e -right-1 */}
              <div className={`absolute -top-1 -right-1 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${badgeColor}`}>
                <span className="text-[11px] sm:text-xs font-black italic tracking-tighter">
                  {rank}º
                </span>
              </div>

              <div className={`relative h-full w-full overflow-hidden rounded-[1.5rem] bg-[#1a1f26] ring-1 ${ringColor}`}>
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
                    <Shield className="h-12 w-12 text-white/10 transition-colors duration-500 group-hover:text-primary/60" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.3),transparent_40%)]" />
              </div>
            </div>

            <div className="mt-3.5 w-full text-center px-1">
              <h2 className={`line-clamp-2 text-sm font-extrabold leading-tight drop-shadow-md transition-colors duration-300 sm:text-base md:text-lg ${nameColor}`}>
                {pelotao.nome}
              </h2>
              <p className="mt-1 truncate text-[9px] font-black uppercase tracking-[0.2em] text-primary/70 transition-colors duration-300 group-hover:text-primary sm:text-[10px] md:text-[11px] drop-shadow-sm">
                {pelotao.igreja}
              </p>
              
              <div className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.04] border border-white/10 px-3 py-1 opacity-70 group-hover:opacity-100 group-hover:bg-white/[0.08] transition-all">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/90">
                  <span className={ptsColor}>{pelotao.pontos7Dias}</span> sem
                </span>
                <span className="w-px h-2.5 bg-white/30" />
                <span className="text-[10px] sm:text-[11px] font-medium text-white/60">
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