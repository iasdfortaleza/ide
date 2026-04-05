import { createClient } from "@/utils/supabase/server";
import { MuralHeader } from "@/components/mural/MuralHeader";
import { TabelaEstudos } from "@/components/mural/TabelaEstudos";
import { TabelaVisitas } from "@/components/mural/TabelaVisitas";
import { ResumoMetas } from "@/components/mural/ResumoMetas";

export default async function MuralPelotaoPage(props: { 
  params: Promise<{ pelotao_id: string }>,
  searchParams: Promise<{ start?: string, end?: string }>
}) {
  const supabase = await createClient();
  const params = await props.params;
  const searchParams = await props.searchParams;
  const pelotao_id = params.pelotao_id;

  // ==========================================
  // 1. LÓGICA DE DATAS (Padrão: Últimos 7 dias)
  // ==========================================
  const agora = new Date();
  const offset = agora.getTimezoneOffset() * 60000;
  const dataLocal = new Date(agora.getTime() - offset);

  // Data Final: Hoje
  const defaultEnd = dataLocal.toISOString().split('T')[0];

  // Data Inicial: 6 dias atrás (Totalizando 7 dias com hoje)
  const dataSeteDiasAtras = new Date(dataLocal);
  dataSeteDiasAtras.setDate(dataLocal.getDate() - 6);
  const defaultStart = dataSeteDiasAtras.toISOString().split('T')[0];

  const startDate = searchParams.start || defaultStart;
  const endDate = searchParams.end || defaultEnd;

  // ==========================================
  // 2. BUSCAS NO BANCO DE DADOS
  // ==========================================
  const [
    { data: pelotao },
    { data: estudosComLicoes },
    { data: duplas },
    { data: metas }
  ] = await Promise.all([
    supabase.from("pelotoes").select("nome, igreja").eq("id", pelotao_id).single(),
    supabase.from("estudos_biblicos").select("id, licoes(id, numero_licao)"),
    // ATUALIZADO: Agora buscamos a foto da dupla e o nome dos membros
    supabase.from("duplas").select(`
      id, 
      nome_dupla, 
      url_foto_dupla,
      membros_dupla(nome),
      estudantes(id, nome_pessoa, estudo_biblico_id, status)
    `).eq("pelotao_id", pelotao_id).order("nome_dupla"),
    supabase.from("metas").select("*").eq("ano", new Date().getFullYear()).single()
  ]);

  if (!pelotao) return <div className="p-20 text-center text-2xl font-bold text-white">Pelotão não encontrado.</div>;

  const duplasIds = duplas?.map(d => d.id) || [];
  const estudantesIds = duplas?.flatMap(d => d.estudantes.filter((e: any) => e.status === 'ativo').map((e: any) => e.id)) || [];
  
  // Puxamos todo o histórico de progresso
  const { data: progressoTotal } = await supabase
    .from("progresso_estudo")
    .select("estudante_id, data_registro, licao:licoes(numero_licao)")
    .in("estudante_id", estudantesIds.length ? estudantesIds : ['00000000-0000-0000-0000-000000000000'])
    .order('data_registro', { ascending: false });

  // Visitas filtradas pelo período
  const { data: visitasLancadas } = await supabase
    .from("visitas")
    .select("id, dupla_id, nome_visitado, data_visita")
    .in("dupla_id", duplasIds.length ? duplasIds : ['00000000-0000-0000-0000-000000000000'])
    .gte("data_visita", startDate)
    .lte("data_visita", endDate)
    .order("data_visita", { ascending: false });

  // ==========================================
  // 3. CÁLCULOS RESUMIDOS PARA O RODAPÉ
  // ==========================================
  const estudosNoPeriodo = progressoTotal?.filter(p => p.data_registro >= startDate && p.data_registro <= endDate).length || 0;
  const visitasNoPeriodo = visitasLancadas?.length || 0;

  return (
    <div className="min-h-screen bg-[#0f1319] flex flex-col pb-12 font-sans selection:bg-primary/30 text-foreground">
      
      <MuralHeader 
        nome={pelotao.nome} 
        igreja={pelotao.igreja} 
        startDate={startDate} 
        endDate={endDate} 
      />

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 mt-6 space-y-8">
        
        <TabelaEstudos 
          duplas={duplas || []} 
          estudosComLicoes={estudosComLicoes || []} 
          progressoTotal={progressoTotal || []}
          startDate={startDate}
          endDate={endDate}
        />

        <TabelaVisitas 
          visitasLancadas={visitasLancadas || []} 
          duplas={duplas || []} 
        />

        <ResumoMetas 
          estudosDaSemana={estudosNoPeriodo} 
          visitasDaSemana={visitasNoPeriodo} 
          metas={metas} 
        />

      </main>
    </div>
  );
}