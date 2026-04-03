import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Shield, Lock } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  // Buscar todos os pelotões cadastrados
  const { data: pelotoes } = await supabase
    .from("pelotoes")
    .select("id, nome, igreja, url_imagem_estandarte")
    .order("nome");

  const count = pelotoes?.length || 0;

  // LÓGICA DINÂMICA DE TAMANHO: 
  // Quanto mais pelotões, menores ficam os círculos para caberem todos na tela.
  let circleSizeClass = "w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]"; // Padrão para 9+ pelotões

  if (count <= 2) {
    circleSizeClass = "w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px]";
  } else if (count <= 4) {
    circleSizeClass = "w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px]";
  } else if (count <= 8) {
    circleSizeClass = "w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px]";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6">
      
      {/* TOPO MINIMALISTA: Logo e Título discretos */}
      <div className="mt-8 mb-12 flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
        <Image 
          src="/logo/logo-iasd.svg" 
          alt="IASD" 
          width={40} 
          height={40}
          className="drop-shadow-sm" 
        />
        <h1 className="text-xl font-bold tracking-widest uppercase text-foreground/80">
          Mural <span className="text-primary">Missionário</span>
        </h1>
      </div>

      {/* CONTEÚDO PRINCIPAL: Os Pelotões em Círculos */}
      <main className="flex-1 w-full max-w-7xl flex flex-wrap items-center justify-center gap-8 md:gap-14">
        
        {count === 0 ? (
          <div className="flex flex-col items-center opacity-30">
            <Shield className="w-16 h-16 mb-2" />
            <p className="text-sm uppercase tracking-widest">Nenhum pelotão ativo</p>
          </div>
        ) : (
          pelotoes?.map((pelotao) => (
            <Link key={pelotao.id} href={`/mural/${pelotao.id}`} className="group flex flex-col items-center gap-5">
              
              {/* O Círculo Dinâmico */}
              <div className={`relative rounded-full overflow-hidden border-[4px] border-border/50 bg-muted/20 group-hover:border-primary group-hover:scale-105 group-hover:shadow-[0_0_40px_-10px_rgba(255,215,0,0.3)] transition-all duration-500 ease-out flex items-center justify-center ${circleSizeClass}`}>
                
                {pelotao.url_imagem_estandarte ? (
                  <>
                    <Image 
                      src={pelotao.url_imagem_estandarte} 
                      alt={pelotao.nome}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    {/* Película escura que clareia ao passar o mouse */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />
                  </>
                ) : (
                  <Shield className="w-1/3 h-1/3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors duration-500" />
                )}
              </div>
              
              {/* Textos abaixo do Círculo */}
              <div className="text-center space-y-1">
                <h2 className="text-xl md:text-2xl font-bold text-foreground/90 group-hover:text-primary transition-colors duration-300">
                  {pelotao.nome}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  {pelotao.igreja}
                </p>
              </div>

            </Link>
          ))
        )}

      </main>

      {/* RODAPÉ DISCRETO: Acesso Admin */}
      <footer className="w-full mt-16 pt-6 flex justify-center border-t border-border/10">
        <Link 
          href="/login" 
          className="text-[10px] text-muted-foreground/30 hover:text-primary flex items-center gap-1.5 transition-colors duration-300"
          title="Acesso Administrativo"
        >
          <Lock className="w-3 h-3" /> Painel Restrito
        </Link>
      </footer>

    </div>
  );
}