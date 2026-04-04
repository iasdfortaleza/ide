import { createClient } from "@/utils/supabase/server";
import { lancarEstudo, lancarVisita, excluirLancamentoEstudo, excluirVisita } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, BookHeart, Users, Send, Clock, Trash2, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Tipagem para aceitar os parâmetros da URL no Next.js
export default async function LancamentosPage(props: { searchParams?: Promise<{ pelotao?: string }> | { pelotao?: string } }) {
  const supabase = await createClient();

  // Resolve os searchParams (compatível com Next.js 14 e 15)
  const searchParams = await Promise.resolve(props.searchParams || {});
  const selectedPelotaoId = searchParams.pelotao;

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

  // 2. Buscar Pelotões do usuário (Para o Select do filtro e validações)
  let pelotoesQuery = supabase.from("pelotoes").select("id, nome").order("nome");
  if (!isMaster) {
    pelotoesQuery = pelotoesQuery.eq("capitao_id", user?.id);
  }
  const { data: pelotoes } = await pelotoesQuery;

  // 3. Buscar Duplas com seus Estudantes (Com lógica de Filtro)
  let duplasQuery = supabase
    .from("duplas")
    .select(`
      id, nome_dupla,
      pelotao:pelotoes(nome),
      estudantes(id, nome_pessoa, estudo_biblico_id, status)
    `)
    .order("nome_dupla");

  if (isMaster && selectedPelotaoId) {
    // Se for Master e escolheu um pelotão no filtro
    duplasQuery = duplasQuery.eq("pelotao_id", selectedPelotaoId);
  } else if (!isMaster) {
    // Se for Admin, trava para ver APENAS os pelotões dele
    const pelotoesIds = pelotoes?.map(p => p.id) || [];
    if (pelotoesIds.length > 0) {
      duplasQuery = duplasQuery.in("pelotao_id", pelotoesIds);
    } else {
      // Se o admin não tem nenhum pelotão, não exibe nenhuma dupla
      duplasQuery = duplasQuery.in("pelotao_id", ['00000000-0000-0000-0000-000000000000']);
    }
  }

  const { data: duplas } = await duplasQuery;

  // 4. Buscar Estudos e Lições (para popular os selects dinamicamente)
  const { data: estudosComLicoes } = await supabase
    .from("estudos_biblicos")
    .select("id, licoes(id, numero_licao, titulo_licao)");

  // 5. Buscar Histórico Recente (Agora puxando também o Pelotão)
  const hoje = new Date().toISOString().split('T')[0];
  
  const { data: historicoEstudos } = await supabase
    .from("progresso_estudo")
    .select("id, data_registro, estudante:estudantes(nome_pessoa, dupla:duplas(nome_dupla, pelotao:pelotoes(nome))), licao:licoes(numero_licao, titulo_licao)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: historicoVisitas } = await supabase
    .from("visitas")
    .select("id, nome_visitado, data_visita, dupla:duplas(nome_dupla, pelotao:pelotoes(nome))")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho com Botão de Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Rotina Missionária</h1>
            <p className="text-sm text-muted-foreground">Lançamentos da Semana</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      {/* FILTRO EXCLUSIVO PARA O MASTER */}
      {isMaster && (
        <Card className="bg-card/50 border-primary/20 backdrop-blur-md">
          <CardContent className="p-4">
            <form method="GET" className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full space-y-1">
                <Label htmlFor="pelotao" className="text-muted-foreground flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtrar por Pelotão
                </Label>
                <select 
                  name="pelotao" 
                  id="pelotao"
                  defaultValue={selectedPelotaoId || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Visão Global (Todos os Pelotões)</option>
                  {pelotoes?.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="default" className="w-full sm:w-auto font-bold shadow-md">
                Aplicar Filtro
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA PRINCIPAL: Lançamentos por Dupla */}
        <div className="lg:col-span-2 space-y-6">
          {!duplas || duplas.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground bg-card/10">
              <p>Nenhuma dupla encontrada para realizar lançamentos.</p>
            </div>
          ) : (
            duplas.map((dupla) => {
              // Correção TypeScript: Extraindo o objeto único
              const pelotaoObj = Array.isArray(dupla.pelotao) ? dupla.pelotao[0] : dupla.pelotao;
              const nomeDoPelotao = pelotaoObj?.nome || "Sem pelotão";

              return (
                <Card key={dupla.id} className="border-primary/20 bg-card/50 backdrop-blur-md overflow-hidden">
                  <div className="bg-muted/30 p-3 border-b border-border/50 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> {dupla.nome_dupla}
                    </h2>
                    <span className="text-xs bg-background px-2 py-1 rounded-md text-muted-foreground border border-border/50 font-medium">
                      {nomeDoPelotao}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    
                    {/* SEÇÃO DE ESTUDOS */}
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-bold uppercase text-primary flex items-center gap-2">
                        <BookHeart className="w-4 h-4" /> Marcar Estudos
                      </h3>
                      
                      {(!dupla.estudantes || dupla.estudantes.length === 0) ? (
                        <p className="text-xs text-muted-foreground italic">Nenhum estudante cadastrado nesta dupla.</p>
                      ) : (
                        <div className="space-y-3">
                          {dupla.estudantes.filter((e: any) => e.status === 'ativo').map((estudante: any) => {
                            
                            const licoesDoLivro = estudosComLicoes?.find(est => est.id === estudante.estudo_biblico_id)?.licoes || [];
                            licoesDoLivro.sort((a: any, b: any) => a.numero_licao - b.numero_licao);

                            return (
                              <form action={lancarEstudo} key={estudante.id} className="p-3 bg-background/50 rounded-lg border border-border/50 space-y-2 relative group">
                                <input type="hidden" name="estudante_id" value={estudante.id} />
                                
                                <p className="font-semibold text-sm">{estudante.nome_pessoa}</p>
                                
                                {licoesDoLivro.length === 0 ? (
                                  <p className="text-[10px] text-destructive">Estudante sem material vinculado.</p>
                                ) : (
                                  <>
                                    <div className="flex gap-2">
                                      <select name="licao_id" required defaultValue="" className="flex-1 h-8 rounded-md border border-input bg-background px-2 py-1 text-xs">
                                        <option value="" disabled>Qual lição?</option>
                                        {licoesDoLivro.map((licao: any) => (
                                          <option key={licao.id} value={licao.id}>Lição {licao.numero_licao}: {licao.titulo_licao}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <Input name="data_registro" type="date" defaultValue={hoje} className="h-8 text-xs flex-1" />
                                      <Button type="submit" size="sm" className="h-8 shadow-sm gap-1">
                                        Lançar <Send className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </form>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SEÇÃO DE VISITAS */}
                    <div className="p-4 space-y-4 bg-muted/5">
                      <h3 className="text-sm font-bold uppercase text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" /> Registrar Visita
                      </h3>
                      
                      <form action={lancarVisita} className="space-y-3">
                        <input type="hidden" name="dupla_id" value={dupla.id} />
                        
                        <div>
                          <Label className="text-xs">Nome do Visitado</Label>
                          <Input name="nome_visitado" placeholder="Ex: Família Silva" required className="h-8 text-sm bg-background" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">WhatsApp (Opcional)</Label>
                            <Input name="whatsapp" placeholder="(00) 00000-0000" className="h-8 text-xs bg-background" />
                          </div>
                          <div>
                            <Label className="text-xs">Data da Visita</Label>
                            <Input name="data_visita" type="date" defaultValue={hoje} required className="h-8 text-xs bg-background" />
                          </div>
                        </div>
                        
                        <Button type="submit" variant="secondary" className="w-full h-8 text-xs font-bold border border-border/50 shadow-sm hover:bg-secondary/80">
                          Gravar Visita
                        </Button>
                      </form>
                    </div>

                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* COLUNA LATERAL: Histórico Recente */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 bg-card/30 sticky top-24">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Lançamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              
              <div className="p-4 space-y-6">
                
                {/* Lista Estudos Recentes */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 border-b border-border/50 pb-1">Últimos Estudos</h4>
                  <ul className="space-y-2">
                    {historicoEstudos?.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhum estudo recente.</p>}
                    {historicoEstudos?.map((hist: any) => {
                      // Correção TypeScript e navegação nos dados
                      const estObj = Array.isArray(hist.estudante) ? hist.estudante[0] : hist.estudante;
                      const licObj = Array.isArray(hist.licao) ? hist.licao[0] : hist.licao;
                      const dupObj = Array.isArray(estObj?.dupla) ? estObj?.dupla[0] : estObj?.dupla;
                      const pelObj = Array.isArray(dupObj?.pelotao) ? dupObj?.pelotao[0] : dupObj?.pelotao;

                      const nomeDupla = dupObj?.nome_dupla || "Sem Dupla";
                      const nomePelotao = pelObj?.nome || "Sem Pelotão";

                      return (
                        <li key={hist.id} className="text-xs bg-background p-3 rounded-md border border-border/50 flex justify-between items-start group">
                          <div className="space-y-1">
                            <p className="font-semibold text-primary text-sm">{estObj?.nome_pessoa || "Desconhecido"}</p>
                            <p className="text-[10px] text-foreground/80 font-medium">{nomeDupla} • {nomePelotao}</p>
                            <p className="text-[10px] text-muted-foreground">Lição {licObj?.numero_licao} • {new Date(hist.data_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                          </div>
                          <form action={async () => { "use server"; await excluirLancamentoEstudo(hist.id); }}>
                            <button type="submit" title="Excluir lançamento errado" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Lista Visitas Recentes */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 border-b border-border/50 pb-1">Últimas Visitas</h4>
                  <ul className="space-y-2">
                    {historicoVisitas?.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma visita recente.</p>}
                    {historicoVisitas?.map((hist: any) => {
                      // Correção TypeScript e navegação nos dados
                      const dupObj = Array.isArray(hist.dupla) ? hist.dupla[0] : hist.dupla;
                      const pelObj = Array.isArray(dupObj?.pelotao) ? dupObj?.pelotao[0] : dupObj?.pelotao;

                      const nomeDupla = dupObj?.nome_dupla || "Sem Dupla";
                      const nomePelotao = pelObj?.nome || "Sem Pelotão";

                      return (
                        <li key={hist.id} className="text-xs bg-background p-3 rounded-md border border-border/50 flex justify-between items-start group">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">{hist.nome_visitado}</p>
                            <p className="text-[10px] text-foreground/80 font-medium">{nomeDupla} • {nomePelotao}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(hist.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                          </div>
                          <form action={async () => { "use server"; await excluirVisita(hist.id); }}>
                            <button type="submit" title="Excluir lançamento errado" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}