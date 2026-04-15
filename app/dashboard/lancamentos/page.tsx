import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LancamentosClient from "./LancamentosClient";

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
      id, nome_dupla, url_foto_dupla,
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
    <LancamentosClient 
      isMaster={isMaster}
      selectedPelotaoId={selectedPelotaoId}
      pelotoes={pelotoes || []}
      duplas={duplas || []}
      progressoTotal={progressoTotal || []}
      estudosComLicoes={estudosComLicoes || []}
      hoje={hoje}
    />
  );
}