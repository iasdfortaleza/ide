import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MetasClient from "./MetasClient";

export default async function MetasPage() {
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

  // 2. Buscar todas as metas já cadastradas
  const { data: metas } = await supabase
    .from("metas")
    .select(`
      *,
      pelotao:pelotoes(nome)
    `)
    .order("ano", { ascending: false })
    .order("created_at", { ascending: false });

  // 3. Buscar todos os pelotões disponíveis para o select
  const { data: pelotoes } = await supabase
    .from("pelotoes")
    .select("id, nome")
    .order("nome");

  const anoAtual = new Date().getFullYear();
  
  // Lógica inteligente: O ano "Vigente" será sempre o maior ano já cadastrado no banco.
  const maxAno = metas && metas.length > 0 
    ? Math.max(...metas.map(m => m.ano)) 
    : anoAtual;

  return (
    <MetasClient 
      pelotoes={pelotoes || []} 
      metas={metas || []} 
      anoAtual={anoAtual} 
      maxAno={maxAno} 
    />
  );
}