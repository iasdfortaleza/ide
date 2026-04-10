import { createClient } from "@/utils/supabase/server";
import { MuralHeader } from "@/components/mural/MuralHeader";
import { TabelaEstudos } from "@/components/mural/TabelaEstudos";
import { TabelaVisitas } from "@/components/mural/TabelaVisitas";
import { ResumoPeriodo } from "@/components/mural/ResumoPeriodo";
import { AlvoBatismo } from "@/components/mural/AlvoBatismo";

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

  // Data Inicial: 6 dias atrás
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
    { data: metas } // Vai trazer uma array com 1 item (o mais recente)
  ] = await Promise.all([
    supabase.from("pelotoes").select("nome, igreja").eq("id", pelotao_id).single(),
    supabase.from("estudos_biblicos").select("id, licoes(id, numero_licao)"),
    supabase.from("duplas").select(`
      id, 
      nome_dupla, 
      url_foto_dupla,
      membros_dupla(nome),
      estudantes(id, nome_pessoa, estudo_biblico_id, status)
    `).eq("pelotao_id", pelotao_id).order("nome_dupla"),
    
    // NOVA LÓGICA: Pega a meta com o maior ANO cadastrado para este pelotão
    supabase.from("metas")
      .select("*")
      .eq("pelotao_id", pelotao_id)
      .order("ano", { ascending: false })
      .limit(1)
  ]);

  if (!pelotao) return <div className="p-20 text-center text-2xl font-bold text-foreground">Pelotão não encontrado.</div>;

  // Como limitamos a 1, pegamos o primeiro item da array (se existir)
  const metaMaisRecente = metas && metas.length > 0 ? metas[0] : null;

  const duplasIds = duplas?.map(d => d.id) || [];
  const estudantesAtivos = duplas?.flatMap(d => d.estudantes.filter((e: any) => e.status === 'ativo')) || [];
  const estudantesIds = estudantesAtivos.map(e => e.id);
  
  const { data: progressoTotal } = await supabase
    .from("progresso_estudo")
    .select("estudante_id, data_registro, licao:licoes(numero_licao)")
    .in("estudante_id", estudantesIds.length ? estudantesIds : ['00000000-0000-0000-0000-000000000000'])
    .order('data_registro', { ascending: false });

  const { data: visitasTotais } = await supabase
    .from("visitas")
    .select("id, dupla_id, nome_visitado, data_visita")
    .in("dupla_id", duplasIds.length ? duplasIds : ['00000000-0000-0000-0000-000000000000'])
    .order("data_visita", { ascending: false });

  const visitasNoPeriodo = visitasTotais?.filter(v => 
    v.data_visita >= startDate && v.data_visita <= endDate
  ) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12 font-sans selection:bg-primary/30 text-foreground">
      
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
          visitasLancadas={visitasNoPeriodo} 
          duplas={duplas || []} 
        />

        <ResumoPeriodo 
          estudantesAtivos={estudantesAtivos}
          estudosComLicoes={estudosComLicoes || []}
          progressoTotal={progressoTotal || []}
          visitasTotais={visitasTotais || []}
          startDate={startDate}
          endDate={endDate}
        />

        {/* Passa a meta mais recente em vez da meta do ano atual */}
        <AlvoBatismo 
          metas={metaMaisRecente} 
        />

      </main>
    </div>
  );
}