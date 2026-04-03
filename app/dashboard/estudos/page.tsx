import { createClient } from "@/utils/supabase/server";
import { criarEstudo, excluirEstudo, adicionarLicao, excluirLicao } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Trash2, Plus, Image as ImageIcon, Layers, BookText } from "lucide-react";
import Image from "next/image";
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
      
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Materiais de Estudo</h1>
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
                    
                    {/* Imagem do Estudo */}
                    <div className="w-full sm:w-48 h-48 bg-muted relative flex-shrink-0 flex items-center justify-center border-r border-border/50">
                      {estudo.url_capa ? (
                        <Image 
                          src={estudo.url_capa} 
                          alt={`Capa ${estudo.nome_estudo}`}
                          fill
                          className="object-cover opacity-90"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>
                    
                    {/* Detalhes e Lições */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                          <BookText className="w-5 h-5" />
                          {estudo.nome_estudo}
                        </h3>
                        <form action={async () => {
                          "use server";
                          await excluirEstudo(estudo.id);
                        }}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Excluir Estudo Inteiro">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>

                      {/* Lista de Lições Atuais */}
                      <div className="bg-background/50 rounded-md border border-border/50 p-3 mb-4 flex-1 h-32 overflow-y-auto">
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-2 flex justify-between">
                          <span>Lições Cadastradas</span>
                          <span>{estudo.licoes.length}</span>
                        </p>
                        
                        {estudo.licoes.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">Nenhuma lição adicionada ainda.</p>
                        ) : (
                          <ul className="space-y-1">
                            {estudo.licoes.map((licao: any) => (
                              <li key={licao.id} className="flex items-center justify-between text-sm p-1.5 hover:bg-card rounded-md border border-transparent hover:border-border/50 group transition-colors">
                                <span><span className="font-bold text-primary mr-2">#{licao.numero_licao}</span> {licao.titulo_licao}</span>
                                <form action={async () => {
                                  "use server";
                                  await excluirLicao(licao.id);
                                }}>
                                  <button type="submit" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Formulário para Adicionar Nova Lição */}
                      <form action={adicionarLicao} className="flex gap-2 items-end">
                        <input type="hidden" name="estudo_biblico_id" value={estudo.id} />
                        
                        <div className="w-20">
                          <Label className="text-xs mb-1 block">Nº Lição</Label>
                          <Input 
                            name="numero_licao" 
                            type="number" 
                            min="1" 
                            required 
                            placeholder="Ex: 1" 
                            className="h-8 text-sm bg-background/50" 
                            defaultValue={estudo.licoes.length + 1} // Sugere o próximo número
                          />
                        </div>
                        
                        <div className="flex-1">
                          <Label className="text-xs mb-1 block">Título da Lição</Label>
                          <Input 
                            name="titulo_licao" 
                            type="text" 
                            required 
                            placeholder="Ex: A Bíblia e Você" 
                            className="h-8 text-sm bg-background/50" 
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