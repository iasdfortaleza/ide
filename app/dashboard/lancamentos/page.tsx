import { createClient } from "@/utils/supabase/server";
import { 
  lancarEstudo, editarLancamentoEstudo, excluirLancamentoEstudo, 
  lancarVisita, editarVisita, excluirVisita 
} from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CalendarCheck, BookHeart, Users, Send, Clock, Filter, 
  ArrowLeft, ChevronDown, Trash2, History, Save 
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LancamentosPage(props: { searchParams?: Promise<{ pelotao?: string }> | { pelotao?: string } }) {
  const supabase = await createClient();

  const searchParams = await Promise.resolve(props.searchParams || {});
  const selectedPelotaoId = searchParams.pelotao;

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

  let pelotoesQuery = supabase.from("pelotoes").select("id, nome").order("nome");
  if (!isMaster) {
    pelotoesQuery = pelotoesQuery.eq("capitao_id", user?.id);
  }
  const { data: pelotoes } = await pelotoesQuery;

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
    duplasQuery = duplasQuery.in("pelotao_id", pelotoesIds.length > 0 ? pelotoesIds : ['00000000-0000-0000-0000-000000000000']);
  }

  const { data: duplas } = await duplasQuery;

  const estudantesIds = duplas?.flatMap(d => d.estudantes.map((e: any) => e.id)) || [];
  
  const { data: progressoTotal } = await supabase
    .from("progresso_estudo")
    .select("id, estudante_id, data_registro, licao_id, licao:licoes(id, numero_licao, titulo_licao)")
    .in("estudante_id", estudantesIds.length > 0 ? estudantesIds : ['00000000-0000-0000-0000-000000000000'])
    .order("data_registro", { ascending: false });

  const { data: estudosComLicoes } = await supabase
    .from("estudos_biblicos")
    .select("id, licoes(id, numero_licao, titulo_licao)");

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-8">
      
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
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

      <div className="space-y-4">
        {duplas?.map((dupla) => {
          const pelotaoObj = Array.isArray(dupla.pelotao) ? dupla.pelotao[0] : dupla.pelotao;
          const nomeDoPelotao = pelotaoObj?.nome || "Sem pelotão";
          
          // Todas as visitas da dupla, ordenadas da mais recente para a mais antiga
          const historicoVisitas = [...(dupla.visitas || [])].sort((a: any, b: any) => new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime());

          return (
            <details key={dupla.id} className="group border border-primary/20 bg-card/50 backdrop-blur-md rounded-xl overflow-hidden shadow-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="bg-muted/20 px-6 py-4 border-b border-border/50 flex justify-between items-center cursor-pointer list-none hover:bg-muted/40 transition-all">
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

              <div className="flex flex-col divide-y divide-border/50">
                <div className="p-6 space-y-5 bg-white">
                  <h3 className="text-base font-black uppercase text-primary flex items-center gap-2 mb-2 border-b border-black/10 pb-2">
                    <BookHeart className="w-5 h-5" /> Acompanhamento de Estudos
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {dupla.estudantes.filter((e: any) => e.status === 'ativo').map((estudante: any, index: number) => {
                      const licoesDoLivro = estudosComLicoes?.find(est => est.id === estudante.estudo_biblico_id)?.licoes || [];
                      licoesDoLivro.sort((a: any, b: any) => a.numero_licao - b.numero_licao);

                      const historicoEstudante = progressoTotal?.filter(p => p.estudante_id === estudante.id) || [];
                      const ultimoProgresso = historicoEstudante[0];
                      
                      const licAnteriorObj = ultimoProgresso?.licao 
                        ? (Array.isArray(ultimoProgresso.licao) ? ultimoProgresso.licao[0] : ultimoProgresso.licao) 
                        : null;

                      const isPar = index % 2 === 0;
                      const bgContainer = isPar ? "bg-[#11161d]" : "bg-[#1a212c]";

                      return (
                        <div key={estudante.id} className={`p-4 rounded-xl border border-primary/20 space-y-4 ${bgContainer} text-white shadow-lg`}>
                          <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <p className="font-black text-sm uppercase tracking-wider">{estudante.nome_pessoa}</p>
                            {ultimoProgresso && licAnteriorObj && (
                              <div className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                L{licAnteriorObj.numero_licao} em {new Date(ultimoProgresso.data_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                              </div>
                            )}
                          </div>
                          
                          <form action={lancarEstudo} className="flex flex-col sm:flex-row gap-2">
                            <input type="hidden" name="estudante_id" value={estudante.id} />
                            <select name="licao_id" required defaultValue="" className="flex-1 h-9 rounded-md border border-white/10 bg-black/50 text-xs px-2 focus:ring-1 focus:ring-primary outline-none">
                              <option value="" disabled>Lançar lição...</option>
                              {licoesDoLivro.map((lic: any) => (
                                <option key={lic.id} value={lic.id} className="text-black">Lição {lic.numero_licao}: {lic.titulo_licao}</option>
                              ))}
                            </select>
                            <Input name="data_registro" type="date" defaultValue={hoje} className="h-9 text-xs w-full sm:w-32 bg-black/50 border-white/10" />
                            <Button type="submit" size="sm" className="h-9 px-4 font-bold"><Send className="w-3.5 h-3.5" /></Button>
                          </form>

                          <details className="group/hist">
                            <summary className="text-[10px] uppercase font-bold text-white/40 cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 list-none">
                              <History className="w-3 h-3" /> Ver histórico ({historicoEstudante.length})
                            </summary>
                            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20">
                              {historicoEstudante.map((registro: any) => {
                                return (
                                  <form action={editarLancamentoEstudo} key={registro.id} className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/5">
                                    <input type="hidden" name="id" value={registro.id} />
                                    <select 
                                      name="licao_id" 
                                      defaultValue={registro.licao_id} 
                                      className="bg-transparent text-[10px] font-black text-white/70 focus:text-primary outline-none cursor-pointer"
                                    >
                                      {licoesDoLivro.map((lic: any) => (
                                        <option key={lic.id} value={lic.id} className="text-black">L{lic.numero_licao}</option>
                                      ))}
                                    </select>
                                    <input 
                                      name="data_registro" 
                                      type="date" 
                                      defaultValue={registro.data_registro} 
                                      className="bg-transparent text-[10px] text-white/40 outline-none w-24" 
                                    />
                                    {/* Botões sempre visíveis */}
                                    <div className="ml-auto flex gap-1">
                                      <button type="submit" title="Salvar" className="p-1.5 hover:bg-green-500/20 rounded text-green-500 transition-colors">
                                        <Save className="w-3 h-3" />
                                      </button>
                                      <button 
                                        formAction={async () => { "use server"; await excluirLancamentoEstudo(registro.id); }} 
                                        className="p-1.5 hover:bg-destructive/20 rounded text-destructive transition-colors"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </form>
                                );
                              })}
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-primary/5">
                  <h3 className="text-base font-bold uppercase text-foreground flex items-center gap-2 mb-4 border-b border-border/20 pb-2">
                    <Users className="w-5 h-5 text-primary" /> Registrar Visita
                  </h3>
                  <div className="grid lg:grid-cols-2 gap-8">
                    
                    {/* Formulário Novo Lançamento de Visita */}
                    <form action={lancarVisita} className="p-5 bg-background/60 border border-primary/20 rounded-xl space-y-5 shadow-sm h-fit">
                      <input type="hidden" name="dupla_id" value={dupla.id} />
                      <div className="space-y-1">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Nome do Visitado</Label>
                        <Input name="nome_visitado" placeholder="Ex: Família Silva" required className="h-10 bg-background" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs uppercase font-bold text-muted-foreground">WhatsApp</Label>
                          <Input name="whatsapp" placeholder="(00) 00000-0000" className="h-10 bg-background" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs uppercase font-bold text-muted-foreground">Data</Label>
                          <Input name="data_visita" type="date" defaultValue={hoje} required className="h-10 bg-background" />
                        </div>
                      </div>
                      <Button type="submit" variant="secondary" className="w-full font-bold border border-border/50 shadow-md">
                        Gravar Visita <Send className="w-4 h-4 opacity-50 ml-2" />
                      </Button>
                    </form>

                    {/* HISTÓRICO RECOLHÍVEL DE VISITAS */}
                    <div className="bg-card/50 border border-border/40 p-4 rounded-xl h-fit">
                      <details className="group/histVisita">
                        <summary className="text-xs uppercase font-bold text-foreground flex items-center justify-between cursor-pointer hover:text-primary transition-colors list-none pb-2 border-b border-border/50">
                          <div className="flex items-center gap-1.5">
                            <History className="w-4 h-4" /> Histórico de Visitas ({historicoVisitas.length})
                          </div>
                          <ChevronDown className="w-4 h-4 group-open/histVisita:rotate-180 transition-transform" />
                        </summary>
                        
                        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                          {historicoVisitas.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-border/50 bg-background/20 text-center text-sm text-muted-foreground italic">
                              Nenhuma visita registrada.
                            </div>
                          ) : (
                            historicoVisitas.map((visita: any) => (
                              <form action={editarVisita} key={visita.id} className="flex flex-wrap items-center gap-2 p-2 bg-background/80 rounded-lg border border-border/50 shadow-sm">
                                <input type="hidden" name="id" value={visita.id} />
                                
                                <div className="flex-1 min-w-[120px]">
                                  <input 
                                    name="nome_visitado" 
                                    defaultValue={visita.nome_visitado} 
                                    required
                                    placeholder="Nome"
                                    className="bg-transparent text-xs font-bold text-foreground w-full outline-none focus:border-b focus:border-primary px-1" 
                                  />
                                </div>
                                
                                <div className="w-28">
                                  <input 
                                    name="whatsapp" 
                                    defaultValue={visita.whatsapp || ""} 
                                    placeholder="WhatsApp"
                                    className="bg-transparent text-[10px] text-muted-foreground w-full outline-none focus:border-b focus:border-primary px-1" 
                                  />
                                </div>

                                <div className="w-24">
                                  <input 
                                    name="data_visita" 
                                    type="date" 
                                    defaultValue={visita.data_visita} 
                                    required
                                    className="bg-transparent text-[10px] text-muted-foreground w-full outline-none focus:text-primary" 
                                  />
                                </div>

                                {/* Botões sempre visíveis */}
                                <div className="flex gap-1 ml-auto">
                                  <button type="submit" title="Salvar" className="p-1.5 hover:bg-green-500/20 rounded text-green-500 transition-colors">
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    formAction={async () => { "use server"; await excluirVisita(visita.id); }} 
                                    className="p-1.5 hover:bg-destructive/20 rounded text-destructive transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </form>
                            ))
                          )}
                        </div>
                      </details>
                    </div>

                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}