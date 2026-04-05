import { createClient } from "@/utils/supabase/server";
import { 
  criarEstudo, excluirEstudo, editarEstudo, 
  adicionarLicao, excluirLicao, editarLicao 
} from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Trash2, Plus, Image as ImageIcon, Layers, BookText, Pencil, ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EstudosPage() {
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

  // 2. Buscar Estudos Bíblicos e suas Lições vinculadas
  const { data: estudos } = await supabase
    .from("estudos_biblicos")
    .select(`
      *,
      licoes (*)
    `)
    .order("created_at", { ascending: false });

  // Ordenar as lições de cada estudo pelo número (crescente)
  estudos?.forEach(estudo => {
    estudo.licoes.sort((a: any, b: any) => a.numero_licao - b.numero_licao);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho com Botão de Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Materiais de Estudo</h1>
            <p className="text-sm text-muted-foreground">Cadastre livros e apostilas</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulário do Estudo (Livro) */}
        <div className="lg:col-span-1">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-md sticky top-24 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Novo Estudo Bíblico</CardTitle>
              <CardDescription>Cadastre a capa e o título do material.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={criarEstudo} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="nome_estudo">Nome do Estudo</Label>
                  <Input id="nome_estudo" name="nome_estudo" placeholder="Ex: Ouvindo a Voz de Deus" required className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capa">Capa do Livro (Imagem)</Label>
                  <Input 
                    id="capa" 
                    name="capa" 
                    type="file" 
                    accept="image/*" 
                    required 
                    className="cursor-pointer file:text-primary file:font-bold file:mr-4 file:border-0 file:bg-primary/10 file:rounded-md file:px-2 file:py-1 hover:file:bg-primary/20"
                  />
                </div>

                <Button type="submit" className="w-full mt-4 font-bold shadow-md hover:shadow-primary/25">
                  Salvar Material
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Lista de Estudos (Acordeões) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Materiais Cadastrados ({estudos?.length || 0})</h2>
          
          {estudos?.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/10">
              <Layers className="w-10 h-10 mb-2 opacity-20" />
              <p>Nenhum estudo bíblico cadastrado.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {estudos?.map((estudo) => (
                <details key={estudo.id} className="group border border-primary/20 bg-card/50 backdrop-blur-md rounded-xl overflow-hidden shadow-sm [&_summary::-webkit-details-marker]:hidden">
                  
                  {/* CABEÇALHO DO ACORDEÃO (Resumo do Estudo) */}
                  <summary className="bg-muted/20 px-4 py-3 border-b border-border/50 flex justify-between items-center cursor-pointer list-none hover:bg-muted/40 transition-all">
                    <div className="flex items-center gap-4">
                      {/* Miniatura da Capa no Resumo */}
                      <div className="w-12 h-12 rounded-md bg-background relative flex-shrink-0 flex items-center justify-center overflow-hidden border border-primary/20 shadow-sm">
                        {estudo.url_capa ? (
                          <Image 
                            src={estudo.url_capa} 
                            alt={`Capa ${estudo.nome_estudo}`} 
                            fill 
                            sizes="48px"
                            className="object-cover" 
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                        <BookText className="w-5 h-5 text-primary" />
                        {estudo.nome_estudo}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-background px-3 py-1.5 rounded-md text-muted-foreground border border-border/50 font-bold whitespace-nowrap">
                        {estudo.licoes.length} Lições
                      </span>
                      <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-300" />
                    </div>
                  </summary>

                  {/* CONTEÚDO QUE APARECE AO ABRIR */}
                  <div className="flex flex-col sm:flex-row bg-background/40">
                    
                    {/* IMAGEM E AÇÕES DO ESTUDO */}
                    <div className="w-full sm:w-48 bg-muted/5 relative flex-shrink-0 flex flex-col items-center justify-start border-b sm:border-b-0 sm:border-r border-border/50 p-4 gap-4">
                      <div className="w-full aspect-[3/4] relative rounded-md overflow-hidden border border-border/50 shadow-sm bg-card">
                        {estudo.url_capa ? (
                          <Image 
                            src={estudo.url_capa} 
                            alt={`Capa ${estudo.nome_estudo}`}
                            fill
                            sizes="200px"
                            className="object-cover opacity-90"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <form action={async () => { "use server"; await excluirEstudo(estudo.id); }} className="w-full">
                        <Button type="submit" variant="destructive" size="sm" className="w-full gap-2 text-xs font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 shadow-sm" title="Excluir Estudo Inteiro">
                          <Trash2 className="w-4 h-4" /> Excluir Livro
                        </Button>
                      </form>
                    </div>
                    
                    {/* DETALHES E LIÇÕES */}
                    <div className="p-4 flex-1 flex flex-col">
                      
                      {/* ACORDEÃO DE EDIÇÃO DO LIVRO */}
                      <details className="group/editestudo [&_summary::-webkit-details-marker]:hidden mb-4">
                        <summary className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary cursor-pointer list-none bg-muted/30 px-3 py-1.5 rounded-md border border-border/50 transition-colors w-fit">
                          <Pencil className="w-3.5 h-3.5" /> Editar Informações do Livro
                        </summary>
                        
                        <div className="pt-3 pb-2">
                          <form action={editarEstudo} className="space-y-3 p-4 bg-background border border-primary/20 rounded-xl shadow-sm">
                            <input type="hidden" name="id" value={estudo.id} />
                            <input type="hidden" name="capa_atual" value={estudo.url_capa || ""} />
                            
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nome do Estudo</Label>
                              <Input name="nome_estudo" defaultValue={estudo.nome_estudo} required className="h-8 text-xs bg-muted/30" />
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nova Capa</Label>
                              <Input name="capa" type="file" accept="image/*" className="h-8 text-xs bg-muted/30 cursor-pointer file:text-primary file:font-bold file:mr-2 file:bg-transparent file:border-0" />
                            </div>

                            {estudo.url_capa && (
                              <div className="flex items-center gap-2 mt-2 bg-destructive/10 border border-destructive/20 w-fit px-3 py-1.5 rounded-md">
                                <input type="checkbox" id={`remover_capa_${estudo.id}`} name="remover_capa" value="true" className="w-3.5 h-3.5 accent-destructive cursor-pointer" />
                                <Label htmlFor={`remover_capa_${estudo.id}`} className="text-[10px] uppercase font-bold text-destructive cursor-pointer">
                                  Apagar capa atual
                                </Label>
                              </div>
                            )}

                            <Button type="submit" size="sm" className="h-8 text-xs font-bold w-full mt-2 shadow-sm">Salvar Alterações</Button>
                          </form>
                        </div>
                      </details>

                      {/* LISTA DE LIÇÕES ATUAIS */}
                      <div className="bg-muted/10 rounded-xl border border-border/50 p-1 mb-4 flex-1 max-h-64 overflow-y-auto shadow-inner">
                        <div className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10 px-3 py-2 flex justify-between items-center border-b border-border/50 rounded-t-lg">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Lições Cadastradas</span>
                        </div>
                        
                        <div className="p-2">
                          {estudo.licoes.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma lição adicionada ainda.</p>
                          ) : (
                            <ul className="space-y-1">
                              {estudo.licoes.map((licao: any) => (
                                <li key={licao.id} className="relative group/licao">
                                  
                                  <details className="[&_summary::-webkit-details-marker]:hidden w-full">
                                    <summary className="flex items-center justify-between text-sm p-2 hover:bg-card rounded-lg cursor-pointer list-none transition-colors border border-transparent hover:border-border/50">
                                      <span className="font-medium text-foreground/90"><span className="font-black text-primary mr-2">#{licao.numero_licao}</span> {licao.titulo_licao}</span>
                                      
                                      <div className="flex gap-2 opacity-0 group-hover/licao:opacity-100 transition-opacity items-center">
                                        <Pencil className="w-3.5 h-3.5 text-primary" />
                                        <form action={async () => { "use server"; await excluirLicao(licao.id); }}>
                                          <button type="submit" className="text-muted-foreground hover:text-destructive hover:scale-110 transition-transform">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </form>
                                      </div>
                                    </summary>
                                    
                                    {/* FORMULÁRIO DE EDIÇÃO DA LIÇÃO */}
                                    <div className="p-3 my-1 border border-primary/20 bg-primary/5 rounded-xl shadow-sm">
                                      <form action={editarLicao} className="flex gap-2 items-end">
                                        <input type="hidden" name="id" value={licao.id} />
                                        <div className="w-16">
                                          <Label className="text-[10px] font-bold uppercase text-primary">Nº</Label>
                                          <Input name="numero_licao" type="number" defaultValue={licao.numero_licao} required className="h-8 text-xs bg-background" />
                                        </div>
                                        <div className="flex-1">
                                          <Label className="text-[10px] font-bold uppercase text-primary">Título</Label>
                                          <Input name="titulo_licao" defaultValue={licao.titulo_licao} required className="h-8 text-xs bg-background" />
                                        </div>
                                        <Button type="submit" size="sm" className="h-8 px-3 text-xs font-bold">Salvar</Button>
                                      </form>
                                    </div>
                                  </details>
                                  
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* FORMULÁRIO PARA ADICIONAR NOVA LIÇÃO */}
                      <form action={adicionarLicao} className="flex gap-3 items-end bg-background p-4 rounded-xl border border-primary/20 shadow-sm">
                        <input type="hidden" name="estudo_biblico_id" value={estudo.id} />
                        
                        <div className="w-20">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Nº Lição</Label>
                          <Input 
                            name="numero_licao" 
                            type="number" 
                            min="1" 
                            required 
                            placeholder="Ex: 1" 
                            className="h-9 text-sm bg-muted/20" 
                            defaultValue={estudo.licoes.length + 1}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Título da Lição</Label>
                          <Input 
                            name="titulo_licao" 
                            type="text" 
                            required 
                            placeholder="Ex: A Bíblia e Você" 
                            className="h-9 text-sm bg-muted/20" 
                          />
                        </div>
                        
                        <Button type="submit" size="sm" className="h-9 px-4 font-bold shadow-sm" title="Adicionar Lição">
                          <Plus className="w-4 h-4 mr-1" /> Adicionar
                        </Button>
                      </form>

                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}