import { createClient } from "@/utils/supabase/server";
import { 
  criarEstudo, excluirEstudo, editarEstudo, 
  adicionarLicao, excluirLicao, editarLicao 
} from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Trash2, Plus, Image as ImageIcon, Layers, BookText, Pencil, ArrowLeft } from "lucide-react";
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
          <Card className="border-primary/20 bg-card/50 backdrop-blur-md sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Novo Estudo Bíblico</CardTitle>
              <CardDescription>Cadastre a capa e o título do material.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Sem encType para evitar os avisos do React 19 */}
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

        {/* COLUNA DIREITA: Lista de Estudos e Gestão de Lições */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Materiais Cadastrados ({estudos?.length || 0})</h2>
          
          {estudos?.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/10">
              <Layers className="w-10 h-10 mb-2 opacity-20" />
              <p>Nenhum estudo bíblico cadastrado.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {estudos?.map((estudo) => (
                <Card key={estudo.id} className="overflow-hidden border-border/50 bg-card/30">
                  <div className="flex flex-col sm:flex-row">
                    
                    {/* IMAGEM DO ESTUDO */}
                    <div className="w-full sm:w-48 h-48 bg-muted relative flex-shrink-0 flex items-center justify-center border-r border-border/50">
                      {estudo.url_capa ? (
                        <Image 
                          src={estudo.url_capa} 
                          alt={`Capa ${estudo.nome_estudo}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 200px"
                          className="object-cover opacity-90"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>
                    
                    {/* DETALHES E LIÇÕES */}
                    <div className="p-4 flex-1 flex flex-col">
                      
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                          <BookText className="w-5 h-5" />
                          {estudo.nome_estudo}
                        </h3>
                        <form action={async () => { "use server"; await excluirEstudo(estudo.id); }}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Excluir Estudo Inteiro">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>

                      {/* ACORDEÃO DE EDIÇÃO DO LIVRO */}
                      <details className="group/editestudo [&_summary::-webkit-details-marker]:hidden mb-4">
                        <summary className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary cursor-pointer list-none bg-muted/30 px-2.5 py-1 rounded-md border border-border/50 transition-colors">
                          <Pencil className="w-3 h-3" /> Editar Material
                        </summary>
                        
                        <div className="pt-3 pb-2">
                          <form action={editarEstudo} className="space-y-3 p-3 bg-background border border-primary/20 rounded-md shadow-inner">
                            <input type="hidden" name="id" value={estudo.id} />
                            <input type="hidden" name="capa_atual" value={estudo.url_capa || ""} />
                            
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nome do Estudo</Label>
                              <Input name="nome_estudo" defaultValue={estudo.nome_estudo} required className="h-8 text-xs bg-muted/30" />
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nova Capa</Label>
                              <Input name="capa" type="file" accept="image/*" className="h-8 text-xs bg-muted/30" />
                            </div>

                            {estudo.url_capa && (
                              <div className="flex items-center gap-2 mt-2 bg-destructive/10 border border-destructive/20 w-fit px-3 py-1.5 rounded-md">
                                <input type="checkbox" id={`remover_capa_${estudo.id}`} name="remover_capa" value="true" className="w-3.5 h-3.5 accent-destructive cursor-pointer" />
                                <Label htmlFor={`remover_capa_${estudo.id}`} className="text-[10px] uppercase font-bold text-destructive cursor-pointer">
                                  Apagar capa atual
                                </Label>
                              </div>
                            )}

                            <Button type="submit" size="sm" className="h-8 text-xs font-bold w-full mt-2">Salvar Alterações</Button>
                          </form>
                        </div>
                      </details>

                      {/* LISTA DE LIÇÕES ATUAIS */}
                      <div className="bg-background/50 rounded-md border border-border/50 p-3 mb-4 flex-1 h-32 overflow-y-auto">
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-2 flex justify-between border-b border-border/50 pb-1">
                          <span>Lições Cadastradas</span>
                          <span>{estudo.licoes.length}</span>
                        </p>
                        
                        {estudo.licoes.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic mt-2">Nenhuma lição adicionada ainda.</p>
                        ) : (
                          <ul className="space-y-1">
                            {estudo.licoes.map((licao: any) => (
                              <li key={licao.id} className="relative group/licao border-b border-border/30 last:border-0">
                                
                                <details className="[&_summary::-webkit-details-marker]:hidden w-full">
                                  <summary className="flex items-center justify-between text-sm p-1.5 hover:bg-card rounded-md cursor-pointer list-none transition-colors">
                                    <span><span className="font-bold text-primary mr-2">#{licao.numero_licao}</span> {licao.titulo_licao}</span>
                                    
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
                                  <div className="p-2 mb-2 border border-primary/20 bg-primary/5 rounded-md shadow-sm">
                                    <form action={editarLicao} className="flex gap-2 items-end">
                                      <input type="hidden" name="id" value={licao.id} />
                                      <div className="w-16">
                                        <Label className="text-[10px] font-bold">Nº</Label>
                                        <Input name="numero_licao" type="number" defaultValue={licao.numero_licao} required className="h-7 text-xs bg-background" />
                                      </div>
                                      <div className="flex-1">
                                        <Label className="text-[10px] font-bold">Título</Label>
                                        <Input name="titulo_licao" defaultValue={licao.titulo_licao} required className="h-7 text-xs bg-background" />
                                      </div>
                                      <Button type="submit" size="sm" className="h-7 text-xs font-bold">Salvar</Button>
                                    </form>
                                  </div>
                                </details>
                                
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* FORMULÁRIO PARA ADICIONAR NOVA LIÇÃO */}
                      <form action={adicionarLicao} className="flex gap-2 items-end bg-muted/20 p-2 rounded-md border border-border/50">
                        <input type="hidden" name="estudo_biblico_id" value={estudo.id} />
                        
                        <div className="w-20">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Nº Lição</Label>
                          <Input 
                            name="numero_licao" 
                            type="number" 
                            min="1" 
                            required 
                            placeholder="Ex: 1" 
                            className="h-8 text-sm bg-background" 
                            defaultValue={estudo.licoes.length + 1} // Sugere o próximo número
                          />
                        </div>
                        
                        <div className="flex-1">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Título da Lição</Label>
                          <Input 
                            name="titulo_licao" 
                            type="text" 
                            required 
                            placeholder="Ex: A Bíblia e Você" 
                            className="h-8 text-sm bg-background" 
                          />
                        </div>
                        
                        <Button type="submit" size="sm" className="h-8 px-3" title="Adicionar Lição">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </form>

                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}