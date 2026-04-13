'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Função auxiliar para extrair o ID do YouTube de vários formatos de link
function extrairIdYoutube(url: string): string | null {
  // Regex para capturar IDs de 11 caracteres de URLs padrão, youtu.be, embed, e shorts
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})/;
  const match = url.match(regex);
  return (match && match[1]) ? match[1] : null;
}

// ==========================================
// 1. ADICIONAR NOVA AULA (Apenas Master)
// ==========================================
export async function adicionarAula(formData: FormData) {
  const supabase = await createClient()

  // 1. Verifica Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  // 2. Verifica se o usuário é MASTER (Segurança no Backend)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'master') {
    throw new Error("Acesso negado. Apenas o perfil Master pode cadastrar aulas.")
  }

  // 3. Coleta os dados do formulário
  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const url_youtube = formData.get('url_youtube') as string

  // 4. Extrai o ID do YouTube
  const youtube_id = extrairIdYoutube(url_youtube)
  
  if (!youtube_id) {
    throw new Error("Link do YouTube inválido. Verifique o link e tente novamente.")
  }

  // 5. Salva no banco de dados
  const { error } = await supabase
    .from('aulas')
    .insert({
      titulo,
      descricao: descricao || null,
      youtube_id
    })

  if (error) {
    console.error("Erro ao salvar aula:", error)
    throw new Error("Falha ao cadastrar a aula.")
  }

  // 6. Atualiza a página para mostrar a nova aula
  revalidatePath('/dashboard/aulas')
}

// ==========================================
// 2. EXCLUIR AULA (Apenas Master)
// ==========================================
export async function excluirAula(id: string) {
  const supabase = await createClient()
  
  // 1. Verifica Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  // 2. Verifica Segurança
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'master') {
    throw new Error("Acesso negado.")
  }

  // 3. Deleta a aula
  const { error } = await supabase
    .from('aulas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Erro ao excluir aula:", error)
    throw new Error("Falha ao excluir a aula.")
  }

  revalidatePath('/dashboard/aulas')
}