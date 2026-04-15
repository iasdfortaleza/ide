'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Função auxiliar para extrair o ID do YouTube de vários formatos de link
function extrairIdYoutube(url: string): string | null {
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
  if (!user) return { success: false, message: "Usuário não autenticado." }

  // 2. Verifica se o usuário é MASTER (Segurança no Backend)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'master') {
    return { success: false, message: "Acesso negado. Apenas usuários Master podem cadastrar aulas." }
  }

  // 3. Coleta os dados do formulário
  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const url_youtube = formData.get('url_youtube') as string

  // 4. Extrai o ID do YouTube
  const youtube_id = extrairIdYoutube(url_youtube)
  
  if (!youtube_id) {
    return { success: false, message: "Link do YouTube inválido. Verifique a URL e tente novamente." }
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
    return { success: false, message: "Falha ao cadastrar a aula no sistema." }
  }

  // 6. Atualiza a página
  revalidatePath('/dashboard/aulas')
  return { success: true, message: "Aula cadastrada com sucesso!" }
}

// ==========================================
// 2. EXCLUIR AULA (Apenas Master)
// ==========================================
export async function excluirAula(id: string) {
  const supabase = await createClient()
  
  // 1. Verifica Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  // 2. Verifica Segurança
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'master') {
    return { success: false, message: "Acesso negado para exclusão." }
  }

  // 3. Deleta a aula
  const { error } = await supabase
    .from('aulas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Erro ao excluir aula:", error)
    return { success: false, message: "Falha ao remover a aula." }
  }

  revalidatePath('/dashboard/aulas')
  return { success: true, message: "Aula removida com sucesso!" }
}