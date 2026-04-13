import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "../auth/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShieldCheck, LogOut, LayoutDashboard, Lock, 
  CalendarCheck, Users, Shield, BookOpen, UserCog, Globe, ChevronRight, Target, MonitorPlay 
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Busca o usuário logado
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Busca os dados do perfil dele na SUA tabela 'perfis'
  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .single();

  // Se for Perfil PADRÃO (Ainda não liberado pelo Master)
  if (perfil?.role === "padrao") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
        {/* Glow Dourado */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Card Escuro contrastando com o Dourado */}
        <Card className="z-10 w-full max-w-md border-border bg-card/90 backdrop-blur-md text-center shadow-2xl shadow-black/20">
          <CardHeader className="space-y-3">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-2 border border-primary/20">
              <Lock className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Acesso em Análise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Olá, <span className="text-foreground font-bold">{perfil.nome}</span>! 
              Seu cadastro foi realizado com sucesso, mas seu perfil ainda está como 
              <span className="text-primary font-bold"> PADRÃO</span>.
            </p>
            <div className="p-4 bg-background/50 rounded-lg border border-border/50 text-sm italic text-muted-foreground/80">
              "Aguarde até que um administrador ou mestre libere seu acesso ao painel de gerenciamento."
            </div>
            <form action={signout}>
              <Button variant="outline" className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all">
                <LogOut className="w-4 h-4" /> Sair do Sistema
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Definição dos Módulos do Sistema e suas Permissões (Padronizado na cor Primary/Dourada)
  const modulos = [
    { 
      titulo: "Rotina Missionária", 
      descricao: "Lançar estudos bíblicos e visitas semanais.", 
      href: "/dashboard/lancamentos", 
      icon: CalendarCheck, 
      roles: ["admin", "master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    },
    { 
      titulo: "Duplas Missionárias", 
      descricao: "Gerenciar componentes e estudantes.", 
      href: "/dashboard/duplas", 
      icon: Users, 
      roles: ["admin", "master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    },
    { 
      titulo: "Centro de Treinamento", 
      descricao: "Acessar capacitação e aulas em vídeo.", 
      href: "/dashboard/aulas", 
      icon: MonitorPlay, 
      roles: ["admin", "master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    },
    { 
      titulo: "Gestão de Pelotões", 
      descricao: "Cadastrar pelotões, estandartes e capitães.", 
      href: "/dashboard/pelotoes", 
      icon: Shield, 
      roles: ["master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    },
    { 
      titulo: "Estudos Bíblicos", 
      descricao: "Cadastrar materiais e lições.", 
      href: "/dashboard/estudos", 
      icon: BookOpen, 
      roles: ["master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    },
    { 
      titulo: "Metas da Igreja", 
      descricao: "Definir e atualizar alvos de batismo.", 
      href: "/dashboard/metas", 
      icon: Target, 
      roles: ["master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    },
    { 
      titulo: "Permissões de Acesso", 
      descricao: "Aprovar cadastros e definir níveis de acesso.", 
      href: "/dashboard/usuarios", 
      icon: UserCog, 
      roles: ["master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    },
    { 
      titulo: "Mural Público", 
      descricao: "Acessar a tela de projeção da igreja.", 
      href: "/", 
      icon: Globe, 
      roles: ["admin", "master"],
      cor: "text-primary",
      bgCor: "bg-primary/10"
    }
  ];

  // Filtra os módulos baseados no cargo (role) do usuário logado
  const modulosPermitidos = modulos.filter(modulo => modulo.roles.includes(perfil?.role || "padrao"));

  // Se for MASTER ou ADMIN (Acesso Liberado)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header contrastante */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-primary w-6 h-6" />
            <span className="font-bold tracking-widest uppercase text-foreground hidden sm:block">
              Painel <span className="text-primary">Administrativo</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-foreground leading-none">{perfil?.nome}</p>
              <p className="text-[10px] text-primary uppercase font-black tracking-widest mt-1">{perfil?.role}</p>
            </div>
            <form action={signout}>
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Conteúdo do Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto p-6 w-full space-y-8 mt-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">
              Bem-vindo, <span className="text-primary">{perfil?.nome.split(' ')[0]}</span>
            </h2>
            <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-xs">
              O que você deseja gerenciar hoje?
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2.5 rounded-full w-fit shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Sistema Online</span>
          </div>
        </div>

        {/* GRID DE MÓDULOS (DINÂMICO) - Contraste Elevado */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modulosPermitidos.map((modulo, index) => {
            const Icone = modulo.icon;
            return (
              <Link key={index} href={modulo.href} className="group outline-none block h-full">
                <Card className="h-full border-border bg-card hover:bg-muted/10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(var(--color-primary),0.1)] hover:-translate-y-1 overflow-hidden relative">
                  {/* Linha dourada sutil no topo do card ao passar o mouse */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className={`p-3 rounded-xl border border-primary/10 ${modulo.bgCor} group-hover:bg-primary group-hover:border-primary transition-colors duration-300 shadow-inner`}>
                      <Icone className={`w-6 h-6 ${modulo.cor} group-hover:text-primary-foreground transition-colors duration-300`} />
                    </div>
                    {/* Badge apenas visual para o Master saber o que é exclusivo dele */}
                    {perfil?.role === "master" && modulo.roles.length === 1 && (
                      <span className="text-[9px] uppercase font-black bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20 tracking-widest">
                        Exclusivo
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-1.5 pt-2">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                      {modulo.titulo}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      {modulo.descricao}
                      <ChevronRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

      </main>
    </div>
  );
}