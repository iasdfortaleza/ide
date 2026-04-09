import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ChristianPattern } from "@/components/home/ChristianPattern";
import { getRankingPelotoes } from "@/services/ranking";
import { PelotoesGrid } from "@/components/home/PelotoesGrid";
import { Metadata } from "next";

export const revalidate = 60;

// ==========================================
// METADADOS DE COMPARTILHAMENTO (SEO/OG)
// ==========================================
export const metadata: Metadata = {
  title: "Ide - Mural Missionário | IASD São Félix",
  description: "Sistema de cadastro e acompanhamento de equipes missionárias para o projeto de expansão da Igreja Adventista em São Félix, Marabá-PA.",
  openGraph: {
    title: "Ide - Mural Missionário",
    description: "Acompanhamento em tempo real das unidades e pelotões do projeto de expansão missionária em São Félix, Marabá-PA.",
    url: "https://seu-dominio.com", // Substitua pelo seu domínio quando estiver online
    siteName: "Ide Mural Missionário",
    images: [
      {
        url: "/ensiando-a-palavra.jpeg", // Imagem que você salvou na pasta public
        width: 1200,
        height: 630,
        alt: "Projeto Missionário IASD São Félix",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ide - Mural Missionário",
    description: "Acompanhamento em tempo real das unidades missionárias da IASD São Félix.",
    images: ["/ensiando-a-palavra.jpeg"],
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogged = !!user;
  const pelotoesRanqueados = await getRankingPelotoes();

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden text-foreground bg-[#0f1319]">
      
      {/* ================= BACKGROUND STUDIO ================= */}
      <div className="absolute inset-0 z-0 text-white/[0.04]">
        <ChristianPattern />
      </div>
      <div className="absolute -top-[15%] left-1/2 h-[50vh] w-[80vw] -translate-x-1/2 rounded-[100%] bg-primary/10 blur-[130px] mix-blend-screen pointer-events-none" />
      <div className="absolute -bottom-[20%] left-1/2 h-[40vh] w-[70vw] -translate-x-1/2 rounded-[100%] bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(6,9,14,0.85)_100%)] pointer-events-none" />

      {/* ================= CABEÇALHO FIXO ================= */}
      <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center space-y-1">
        <Link
          href={isLogged ? "/dashboard" : "/login"}
          title={isLogged ? "Ir para o Dashboard" : "Acesso Administrativo"}
          className="group"
        >
          <Image
            src="/logo/logo-iasd.svg"
            alt="Logo IASD"
            width={32}
            height={32}
            className="h-7 w-7 sm:h-8 sm:w-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform duration-700 group-hover:scale-110"
            priority
          />
        </Link>
        <h1 className="text-center text-lg font-black uppercase tracking-[0.2em] text-white/95 drop-shadow-lg sm:text-xl lg:text-2xl">
          Mural{" "}
          <span className="text-primary drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            Missionário
          </span>
        </h1>
      </div>

      {/* ================= CONTEÚDO VISUAL TESTE (A Grade) ================= */}
      <div className="relative z-10 flex h-full flex-col px-4 sm:px-8">
        <main className="min-h-0 flex-1 pt-24 sm:pt-28 pb-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="mx-auto flex min-h-full max-w-[1600px] items-center justify-center">
            <PelotoesGrid pelotoes={pelotoesRanqueados} />
          </div>
        </main>
      </div>

    </div>
  );
}