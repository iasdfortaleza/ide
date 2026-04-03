import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserCog, UserCheck, ShieldAlert } from "lucide-react";

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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <UserCog className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Permissões</h1>
      </div>

      <div className="grid gap-4">
        {usuarios?.map((u) => (
          <Card key={u.id} className="border-primary/10 bg-card/50 backdrop-blur-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <p className="font-bold text-lg">{u.nome}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                    u.role === 'master' ? 'bg-primary text-primary-foreground' : 
                    u.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Botões para trocar a permissão */}
                <form action={updateRole.bind(null, u.id, "padrao")}>
                  <Button variant="outline" size="sm" disabled={u.role === 'padrao'}>
                    Padrão
                  </Button>
                </form>
                
                <form action={updateRole.bind(null, u.id, "admin")}>
                  <Button variant="outline" size="sm" className="border-blue-500/50 hover:bg-blue-500/10" disabled={u.role === 'admin'}>
                    Tornar Admin
                  </Button>
                </form>

                <form action={updateRole.bind(null, u.id, "master")}>
                  <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10" disabled={u.role === 'master'}>
                    Tornar Master
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {!usuarios?.length && (
        <div className="text-center p-10 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground italic">Nenhum usuário encontrado.</p>
        </div>
      )}
    </div>
  );
}