import { createClient } from "@/utils/supabase/server";
import { salvarMeta, editarMeta, excluirMeta } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, ArrowLeft, Trophy, CalendarDays, CheckCircle2, History, Shield, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MetasPage() {
  const supabase = await createClient();

  // 1. Verificação de Segurança: Apenas MASTER
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userPerfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (userPerfil?.role !== "master") {
    redirect("/dashboard");
  }

  // 2. Buscar todas as metas já cadastradas
  const { data: metas } = await supabase
    .from("metas")
    .select(`
      *,
      pelotao:pelotoes(nome)
    `)
    .order("ano", { ascending: false })
    .order("created_at", { ascending: false });

  // 3. Buscar todos os pelotões disponíveis para o select
  const { data: pelotoes } = await supabase
    .from("pelotoes")
    .select("id, nome")
    .order("nome");

  const anoAtual = new Date().getFullYear();
  
  // Lógica inteligente: O ano "Vigente" será sempre o maior ano já cadastrado no banco.
  const maxAno = metas && metas.length > 0 
    ? Math.max(...metas.map(m => m.ano)) 
    : anoAtual;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background min-h-screen text-foreground">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Metas da Igreja</h1>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mt-1">Defina e atualize os alvos de batismo</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted transition-colors bg-card shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulário de Criação */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card/80 backdrop-blur-md sticky top-24 shadow-xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-xl font-bold text-foreground">Configurar Meta</CardTitle>
              <CardDescription className="text-muted-foreground">
                Crie ou atualize uma meta para um pelotão específico.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {pelotoes && pelotoes.length > 0 ? (
                <form action={salvarMeta} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="pelotao_id" className="flex items-center gap-2 text-foreground/90 font-medium">
                      <Shield className="w-4 h-4 text-primary" /> Pelotão
                    </Label>
                    <select 
                      id="pelotao_id" 
                      name="pelotao_id" 
                      required 
                      defaultValue=""
                      className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary text-foreground outline-none transition-colors"
                    >
                      {/* CORREÇÃO APLICADA AQUI: bg-background e text-foreground */}
                      <option value="" disabled className="text-muted-foreground bg-background">Selecione um pelotão...</option>
                      {pelotoes.map(p => (
                        <option key={p.id} value={p.id} className="bg-background text-foreground">{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ano" className="flex items-center gap-2 text-foreground/90 font-medium">
                      <CalendarDays className="w-4 h-4 text-primary" /> Ano
                    </Label>
                    <Input 
                      id="ano" 
                      name="ano" 
                      type="number" 
                      min="2000" 
                      max="2100" 
                      defaultValue={anoAtual} 
                      required 
                      className="bg-input font-bold text-lg border-border focus-visible:ring-primary text-foreground transition-colors" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="alvo_anual" className="flex items-center gap-2 text-foreground/90 font-medium">
                      <Target className="w-4 h-4 text-primary" /> Alvo de Batismos (Meta)
                    </Label>
                    <Input 
                      id="alvo_anual" 
                      name="alvo_anual" 
                      type="number" 
                      min="0" 
                      placeholder="Ex: 10" 
                      required 
                      className="bg-input border-border focus-visible:ring-primary text-foreground transition-colors" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="alvo_alcancado" className="flex items-center gap-2 text-foreground/90 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Batismos Alcançados
                    </Label>
                    <Input 
                      id="alvo_alcancado" 
                      name="alvo_alcancado" 
                      type="number" 
                      min="0" 
                      defaultValue="0" 
                      required 
                      className="bg-input border-border focus-visible:ring-primary text-foreground transition-colors" 
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4 font-bold shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all gap-2 text-primary-foreground">
                    Salvar Meta <Trophy className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="p-4 bg-destructive/10 text-destructive font-medium text-sm rounded-md border border-destructive/20 text-center">
                  Você precisa cadastrar pelo menos um Pelotão antes de definir metas.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Histórico de Metas */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            Histórico de Metas <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{metas?.length || 0}</span>
          </h2>
          
          {metas?.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/40">
              <Target className="w-10 h-10 mb-2 opacity-20" />
              <p className="font-medium tracking-wide">Nenhuma meta cadastrada ainda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {metas?.map((meta) => {
                const isVigente = meta.ano === maxAno;
                const nomePelotao = meta.pelotao ? (Array.isArray(meta.pelotao) ? meta.pelotao[0].nome : meta.pelotao.nome) : "Pelotão Desconhecido";
                const progresso = meta.alvo_anual > 0 
                  ? Math.min(100, Math.round((meta.alvo_alcancado / meta.alvo_anual) * 100)) 
                  : 0;

                return (
                  <Card key={meta.id} className={`overflow-hidden border-border bg-card shadow-md flex flex-col hover:shadow-lg transition-all ${isVigente ? 'ring-2 ring-primary/80 shadow-[0_0_20px_rgba(var(--color-primary),0.15)]' : ''}`}>
                    <div className={`p-4 border-b border-border/50 flex flex-col gap-1.5 ${isVigente ? 'bg-primary/10' : 'bg-muted/10'}`}>
                      <div className="flex justify-between items-center w-full">
                        <h3 className={`text-xl font-black truncate ${isVigente ? 'text-primary drop-shadow-sm' : 'text-foreground/90'}`}>
                          {nomePelotao}
                        </h3>
                        {isVigente && (
                          <span className="text-[9px] uppercase font-black tracking-widest bg-primary text-primary-foreground px-2.5 py-1 rounded-sm shadow-sm shrink-0">
                            Vigente
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${isVigente ? 'text-primary/80' : 'text-muted-foreground'}`}>
                        <CalendarDays className="w-3.5 h-3.5" /> Ano: {meta.ano}
                      </p>
                    </div>
                    
                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Alvo Anual</p>
                          <p className="text-3xl font-black text-foreground drop-shadow-sm">{meta.alvo_anual}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] uppercase font-bold text-green-500 tracking-widest">Alcançado</p>
                          <p className="text-3xl font-black text-green-500 drop-shadow-sm">{meta.alvo_alcancado}</p>
                        </div>
                      </div>

                      {/* Barra de Progresso Visual */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Progresso</span>
                          <span className={progresso >= 100 ? "text-green-500" : "text-primary"}>{progresso}%</span>
                        </div>
                        <div className="w-full h-3 bg-input rounded-full overflow-hidden border border-border/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${progresso >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_10px_rgba(var(--color-primary),0.3)]'}`}
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                      </div>

                      {/* BOTÕES DE EDIÇÃO E EXCLUSÃO */}
                      <div className="mt-auto space-y-2 pt-4">
                        <details className="group/edit [&_summary::-webkit-details-marker]:hidden">
                          <summary className="flex items-center justify-center gap-2 w-full p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-md cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm font-bold list-none">
                            <Pencil className="w-4 h-4" /> Editar Meta
                          </summary>
                          
                          <div className="pt-4 space-y-3 pb-2">
                            <form action={editarMeta} className="space-y-3 bg-muted/5 p-4 rounded-lg border border-border/50 shadow-inner">
                              <input type="hidden" name="id" value={meta.id} />

                              <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pelotão</Label>
                                <select name="pelotao_id" defaultValue={meta.pelotao_id || ""} required className="flex h-9 w-full rounded-md border border-border bg-input px-2 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none">
                                  {/* CORREÇÃO APLICADA AQUI: bg-background e text-foreground */}
                                  {pelotoes?.map(p => (
                                    <option key={p.id} value={p.id} className="bg-background text-foreground">{p.nome}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Ano</Label>
                                  <Input name="ano" type="number" defaultValue={meta.ano} required className="h-9 text-xs bg-input border-border text-foreground" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Alvo</Label>
                                  <Input name="alvo_anual" type="number" defaultValue={meta.alvo_anual} required className="h-9 text-xs bg-input border-border text-foreground" />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Batismos</Label>
                                  <Input name="alvo_alcancado" type="number" defaultValue={meta.alvo_alcancado} required className="h-9 text-xs bg-input border-border text-foreground" />
                                </div>
                              </div>

                              <Button type="submit" size="sm" className="h-9 text-xs font-bold w-full mt-2 shadow-sm text-primary-foreground">Salvar Alterações</Button>
                            </form>
                          </div>
                        </details>

                        <form action={async () => {
                          "use server";
                          await excluirMeta(meta.id);
                        }}>
                          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" type="submit">
                            <Trash2 className="w-4 h-4" /> Excluir Meta
                          </Button>
                        </form>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}