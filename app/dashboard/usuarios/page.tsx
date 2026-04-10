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
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background min-h-screen text-foreground">
      
      {/* Cabeçalho com Botão de Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserCog className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Gestão de Permissões</h1>
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mt-1">Gerencie os níveis de acesso ao sistema</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted transition-colors bg-card shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {usuarios?.map((u) => (
          <Card key={u.id} className="border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-5">
              
              <div className="space-y-1.5">
                <p className="font-bold text-lg text-foreground tracking-tight">{u.nome}</p>
                <p className="text-sm font-medium text-muted-foreground">{u.email}</p>
                <div className="flex items-center gap-2 mt-2 pt-1">
                  <span className={`text-[10px] uppercase px-2.5 py-1 rounded-md font-black tracking-widest ${
                    u.role === 'master' ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--color-primary),0.3)]' : 
                    u.role === 'admin' ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' : 
                    'bg-muted/30 text-muted-foreground border border-border/50'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 border-border/50 pt-4 sm:pt-0">
                {/* Botões para trocar a permissão */}
                <form action={updateRole.bind(null, u.id, "padrao")}>
                  <Button variant="outline" size="sm" className="text-xs font-bold border-border bg-background hover:bg-muted/50 hover:text-foreground transition-colors disabled:opacity-30" disabled={u.role === 'padrao'}>
                    Padrão
                  </Button>
                </form>
                
                <form action={updateRole.bind(null, u.id, "admin")}>
                  <Button variant="outline" size="sm" className="text-xs font-bold border-blue-400/30 text-blue-400 bg-background hover:bg-blue-400/10 hover:text-blue-300 hover:border-blue-400/50 transition-colors disabled:opacity-30" disabled={u.role === 'admin'}>
                    Tornar Admin
                  </Button>
                </form>

                <form action={updateRole.bind(null, u.id, "master")}>
                  <Button variant="outline" size="sm" className="text-xs font-bold border-primary/30 text-primary bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors shadow-sm disabled:opacity-30" disabled={u.role === 'master'}>
                    Tornar Master
                  </Button>
                </form>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
      
      {!usuarios?.length && (
        <div className="text-center p-10 border-2 border-dashed border-border rounded-xl bg-card/40 flex flex-col items-center justify-center">
          <UserCog className="w-10 h-10 mb-3 opacity-20 text-muted-foreground" />
          <p className="text-muted-foreground font-medium tracking-wide">Nenhum usuário encontrado no sistema.</p>
        </div>
      )}
    </div>
  );
}