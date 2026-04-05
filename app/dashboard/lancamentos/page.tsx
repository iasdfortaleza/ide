import { createClient } from "@/utils/supabase/server";
import { lancarEstudo, lancarVisita, excluirVisita, excluirLancamentoEstudo } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, BookHeart, Users, Send, Clock, Filter, ArrowLeft, ChevronDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Tipagem para aceitar os parâmetros da URL no Next.js
export default async function LancamentosPage(props: { searchParams?: Promise<{ pelotao?: string }> | { pelotao?: string } }) {
  const supabase = await createClient();

  // Resolve os searchParams
  const searchParams = await Promise.resolve(props.searchParams || {});
  const selectedPelotaoId = searchParams.pelotao;

  // 1. Verificação de Segurança
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

  // 2. Buscar Pelotões
  let pelotoesQuery = supabase.from("pelotoes").select("id, nome").order("nome");
  if (!isMaster) {
    pelotoesQuery = pelotoesQuery.eq("capitao_id", user?.id);
  }
  const { data: pelotoes } = await pelotoesQuery;

  // 3. Buscar Duplas com seus Estudantes e as Últimas 3 Visitas de cada dupla
  let duplasQuery = supabase
    .from("duplas")
    .select(`
      id, nome_dupla,
      pelotao:pelotoes(nome),
      estudantes(id, nome_pessoa, estudo_biblico_id, status),
      visitas!dupla_id(id, nome_visitado, data_visita, whatsapp)
    `)
    .order("nome_dupla");

  if (isMaster && selectedPelotaoId) {
    duplasQuery = duplasQuery.eq("pelotao_id", selectedPelotaoId);
  } else if (!isMaster) {
    const pelotoesIds = pelotoes?.map(p => p.id) || [];
    if (pelotoesIds.length > 0) {
      duplasQuery = duplasQuery.in("pelotao_id", pelotoesIds);
    } else {
      duplasQuery = duplasQuery.in("pelotao_id", ['00000000-0000-0000-0000-000000000000']);
    }
  }

  const { data: duplas } = await duplasQuery;

  // 4. Buscar todo o histórico dos estudantes filtrados para encontrar a "Lição Anterior"
  const estudantesIds = duplas?.flatMap(d => d.estudantes.map((e: any) => e.id)) || [];
  
  const { data: progressoTotal } = await supabase
    .from("progresso_estudo")
    .select("estudante_id, data_registro, licao:licoes(numero_licao, titulo_licao)")
    .in("estudante_id", estudantesIds.length > 0 ? estudantesIds : ['00000000-0000-0000-0000-000000000000'])
    .order("data_registro", { ascending: false });

  // 5. Buscar Estudos e Lições
  const { data: estudosComLicoes } = await supabase
    .from("estudos_biblicos")
    .select("id, licoes(id, numero_licao, titulo_licao)");

  const hoje = new Date().toISOString().split('T')[0];

  return (
    // Ampliado horizontalmente (w-full max-w-7xl) para ocupar bem a tela
    <div className="p-6 w-full max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
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

      {/* FILTRO MASTER */}
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

      {/* COLUNA ÚNICA: Lançamentos por Dupla */}
      <div className="space-y-4">
        {!duplas || duplas.length === 0 ? (
          <div className="p-10 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground bg-card/10">
            <p>Nenhuma dupla encontrada para realizar lançamentos.</p>
          </div>
        ) : (
          duplas.map((dupla) => {
            const pelotaoObj = Array.isArray(dupla.pelotao) ? dupla.pelotao[0] : dupla.pelotao;
            const nomeDoPelotao = pelotaoObj?.nome || "Sem pelotão";

            // Pega apenas as 3 visitas mais recentes da dupla
            const ultimasVisitas = dupla.visitas 
              ? [...dupla.visitas].sort((a: any, b: any) => new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime()).slice(0, 3)
              : [];

            return (
              <details key={dupla.id} className="group border border-primary/20 bg-card/50 backdrop-blur-md rounded-xl overflow-hidden shadow-sm [&_summary::-webkit-details-marker]:hidden">
                
                {/* Cabeçalho Ajustado */}
                <summary className="bg-muted/20 px-6 py-3 md:py-4 border-b border-border/50 flex justify-between items-center cursor-pointer list-none hover:bg-muted/40 transition-all">
                  <h2 className="font-bold text-lg md:text-xl text-foreground flex items-center gap-3">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" /> {dupla.nome_dupla}
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-xs md:text-sm bg-background px-3 py-1 rounded-md text-muted-foreground border border-border/50 font-medium">
                      {nomeDoPelotao}
                    </span>
                    <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-300" />
                  </div>
                </summary>

                {/* CONTEÚDO ABERTO */}
                <div className="flex flex-col divide-y divide-border/50">
                  
                  {/* SEÇÃO DE ESTUDOS */}
                  <div className="p-6 space-y-5 bg-white">
                    <h3 className="text-base font-bold uppercase text-primary flex items-center gap-2 mb-2 border-b border-black/10 pb-2">
                      <BookHeart className="w-5 h-5" /> Marcar Estudos
                    </h3>
                    
                    {(!dupla.estudantes || dupla.estudantes.length === 0) ? (
                      <p className="text-sm text-black/60 italic">Nenhum estudante cadastrado nesta dupla.</p>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {dupla.estudantes.filter((e: any) => e.status === 'ativo').map((estudante: any, index: number) => {
                          
                          const licoesDoLivro = estudosComLicoes?.find(est => est.id === estudante.estudo_biblico_id)?.licoes || [];
                          licoesDoLivro.sort((a: any, b: any) => a.numero_licao - b.numero_licao);

                          const ultimoProgresso = progressoTotal?.find(p => p.estudante_id === estudante.id);
                          const licAnteriorObj = ultimoProgresso ? (Array.isArray(ultimoProgresso.licao) ? ultimoProgresso.licao[0] : ultimoProgresso.licao) : null;

                          // Cores escuras para os cartões constrastarem com o bg-white
                          const isPar = index % 2 === 0;
                          const bgContainer = isPar ? "bg-[#11161d]" : "bg-[#1a212c]";
                          const borderContainer = "border-primary/20";

                          return (
                            <form action={lancarEstudo} key={estudante.id} className={`p-4 rounded-xl border ${borderContainer} space-y-3 relative group ${bgContainer} text-white shadow-lg`}>
                              <input type="hidden" name="estudante_id" value={estudante.id} />
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-2">
                                <p className="font-black text-sm md:text-base uppercase tracking-wider">{estudante.nome_pessoa}</p>
                                
                                {ultimoProgresso && licAnteriorObj ? (
                                  <div className="text-[10px] text-white/80 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-white/10 w-fit">
                                    <Clock className="w-3 h-3 text-primary" /> 
                                    <span className="font-medium text-white/50">Anterior:</span> Lição {licAnteriorObj.numero_licao} ({new Date(ultimoProgresso.data_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' })})
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-white/50 flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded border border-white/5 w-fit italic">
                                    <Clock className="w-3 h-3 opacity-50" /> Nenhuma lição anterior.
                                  </div>
                                )}
                              </div>
                              
                              {licoesDoLivro.length === 0 ? (
                                <p className="text-xs text-red-400 font-semibold">Estudante sem material vinculado.</p>
                              ) : (
                                <div className="flex flex-col xl:flex-row gap-3">
                                  <div className="flex-1">
                                    <select name="licao_id" required defaultValue="" className="w-full h-10 rounded-md border border-white/10 bg-black/50 px-3 text-sm focus:ring-2 focus:ring-primary text-white font-medium">
                                      <option value="" disabled>Qual a lição atual?</option>
                                      {licoesDoLivro.map((licao: any) => (
                                        <option key={licao.id} value={licao.id}>Lição {licao.numero_licao}: {licao.titulo_licao}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex gap-2 items-center w-full xl:w-auto">
                                    <Input name="data_registro" type="date" defaultValue={hoje} className="h-10 text-sm w-36 bg-black/50 text-white border-white/10 focus:ring-2 focus:ring-primary" />
                                    <Button type="submit" size="sm" className="h-10 px-4 shadow-md gap-2 font-bold w-full xl:w-auto text-primary-foreground">
                                      Lançar <Send className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </form>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO DE VISITAS E HISTÓRICO */}
                  <div className="p-6 bg-primary/5">
                    <h3 className="text-base font-bold uppercase text-foreground flex items-center gap-2 mb-4 border-b border-border/20 pb-2">
                      <Users className="w-5 h-5 text-primary" /> Registrar Visita
                    </h3>
                    
                    <div className="grid lg:grid-cols-2 gap-8">
                      
                      {/* Lado Esquerdo: Formulário de Visita */}
                      <form action={lancarVisita} className="p-5 bg-background/60 border border-primary/20 rounded-xl space-y-5 shadow-sm h-fit">
                        <input type="hidden" name="dupla_id" value={dupla.id} />
                        
                        <div className="space-y-1">
                          <Label className="text-xs uppercase font-bold text-muted-foreground">Nome do Visitado</Label>
                          <Input name="nome_visitado" placeholder="Ex: Família Silva" required className="h-10 text-sm bg-background" />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">WhatsApp (Opcional)</Label>
                            <Input name="whatsapp" placeholder="(00) 00000-0000" className="h-10 text-sm bg-background" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Data da Visita</Label>
                            <Input name="data_visita" type="date" defaultValue={hoje} required className="h-10 text-sm bg-background" />
                          </div>
                        </div>
                        
                        <Button type="submit" variant="secondary" className="w-full h-10 text-sm font-bold border border-border/50 shadow-md hover:bg-secondary/80 gap-2 mt-2">
                          Gravar Visita <Send className="w-4 h-4 opacity-50" />
                        </Button>
                      </form>

                      {/* Lado Direito: Histórico Recente de Visitas */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> 3 Últimas Visitas Realizadas
                        </h4>
                        
                        {ultimasVisitas.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-border/50 bg-background/20 text-center text-sm text-muted-foreground italic">
                            Nenhum histórico de visita desta dupla.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {ultimasVisitas.map((visita: any, vIndex: number) => {
                              const isPar = vIndex % 2 === 0;
                              const bgHist = isPar ? "bg-[#11161d]" : "bg-[#1a212c]";

                              return (
                                <div key={visita.id} className={`p-3 rounded-lg border border-white/5 flex justify-between items-center group shadow-sm ${bgHist}`}>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm text-white/90">{visita.nome_visitado}</span>
                                    <span className="text-[10px] text-white/60 font-medium flex items-center gap-1">
                                      <CalendarCheck className="w-3 h-3" /> {new Date(visita.data_visita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </span>
                                  </div>
                                  
                                  <form action={async () => { "use server"; await excluirVisita(visita.id); }}>
                                    <button type="submit" title="Excluir Visita" className="p-2 text-white/50 hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </form>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              </details>
            );
          })
        )}
      </div>

    </div>
  );
}