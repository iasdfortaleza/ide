import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Target, CheckCircle2, CircleDashed, ChevronDown, BookOpen, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function MuralPelotaoPage(props: { 
  params: Promise<{ pelotao_id: string }>,
  searchParams: Promise<{ start?: string, end?: string }>
}) {
  const supabase = await createClient();
  const params = await props.params;
  const searchParams = await props.searchParams;
  const pelotao_id = params.pelotao_id;

  // ==========================================
  // 1. LÓGICA DE DATAS (Semana Atual)
  // ==========================================
  const hoje = new Date();
  const diaDaSemana = hoje.getDay(); 
  const diasAteSabadoPassado = diaDaSemana === 6 ? 0 : diaDaSemana + 1;
  const dataSabado = new Date(hoje);
  dataSabado.setDate(hoje.getDate() - diasAteSabadoPassado);
  const dataSexta = new Date(dataSabado);
  dataSexta.setDate(dataSabado.getDate() + 6);

  const defaultStart = dataSabado.toISOString().split('T')[0];
  const defaultEnd = dataSexta.toISOString().split('T')[0];

  const startDate = searchParams.start || defaultStart;
  const endDate = searchParams.end || defaultEnd;

  // ==========================================
  // 2. BUSCAS NO BANCO DE DADOS
  // ==========================================
  const { data: pelotao } = await supabase.from("pelotoes").select("nome, igreja").eq("id", pelotao_id).single();
  if (!pelotao) return <div className="p-20 text-center text-2xl font-bold">Pelotão não encontrado.</div>;

  const { data: estudosComLicoes } = await supabase.from("estudos_biblicos").select("id, licoes(id)");

  const { data: duplas } = await supabase
    .from("duplas")
    .select("id, nome_dupla, estudantes(id, nome_pessoa, estudo_biblico_id, status)")
    .eq("pelotao_id", pelotao_id)
    .order("nome_dupla");

  const duplasIds = duplas?.map(d => d.id) || [];
  const estudantesIds = duplas?.flatMap(d => d.estudantes.filter((e: any) => e.status === 'ativo').map((e: any) => e.id)) || [];
  
  const { data: progressoTotal } = await supabase
    .from("progresso_estudo")
    .select("estudante_id, data_registro, licao:licoes(numero_licao)")
    .in("estudante_id", estudantesIds.length ? estudantesIds : ['00000000-0000-0000-0000-000000000000']);

  // Consulta corrigida para puxar os dados das visitas
  const { data: visitasLancadas } = await supabase
    .from("visitas")
    .select("id, dupla_id, nome_visitado, data_visita")
    .in("dupla_id", duplasIds.length ? duplasIds : ['00000000-0000-0000-0000-000000000000'])
    .gte("data_visita", startDate)
    .lte("data_visita", endDate)
    .order("data_visita", { ascending: false });

  const { data: metas } = await supabase.from("metas").select("*").eq("ano", new Date().getFullYear()).single();

  // ==========================================
  // 3. FUNÇÕES E CÁLCULOS
  // ==========================================
  const estudosDaSemana = progressoTotal?.filter(p => p.data_registro >= startDate && p.data_registro <= endDate).length || 0;
  const visitasDaSemana = visitasLancadas?.length || 0;

  const getStatusAluno = (estudanteId: string, livroId: string) => {
    const progressoAluno = progressoTotal?.filter(p => p.estudante_id === estudanteId) || [];
    let licaoAtual = 0;
    
    progressoAluno.forEach(p => {
      const licObj = Array.isArray(p.licao) ? p.licao[0] : p.licao;
      if (licObj && licObj.numero_licao > licaoAtual) licaoAtual = licObj.numero_licao;
    });

    const livro = estudosComLicoes?.find(e => e.id === livroId);
    const totalLicoes = livro?.licoes ? livro.licoes.length : 20;
    const porcentagem = totalLicoes > 0 ? (licaoAtual / totalLicoes) * 100 : 0;

    let color = "bg-zinc-500/50"; // Cinza (Vazio)
    let activeColor = "bg-yellow-500"; 
    
    if (porcentagem > 0 && porcentagem <= 33) activeColor = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]";
    else if (porcentagem > 33 && porcentagem <= 66) activeColor = "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]";
    else if (porcentagem > 66 && porcentagem < 100) activeColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]";
    else if (porcentagem >= 100) activeColor = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";

    return { licaoAtual, totalLicoes, color, activeColor };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12 font-sans selection:bg-primary/30">
      
      {/* HEADER COMPACTO E ELEGANTE */}
      <header className="w-full bg-card/90 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-black text-primary tracking-widest uppercase leading-none drop-shadow-sm">
              {pelotao.nome}
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-widest uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {pelotao.igreja}
            </p>
          </div>
        </div>
        
        {/* CALENDÁRIO DISCRETO (DROPDOWN) */}
        <details className="relative group">
          <summary className="list-none cursor-pointer w-10 h-10 rounded-full bg-muted/30 hover:bg-primary/10 transition-colors flex items-center justify-center border border-border/50">
            <Calendar className="w-5 h-5 text-primary" />
          </summary>
          
          <div className="absolute right-0 top-full mt-3 p-4 bg-card border border-border/50 shadow-2xl rounded-xl w-[280px] z-50">
            <form method="GET" className="flex flex-col gap-3">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                Filtro de Período
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Data Inicial</label>
                <Input type="date" name="start" defaultValue={startDate} className="h-8 text-xs bg-background" />
                
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Data Final</label>
                <Input type="date" name="end" defaultValue={endDate} className="h-8 text-xs bg-background" />
              </div>
              <Button type="submit" size="sm" className="h-8 text-xs font-bold w-full mt-2">Aplicar Filtro</Button>
            </form>
          </div>
        </details>
      </header>

      {/* CONTEÚDO PRINCIPAL (MURAL) */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 mt-6 space-y-6">
        
        {/* ========================================================= */}
        {/* ACORDEÃO 1: ESTUDOS BÍBLICOS (Aberto por padrão) */}
        {/* ========================================================= */}
        <details open className="group bg-card/40 backdrop-blur-sm border border-primary/20 rounded-xl overflow-hidden shadow-2xl shadow-primary/5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="bg-primary/10 border-b border-primary/20 py-4 px-6 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-foreground drop-shadow-sm">
                  Acompanhamento de <span className="text-primary">Estudos</span>
                </h2>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                  Progresso Semanal das Duplas
                </p>
              </div>
            </div>
            <ChevronDown className="w-6 h-6 text-primary group-open:rotate-180 transition-transform duration-500" />
          </summary>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              
              {/* CABEÇALHO */}
              <thead>
                <tr className="bg-muted/50 text-foreground/70 uppercase text-[10px] md:text-xs tracking-widest font-bold">
                  <th className="p-4 text-left w-1/4">Dupla Missionária</th>
                  <th className="p-4 text-left w-1/4">Aluno / Família</th>
                  <th className="p-4 text-center">Progresso das Lições</th>
                  <th className="p-4 text-center w-24">Lição</th>
                </tr>
              </thead>

              {/* CORPO DA TABELA */}
              <tbody className="text-sm">
                {!duplas || duplas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground italic">Nenhuma dupla cadastrada.</td>
                  </tr>
                ) : (
                  duplas.map((dupla, dIndex) => {
                    const alunosAtivos = dupla.estudantes?.filter((e: any) => e.status === 'ativo') || [];
                    
                    // Lógica de cores discretas para separar as duplas visualmente
                    const isEven = dIndex % 2 === 0;
                    const rowBgClass = isEven ? "bg-background/40" : "bg-muted/10";
                    const borderClass = "border-b border-border/40";

                    if (alunosAtivos.length === 0) {
                      return (
                        <tr key={dupla.id} className={`${rowBgClass} ${borderClass}`}>
                          <td className="p-4 font-bold text-primary/80 border-l-4 border-l-primary/30">{dupla.nome_dupla}</td>
                          <td colSpan={3} className="p-4 text-muted-foreground text-xs italic text-center">Nenhum estudante ativo.</td>
                        </tr>
                      );
                    }

                    return alunosAtivos.map((aluno: any, index: number) => {
                      const { licaoAtual, totalLicoes, color, activeColor } = getStatusAluno(aluno.id, aluno.estudo_biblico_id);
                      const blocos = Array.from({ length: totalLicoes }, (_, i) => i < licaoAtual);

                      return (
                        <tr key={aluno.id} className={`${rowBgClass} ${borderClass} hover:bg-primary/5 transition-colors`}>
                          
                          {/* Nome da Dupla (agrupado) */}
                          {index === 0 && (
                            <td rowSpan={alunosAtivos.length} className="p-4 font-bold text-foreground/90 align-middle border-l-4 border-l-primary">
                              {dupla.nome_dupla}
                            </td>
                          )}
                          
                          {/* Aluno */}
                          <td className="p-4 font-semibold text-foreground/80">{aluno.nome_pessoa}</td>
                          
                          {/* Progresso Gamificado (Barrinhas) */}
                          <td className="p-4 align-middle">
                            <div className="flex flex-wrap gap-1 items-center justify-center">
                              {blocos.map((preenchido, i) => (
                                <div 
                                  key={i} 
                                  className={`w-3 h-3 md:w-4 md:h-4 rounded-[2px] transition-all duration-500 ${preenchido ? activeColor : color}`}
                                />
                              ))}
                            </div>
                          </td>
                          
                          {/* Lição Atual / Total */}
                          <td className="p-4 text-center">
                            <span className="font-black text-lg md:text-xl text-foreground">{licaoAtual}</span>
                            <span className="text-[10px] md:text-xs text-muted-foreground font-bold">/{totalLicoes}</span>
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>

            {/* LEGENDA MINÚSCULA NO RODAPÉ DA TABELA */}
            <div className="bg-background/80 p-2 flex flex-wrap items-center justify-center gap-4 text-[9px] uppercase font-black tracking-widest text-muted-foreground/70 opacity-60">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-yellow-500" /> Início</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-orange-500" /> Meio</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-blue-500" /> Quase lá</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-green-500" /> Pronto</div>
            </div>
          </div>
        </details>

        {/* ========================================================= */}
        {/* ACORDEÃO 2: VISITAS MISSIONÁRIAS (Fechado por padrão) */}
        {/* ========================================================= */}
        <details className="group bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg [&_summary::-webkit-details-marker]:hidden">
          <summary className="bg-muted/30 border-b border-border/50 py-4 px-6 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-foreground/70" />
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-foreground drop-shadow-sm">
                  Relatório de <span className="text-foreground/80">Visitas</span>
                </h2>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                  Famílias e Amigos Visitados
                </p>
              </div>
            </div>
            <ChevronDown className="w-6 h-6 text-muted-foreground group-open:rotate-180 transition-transform duration-500" />
          </summary>

          <div className="overflow-x-auto p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] md:text-xs tracking-widest font-bold border-b border-border/50">
                  <th className="p-3 text-left w-1/3">Data</th>
                  <th className="p-3 text-left w-1/3">Dupla Missionária</th>
                  <th className="p-3 text-left w-1/3">Família / Visitado</th>
                </tr>
              </thead>
              <tbody>
                {!visitasLancadas || visitasLancadas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-muted-foreground italic text-sm">Nenhuma visita lançada neste período.</td>
                  </tr>
                ) : (
                  visitasLancadas.map((visita, index) => {
                    const dupla = duplas?.find(d => d.id === visita.dupla_id);
                    const isEven = index % 2 === 0;
                    
                    return (
                      <tr key={visita.id} className={`${isEven ? 'bg-background/30' : 'bg-muted/10'} hover:bg-muted/30 transition-colors border-b border-border/20 text-sm`}>
                        <td className="p-3 text-muted-foreground font-medium">
                          {new Date(visita.data_visita).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                        </td>
                        <td className="p-3 font-bold text-foreground/80">{dupla?.nome_dupla || "Desconhecida"}</td>
                        <td className="p-3 font-semibold text-primary">{visita.nome_visitado}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </details>

        {/* ========================================================= */}
        {/* RESUMO DO PERÍODO & METAS ANUAIS */}
        {/* ========================================================= */}
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          
          <Card className="bg-card/30 border-border/50 backdrop-blur-md shadow-lg">
            <div className="bg-muted/20 py-2 text-center border-b border-border/50">
              <h3 className="uppercase tracking-widest font-bold text-[10px] md:text-xs text-foreground/70">Resumo da Semana</h3>
            </div>
            <CardContent className="p-4 md:p-6 flex justify-around items-center">
              <div className="text-center space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Estudos Concluídos</p>
                <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-xl font-black text-3xl text-primary shadow-inner">
                  {estudosDaSemana}
                </div>
              </div>
              <div className="w-px h-16 bg-border/50" /> {/* Divisor Visual */}
              <div className="text-center space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Visitas Realizadas</p>
                <div className="bg-background border border-border/50 px-6 py-2 rounded-xl font-black text-3xl text-foreground/80 shadow-inner">
                  {visitasDaSemana}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50 backdrop-blur-md shadow-lg">
            <div className="bg-muted/20 py-2 text-center border-b border-border/50">
              <h3 className="uppercase tracking-widest font-bold text-[10px] md:text-xs text-foreground/70 flex items-center justify-center gap-2">
                <Target className="w-3 h-3 text-primary" /> Alvo de Batismo Anual ({metas?.ano || new Date().getFullYear()})
              </h3>
            </div>
            <CardContent className="p-4 md:p-6 flex justify-between items-center gap-2">
              <div className="flex flex-col items-center justify-center bg-background border border-border/50 p-3 rounded-xl flex-1 shadow-sm">
                <Target className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Alvo</p>
                <p className="font-black text-xl">{metas?.alvo_anual || 0}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex-1 shadow-sm scale-105">
                <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
                <p className="text-[9px] uppercase font-bold text-green-500">Alcançado</p>
                <p className="font-black text-2xl text-green-500">{metas?.alvo_alcancado || 0}</p>
              </div>

              <div className="flex flex-col items-center justify-center bg-background border border-border/50 p-3 rounded-xl flex-1 shadow-sm">
                <CircleDashed className="w-4 h-4 text-orange-500/70 mb-1" />
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Faltam</p>
                <p className="font-black text-xl text-orange-500/80">
                  {Math.max(0, (metas?.alvo_anual || 0) - (metas?.alvo_alcancado || 0))}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}