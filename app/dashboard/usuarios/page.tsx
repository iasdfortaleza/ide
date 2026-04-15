import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage() {
  const supabase = await createClient();

  // 1. Verificar se o usuário atual é MASTER
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userPerfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (userPerfil?.role !== "master") {
    redirect("/dashboard"); // Se não for master, volta pro dashboard
  }

  // 2. Buscar todos os usuários cadastrados
  const { data: usuarios } = await supabase
    .from("perfis")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <UsuariosClient 
      usuarios={usuarios || []} 
    />
  );
}