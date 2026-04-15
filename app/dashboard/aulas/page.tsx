import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AulasClient from "./AulasClient";

export default async function AulasPage() {
  const supabase = await createClient();

  // 1. Verificação de Segurança (Apenas Master ou Admin)
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userPerfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (!userPerfil || userPerfil.role === "padrao") {
    redirect("/dashboard");
  }

  const isMaster = userPerfil.role === "master";

  // 2. Buscar todas as aulas (Ordenadas pelas mais recentes)
  const { data: aulas } = await supabase
    .from("aulas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AulasClient 
      isMaster={isMaster} 
      aulas={aulas || []} 
    />
  );
}