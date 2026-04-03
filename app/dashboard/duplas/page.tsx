import { createClient } from "@/utils/supabase/server";
import { 
  criarDupla, excluirDupla, 
  adicionarMembro, excluirMembro, 
  adicionarEstudante, excluirEstudante 
} from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Trash2, Plus, Image as ImageIcon, Shield, UserPlus, BookOpen } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function DuplasPage() {
  const supabase = await createClient();

  // 1. Verificação de Segurança (Master ou Admin)
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userPerfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (userPerfil?.role === "padrao" || !userPerfil) {
    redirect("/dashboard");
  }

  const isMaster = userPerfil.role === "master";

  // 2. Buscar os Pelotões (Master vê todos, Admin vê apenas o dele)
  let pelotoesQuery = supabase.from("pelotoes").select("id, nome");
  if (!isMaster) {
    pelotoesQuery = pelotoesQuery.eq("capitao_id", user?.id);
  }
  const { data: pelotoes } = await pelotoesQuery;

  const pelotoesIds = pelotoes?.map(p => p.id) || [];

  // 3. Buscar os Materiais de Estudo (Para o select de estudantes)
  const { data: estudos } = await supabase
    .from("estudos_biblicos")
    .select("id, nome_estudo");

  // 4. Buscar as Duplas (filtradas pelos pelotões permitidos)
  let duplas: any[] = [];
  if (pelotoesIds.length > 0) {
    const { data } = await supabase
      .from("duplas")
      .select(`
        *,
        pelotao:pelotoes(nome),
        membros:membros_dupla(*),
        estudantes(*, estudo:estudos_biblicos(nome_estudo))
      `)
      .in("pelotao_id", pelotoesIds)
      .order("created_at", { ascending: false });
    
    duplas = data || [];
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Duplas Missionárias</h1>
          <p className="text-sm text-muted-foreground">
            {isMaster ? "Visão Global (Master)" : "Visão do Capitão (Admin)"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulário para Criar Dupla */}
        <div className="lg:col-span-1">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-md sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Nova Dupla</CardTitle>
              <CardDescription>Crie a base da dupla para depois adicionar os membros.</CardDescription>
            </CardHeader>
            <CardContent>
              {pelotoesIds.length === 0 ? (
                <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                  Você precisa de um Pelotão para cadastrar duplas. Se você é Admin, peça ao Master para te vincular a um Pelotão.
                </div>
              ) : (
                <form action={criarDupla} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_dupla">Nome da Dupla</Label>
                    <Input id="nome_dupla" name="nome_dupla" placeholder="Ex: Dupla Fé e Ação" required className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pelotao_id">Vincular ao Pelotão</Label>
                    <select 
                      id="pelotao_id" 
                      name="pelotao_id" 
                      required
                      defaultValue="" 
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="" disabled>Selecione...</option>
                      {pelotoes?.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foto">Foto da Dupla (Opcional)</Label>
                    <Input 
                      id="foto" 
                      name="foto" 
                      type="file" 
                      accept="image/*" 
                      className="cursor-pointer file:text-primary file:font-bold file:mr-4 file:border-0 file:bg-primary/10 file:rounded-md file:px-2 file:py-1 hover:file:bg-primary/20"
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4 font-bold shadow-md hover:shadow-primary/25">
                    Criar Dupla
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Lista de Duplas e Gestão de Membros/Estudantes */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Duplas Ativas ({duplas.length})</h2>
          
          {duplas.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/10">
              <Users className="w-10 h-10 mb-2 opacity-20" />
              <p>Nenhuma dupla encontrada no seu pelotão.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {duplas.map((dupla) => (
                <Card key={dupla.id} className="overflow-hidden border-border/50 bg-card/30">
                  
                  {/* Cabeçalho do Card da Dupla */}
                  <div className="flex items-center p-4 border-b border-border/50 bg-muted/20 justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-background relative flex items-center justify-center overflow-hidden border-2 border-primary/20 shrink-0">
                        {dupla.url_foto_dupla ? (
                          <Image src={dupla.url_foto_dupla} alt={dupla.nome_dupla} fill className="object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{dupla.nome_dupla}</h3>
                        <p className="text-sm text-primary font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3" /> {dupla.pelotao?.nome}
                        </p>
                      </div>
                    </div>
                    
                    <form action={async () => { "use server"; await excluirDupla(dupla.id); }}>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Excluir Dupla">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Corpo do Card: Dividido em Membros e Estudantes */}
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    
                    {/* LADO A: MEMBROS DA DUPLA */}
                    <div className="p-4 flex flex-col">
                      <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Componentes ({dupla.membros?.length})
                      </h4>
                      
                      <ul className="space-y-2 mb-4 flex-1">
                        {dupla.membros?.map((membro: any) => (
                          <li key={membro.id} className="text-sm p-2 bg-background/50 rounded-md border border-border/50 flex justify-between items-start group">
                            <div>
                              <p className="font-semibold">{membro.nome}</p>
                              <p className="text-[10px] text-muted-foreground">Whats: {membro.whatsapp || "Não informado"}</p>
                            </div>
                            <form action={async () => { "use server"; await excluirMembro(membro.id); }}>
                              <button type="submit" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>

                      {/* Form Add Membro */}
                      <form action={adicionarMembro} className="space-y-2 mt-auto p-3 bg-muted/10 rounded-md border border-dashed border-border/50">
                        <input type="hidden" name="dupla_id" value={dupla.id} />
                        <Input name="nome" placeholder="Nome do membro" required className="h-8 text-xs bg-background" />
                        <div className="flex gap-2">
                          <Input name="whatsapp" placeholder="WhatsApp" className="h-8 text-xs bg-background flex-1" />
                          <Button type="submit" size="sm" className="h-8 px-3"><Plus className="w-4 h-4" /></Button>
                        </div>
                      </form>
                    </div>

                    {/* LADO B: ESTUDANTES (PESSOAS RECEBENDO ESTUDO) */}
                    <div className="p-4 flex flex-col">
                      <h4 className="text-sm font-bold uppercase text-primary mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Estudantes ({dupla.estudantes?.length})
                      </h4>
                      
                      <ul className="space-y-2 mb-4 flex-1">
                        {dupla.estudantes?.map((estudante: any) => (
                          <li key={estudante.id} className="text-sm p-2 bg-primary/5 rounded-md border border-primary/20 flex justify-between items-start group">
                            <div>
                              <p className="font-semibold">{estudante.nome_pessoa}</p>
                              <p className="text-[10px] text-primary italic font-medium">
                                Livro: {estudante.estudo?.nome_estudo || "Sem material"}
                              </p>
                            </div>
                            <form action={async () => { "use server"; await excluirEstudante(estudante.id); }}>
                              <button type="submit" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>

                      {/* Form Add Estudante */}
                      <form action={adicionarEstudante} className="space-y-2 mt-auto p-3 bg-primary/5 rounded-md border border-dashed border-primary/20">
                        <input type="hidden" name="dupla_id" value={dupla.id} />
                        <Input name="nome_pessoa" placeholder="Nome do estudante/casa" required className="h-8 text-xs bg-background" />
                        <div className="flex gap-2">
                          <select name="estudo_biblico_id" required defaultValue="" className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-2 focus:ring-primary">
                            <option value="" disabled>Escolha o livro...</option>
                            {estudos?.map(estudo => (
                              <option key={estudo.id} value={estudo.id}>{estudo.nome_estudo}</option>
                            ))}
                          </select>
                          <Button type="submit" size="sm" className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4" /></Button>
                        </div>
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