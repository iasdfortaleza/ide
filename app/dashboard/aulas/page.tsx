import { createClient } from "@/utils/supabase/server";
import { adicionarAula, excluirAula } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Trash2, Plus, Play, ArrowLeft, ExternalLink, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AulasPage() {
  const supabase = await createClient();

  // 1. Verificação de Segurança (Apenas Master ou Admin)
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userPerfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (!userPerfil || userPerfil.role === "padrao") {
    redirect("/dashboard");
  }

  const isMaster = userPerfil.role === "master";

  // 2. Buscar todas as aulas (Ordenadas pelas mais recentes)
  const { data: aulas } = await supabase
    .from("aulas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background min-h-screen text-foreground">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MonitorPlay className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Centro de Treinamento</h1>
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mt-1">
              {isMaster ? "Gestão de Conteúdo (Master)" : "Capacitação Missionária"}
            </p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted transition-colors bg-card">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA DE CADASTRO (Apenas para Master) */}
        {isMaster && (
          <div className="lg:col-span-1">
            <Card className="border-border bg-card/80 backdrop-blur-md sticky top-24 shadow-xl">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Nova Aula
                </CardTitle>
                <CardDescription className="text-muted-foreground">Adicione vídeos do YouTube para treinar sua equipe.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form action={adicionarAula} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="titulo" className="text-foreground/90 font-medium">Título da Aula</Label>
                    <Input id="titulo" name="titulo" placeholder="Ex: Como abordar uma família" required className="bg-input border-border focus-visible:ring-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="url_youtube" className="text-foreground/90 font-medium">Link do Vídeo (YouTube)</Label>
                    <Input id="url_youtube" name="url_youtube" placeholder="https://www.youtube.com/watch?v=..." required className="bg-input border-border focus-visible:ring-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="descricao" className="text-foreground/90 font-medium">Breve Descrição (Opcional)</Label>
                    <Textarea id="descricao" name="descricao" placeholder="Sobre o que trata este vídeo?" className="bg-input border-border focus-visible:ring-primary resize-none h-24" />
                  </div>

                  <Button type="submit" className="w-full mt-4 font-bold text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
                    Cadastrar Aula
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* LISTA DE AULAS */}
        <div className={`${isMaster ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Aulas Disponíveis <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{aulas?.length || 0}</span>
          </h2>

          {!aulas || aulas.length === 0 ? (
            <div className="p-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/40">
              <Video className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium tracking-wide">Nenhuma aula cadastrada ainda.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-1 xl:grid-cols-2 gap-6">
              {aulas.map((aula) => (
                <Card key={aula.id} className="group border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-md hover:shadow-primary/10 transition-all border hover:border-primary/30">
                  {/* Miniatura do YouTube */}
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${aula.youtube_id}`}
                      title={aula.titulo}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">{aula.titulo}</h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{aula.descricao || "Sem descrição disponível."}</p>
                      </div>
                      
                      {isMaster && (
                        <form action={async () => { "use server"; await excluirAula(aula.id); }}>
                          <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        Postado em {new Date(aula.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <a 
                        href={`https://www.youtube.com/watch?v=${aula.youtube_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        Ver no YouTube <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}