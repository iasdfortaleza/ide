'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Função auxiliar para verificar se é master
async function checkMaster(supabase: any, userId: string): Promise<boolean> {
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', userId)
    .single()

  return perfil?.role === 'master';
}

// ==========================================
// 1. ATUALIZAR PERMISSÃO DE USUÁRIO (ROLE)
// ==========================================
export async function updateRole(id: string, newRole: string) {
  const supabase = await createClient()
  
  // 1. Verifica se quem está clicando está logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }
  
  // 2. Verifica se quem está clicando tem poder de Master
  const isMaster = await checkMaster(supabase, user.id)
  if (!isMaster) return { success: false, message: "Acesso negado. Apenas o perfil Master pode alterar permissões." }

  // Evita que o usuário altere a própria permissão e acabe se bloqueando para fora do sistema
  if (user.id === id) {
    return { success: false, message: "Você não pode alterar sua própria permissão de acesso." }
  }

  // 3. Atualiza a permissão no banco
  const { error } = await supabase
    .from("perfis")
    .update({ role: newRole })
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar permissão:", error)
    return { success: false, message: "Falha ao alterar o nível de acesso do usuário." }
  }

  // 4. Atualiza a tela
  revalidatePath("/dashboard/usuarios")
  revalidatePath("/", "layout")
  
  const roleName = newRole === 'master' ? 'Master' : newRole === 'admin' ? 'Admin' : 'Padrão';
  return { success: true, message: `Permissão atualizada para ${roleName} com sucesso!` }
}