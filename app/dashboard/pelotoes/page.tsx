import { createClient } from "@/utils/supabase/server";
import { criarPelotao, excluirPelotao } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Trash2, Image as ImageIcon, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

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
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Pelotões</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulário de Cadastro */}
        <div className="lg:col-span-1">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-md sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Novo Pelotão</CardTitle>
              <CardDescription>Cadastre um novo grupo missionário.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* O formulário chama a nossa Server Action diretamente */}
              <form action={criarPelotao} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Pelotão</Label>
                  <Input id="nome" name="nome" placeholder="Ex: Pelotão Ômega" required className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="igreja">Igreja (Local/Distrito)</Label>
                  <Input id="igreja" name="igreja" placeholder="Ex: IASD Central" required className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capitao_id">Capitão (Perfil Admin)</Label>
                  {/* CORREÇÃO DO ERRO DO CONSOLE AQUI */}
                  <select 
                    id="capitao_id" 
                    name="capitao_id" 
                    required
                    defaultValue="" 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Selecione um capitão...</option>
                    {possiveisCapitaes?.map(capitao => (
                      <option key={capitao.id} value={capitao.id}>
                        {capitao.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_capitao">WhatsApp do Capitão</Label>
                  <Input id="whatsapp_capitao" name="whatsapp_capitao" placeholder="(00) 00000-0000" className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem do Estandarte</Label>
                  <Input 
                    id="imagem" 
                    name="imagem" 
                    type="file" 
                    accept="image/*" 
                    required 
                    className="cursor-pointer file:text-primary file:font-bold file:mr-4 file:border-0 file:bg-primary/10 file:rounded-md file:px-2 file:py-1 hover:file:bg-primary/20"
                  />
                </div>

                <Button type="submit" className="w-full mt-4 font-bold shadow-md hover:shadow-primary/25">
                  Salvar Pelotão
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Lista de Pelotões Cadastrados */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight mb-4">Pelotões Ativos ({pelotoes?.length || 0})</h2>
          
          {pelotoes?.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/10">
              <Shield className="w-10 h-10 mb-2 opacity-20" />
              <p>Nenhum pelotão cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {pelotoes?.map((pelotao) => (
                <Card key={pelotao.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors bg-card/30">
                  <div className="h-32 bg-muted relative w-full flex items-center justify-center overflow-hidden border-b border-border/50">
                    {pelotao.url_imagem_estandarte ? (
                      <Image 
                        src={pelotao.url_imagem_estandarte} 
                        alt={`Estandarte ${pelotao.nome}`}
                        fill
                        className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <h3 className="absolute bottom-2 left-3 right-2 text-lg font-bold text-foreground drop-shadow-md">
                      {pelotao.nome}
                    </h3>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{pelotao.igreja}</span>
                    </div>
                    
                    <div className="bg-background/50 p-2 rounded-md border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Capitão</p>
                      <p className="text-sm font-medium">{pelotao.capitao?.nome || "Sem capitão"}</p>
                      {pelotao.whatsapp_capitao && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" /> {pelotao.whatsapp_capitao}
                        </p>
                      )}
                    </div>
                    
                    {/* Formulário inline para chamar a Server Action de Excluir */}
                    <form action={async () => {
                      "use server";
                      await excluirPelotao(pelotao.id);
                    }}>
                      <Button variant="destructive" size="sm" className="w-full gap-2 mt-2" type="submit">
                        <Trash2 className="w-4 h-4" /> Excluir Pelotão
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}