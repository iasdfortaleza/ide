import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EstudosClient from "./EstudosClient";

export default async function EstudosPage() {
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

  // 2. Buscar Estudos Bíblicos e suas Lições vinculadas
  const { data: estudos } = await supabase
    .from("estudos_biblicos")
    .select(`
      *,
      licoes (*)
    `)
    .order("created_at", { ascending: false });

  // Ordenar as lições de cada estudo pelo número (crescente)
  estudos?.forEach(estudo => {
    estudo.licoes.sort((a: any, b: any) => a.numero_licao - b.numero_licao);
  });

  return (
    <EstudosClient 
      estudos={estudos || []} 
    />
  );
}