import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";
import { ChristianPattern } from "@/components/home/ChristianPattern";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogged = !!user;

  const { data: pelotoes } = await supabase
    .from("pelotoes")
    .select("id, nome, igreja, url_imagem_estandarte")
    .order("nome");

  const count = pelotoes?.length || 0;

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
    <div className="relative h-screen w-full overflow-hidden text-foreground">
      {/* BASE MAIS CLARA - estilo inspirado no clima do WhatsApp Web */}
      <div className="absolute inset-0 bg-[#1f2428]" />

      {/* gradiente geral */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.06)_100%)]" />

      {/* textura cristã */}
      <div className="absolute inset-0 text-white/[0.1]">
        <ChristianPattern />
      </div>

      {/* segunda textura para dar mais leitura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_30%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.08),transparent_35%)]" />

      {/* luz dourada sutil */}
      <div className="absolute -top-24 left-1/2 h-[34vh] w-[70vw] -translate-x-1/2 rounded-full bg-primary/12 blur-[110px]" />

      {/* brilho lateral frio */}
      <div className="absolute right-[8%] top-[18%] h-64 w-64 rounded-full bg-white/[0.04] blur-[90px]" />

      {/* vinheta */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_56%,rgba(0,0,0,0.32)_100%)]" />

      {/* sombra interna */}
      <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.22)]" />

      {/* botão admin */}
      <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <Link
          href={isLogged ? "/dashboard" : "/login"}
          title={isLogged ? "Ir para o Dashboard" : "Acesso Administrativo"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg opacity-40 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:opacity-100 hover:border-primary/60 hover:bg-primary/10"
        >
          ⚙️
        </Link>
      </div>

      <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-3 sm:px-8 sm:pb-6 sm:pt-5">
        {/* cabeçalho enxuto */}
        <header className="shrink-0">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center">
            <Image
              src="/logo/logo-iasd.svg"
              alt="IASD"
              width={56}
              height={56}
              className="h-10 w-10 drop-shadow-[0_0_18px_rgba(255,255,255,0.12)] sm:h-12 sm:w-12 md:h-14 md:w-14"
              priority
            />

            <h1 className="mt-2 text-center text-base font-black uppercase tracking-[0.14em] text-white/95 drop-shadow-lg sm:text-xl md:text-2xl">
              Mural{" "}
              <span className="text-primary [text-shadow:0_0_14px_rgba(212,175,55,0.18)]">
                Missionário
              </span>
            </h1>
          </div>
        </header>

        {/* área central */}
        <main className="min-h-0 flex-1 py-3 sm:py-4">
          <div className="mx-auto flex h-full max-w-[1600px] items-center justify-center">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/8 px-10 py-12 text-center backdrop-blur-xl">
                <Shield className="mb-4 h-16 w-16 text-primary/70" />
                <p className="text-lg font-bold uppercase tracking-[0.2em] text-white/80">
                  Nenhum pelotão ativo
                </p>
                <p className="mt-2 text-sm text-white/55">
                  Cadastre os pelotões para exibição no mural.
                </p>
              </div>
            ) : (
              <div
                className={`grid w-full place-content-center ${gridClass} ${gapClass}`}
              >
                {pelotoes?.map((pelotao) => (
                  <Link
                    key={pelotao.id}
                    href={`/mural/${pelotao.id}`}
                    className={`group ${itemWidthClass} flex flex-col items-center`}
                  >
                    <div
                      className={`relative ${circleSizeClass} rounded-[2rem] border border-white/12 bg-white/[0.09] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03] group-hover:border-primary/70 group-hover:bg-white/[0.14] group-hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]`}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-[#20262b] ring-1 ring-white/10">
                        {pelotao.url_imagem_estandarte ? (
                          <Image
                            src={pelotao.url_imagem_estandarte}
                            alt={pelotao.nome}
                            fill
                            sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 220px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Shield className="h-12 w-12 text-white/20 transition-colors duration-300 group-hover:text-primary/80" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.22),transparent_60%)]" />
                      </div>
                    </div>

                    <div className="mt-3 w-full text-center">
                      <h2 className="line-clamp-2 text-sm font-extrabold leading-tight text-white drop-shadow-md transition-colors duration-300 group-hover:text-primary sm:text-base md:text-lg">
                        {pelotao.nome}
                      </h2>

                      <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-primary/85 sm:text-[11px] md:text-xs">
                        {pelotao.igreja}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}