import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

  // 3. Server Action interna para mudar a Role
  async function updateRole(id: string, newRole: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("perfis").update({ role: newRole }).eq("id", id);
    revalidatePath("/dashboard/usuarios");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho com Botão de Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserCog className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Permissões</h1>
            <p className="text-sm text-muted-foreground">Gerencie os níveis de acesso ao sistema</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {usuarios?.map((u) => (
          <Card key={u.id} className="border-primary/10 bg-card/50 backdrop-blur-md overflow-hidden">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
              <div className="space-y-1">
                <p className="font-bold text-lg text-foreground">{u.nome}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-black tracking-widest ${
                    u.role === 'master' ? 'bg-primary text-primary-foreground shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 
                    u.role === 'admin' ? 'bg-blue-600/20 text-blue-500 border border-blue-500/30' : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Botões para trocar a permissão */}
                <form action={updateRole.bind(null, u.id, "padrao")}>
                  <Button variant="outline" size="sm" className="text-xs font-bold" disabled={u.role === 'padrao'}>
                    Padrão
                  </Button>
                </form>
                
                <form action={updateRole.bind(null, u.id, "admin")}>
                  <Button variant="outline" size="sm" className="text-xs font-bold border-blue-500/50 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400" disabled={u.role === 'admin'}>
                    Tornar Admin
                  </Button>
                </form>

                <form action={updateRole.bind(null, u.id, "master")}>
                  <Button variant="outline" size="sm" className="text-xs font-bold border-primary/50 text-primary hover:bg-primary/10 hover:text-primary" disabled={u.role === 'master'}>
                    Tornar Master
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {!usuarios?.length && (
        <div className="text-center p-10 border-2 border-dashed border-border rounded-xl bg-card/10">
          <p className="text-muted-foreground italic">Nenhum usuário encontrado.</p>
        </div>
      )}
    </div>
  );
}