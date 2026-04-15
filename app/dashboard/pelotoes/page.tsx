import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PelotoesClient from "./PelotoesClient";

export default async function PelotoesPage() {
  const supabase = await createClient();

  // 1. Verificação de Segurança: Apenas o MASTER pode gerenciar pelotões
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userPerfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (userPerfil?.role !== "master") {
    redirect("/dashboard"); // Expulsa da página se não for master
  }

  // 2. Buscar os usuários que podem ser capitães (admin ou master)
  const { data: possiveisCapitaes } = await supabase
    .from("perfis")
    .select("id, nome")
    .in("role", ["admin", "master"]);

  // 3. Buscar todos os pelotões já cadastrados
  // Fazemos um 'join' para pegar o nome do capitão direto da tabela de perfis
  const { data: pelotoes } = await supabase
    .from("pelotoes")
    .select(`
      *,
      capitao:perfis(nome)
    `)
    .order("created_at", { ascending: false });

  return (
    <PelotoesClient 
      possiveisCapitaes={possiveisCapitaes || []} 
      pelotoes={pelotoes || []} 
    />
  );
}