import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DuplasClient from "./DuplasClient";

export default async function DuplasPage(props: { searchParams?: Promise<{ pelotao?: string }> | { pelotao?: string } }) {
  const supabase = await createClient();

  // 1. Capturar Parâmetros de Filtro da URL
  const searchParams = await Promise.resolve(props.searchParams || {});
  const selectedPelotaoId = searchParams.pelotao;

  // 2. Verificação de Segurança (Master ou Admin)
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

  // 3. Buscar os Pelotões (Master vê todos, Admin vê apenas o dele)
  let pelotoesQuery = supabase.from("pelotoes").select("id, nome").order("nome");
  if (!isMaster) {
    pelotoesQuery = pelotoesQuery.eq("capitao_id", user?.id);
  }
  const { data: pelotoes } = await pelotoesQuery;
  const pelotoesIds = pelotoes?.map(p => p.id) || [];

  // 4. Buscar os Materiais de Estudo (Para o select de estudantes)
  const { data: estudos } = await supabase.from("estudos_biblicos").select("id, nome_estudo");

  // 5. Buscar as Duplas (filtradas pelos pelotões permitidos E pelo filtro selecionado)
  let duplasQuery = supabase
    .from("duplas")
    .select(`
      *,
      pelotao:pelotoes(nome),
      membros:membros_dupla(*),
      estudantes(*, estudo:estudos_biblicos(nome_estudo))
    `)
    .order("created_at", { ascending: false });

  if (isMaster && selectedPelotaoId) {
    duplasQuery = duplasQuery.eq("pelotao_id", selectedPelotaoId);
  } else {
    duplasQuery = duplasQuery.in("pelotao_id", pelotoesIds.length > 0 ? pelotoesIds : ['00000000-0000-0000-0000-000000000000']);
  }

  const { data: duplasData } = await duplasQuery;

  return (
    <DuplasClient 
      isMaster={isMaster}
      selectedPelotaoId={selectedPelotaoId}
      pelotoes={pelotoes || []}
      pelotoesIds={pelotoesIds}
      estudos={estudos || []}
      duplas={duplasData || []}
    />
  );
}