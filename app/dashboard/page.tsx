import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "../auth/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShieldCheck, LogOut, LayoutDashboard, Lock, 
  CalendarCheck, Users, Shield, BookOpen, UserCog, Globe, ChevronRight, Target 
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <Card className="z-10 w-full max-w-md border-primary/20 bg-card/90 backdrop-blur-md text-center shadow-2xl shadow-primary/5">
          <CardHeader className="space-y-2">
            <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-2">
              <Lock className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold">Acesso em Análise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Olá, <span className="text-foreground font-semibold">{perfil.nome}</span>! 
              Seu cadastro foi realizado com sucesso, mas seu perfil ainda está como 
              <span className="text-primary font-bold"> PADRÃO</span>.
            </p>
            <div className="p-4 bg-background/50 rounded-lg border border-border text-sm italic">
              "Aguarde até que um administrador ou mestre libere seu acesso ao painel de gerenciamento."
            </div>
            <form action={signout}>
              <Button variant="outline" className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors">
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
      {/* Header Simples */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-primary w-6 h-6" />
            <span className="font-bold tracking-tight text-lg hidden sm:block">Painel de Controle</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{perfil?.nome}</p>
              <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{perfil?.role}</p>
            </div>
            <form action={signout}>
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Conteúdo do Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto p-6 w-full space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Bem-vindo, {perfil?.nome.split(' ')[0]}
            </h2>
            <p className="text-muted-foreground">O que você deseja gerenciar hoje?</p>
          </div>
          
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-2 rounded-full w-fit">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Sistema Online</span>
          </div>
        </div>

        {/* GRID DE MÓDULOS (DINÂMICO) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulosPermitidos.map((modulo, index) => {
            const Icone = modulo.icon;
            return (
              <Link key={index} href={modulo.href} className="group outline-none">
                <Card className="h-full border-border/50 bg-card/30 hover:bg-muted/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className={`p-3 rounded-lg ${modulo.bgCor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icone className={`w-6 h-6 ${modulo.cor}`} />
                    </div>
                    {/* Badge apenas visual para o Master saber o que é exclusivo dele */}
                    {perfil?.role === "master" && modulo.roles.length === 1 && (
                      <span className="text-[9px] uppercase font-bold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">
                        Exclusivo
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {modulo.titulo}
                    </CardTitle>
                    <CardDescription className="text-sm flex items-center justify-between">
                      {modulo.descricao}
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
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