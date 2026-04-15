'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Função auxiliar para verificar se é master (Agora retorna boolean em vez de throw)
async function checkMaster(supabase: any, userId: string): Promise<boolean> {
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', userId)
    .single()

  return perfil?.role === 'master';
}

// ==========================================
// 1. SALVAR (NOVA META / ATUALIZAR EXISTENTE)
// ==========================================
export async function salvarMeta(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }
  
  const isMaster = await checkMaster(supabase, user.id)
  if (!isMaster) return { success: false, message: "Acesso negado. Apenas o perfil Master pode alterar metas." }

  const pelotao_id = formData.get('pelotao_id') as string
  const ano = parseInt(formData.get('ano') as string)
  const alvo_anual = parseInt(formData.get('alvo_anual') as string)
  const alvo_alcancado = parseInt(formData.get('alvo_alcancado') as string)

  if (!pelotao_id) return { success: false, message: "Pelotão não selecionado." }
  if (isNaN(ano) || isNaN(alvo_anual) || isNaN(alvo_alcancado)) {
    return { success: false, message: "Valores numéricos inválidos preenchidos no formulário." }
  }

  // Verifica se já existe uma meta para este pelotão neste ano
  const { data: metaExistente } = await supabase
    .from('metas')
    .select('id')
    .eq('ano', ano)
    .eq('pelotao_id', pelotao_id)
    .single()

  let actionMessage = "";

  if (metaExistente) {
    const { error: updateError } = await supabase.from('metas')
      .update({ alvo_anual, alvo_alcancado }).eq('id', metaExistente.id)
    if (updateError) return { success: false, message: "Falha ao atualizar a meta já existente." }
    actionMessage = "Meta existente atualizada com sucesso!";
  } else {
    const { error: insertError } = await supabase.from('metas')
      .insert({ ano, pelotao_id, alvo_anual, alvo_alcancado })
    if (insertError) return { success: false, message: "Falha ao registrar a nova meta." }
    actionMessage = "Nova meta registrada com sucesso!";
  }

  revalidatePath('/dashboard/metas')
  revalidatePath('/', 'layout') 
  return { success: true, message: actionMessage }
}

// ==========================================
// 2. EDITAR META EXISTENTE (VIA CARD)
// ==========================================
export async function editarMeta(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }
  
  const isMaster = await checkMaster(supabase, user.id)
  if (!isMaster) return { success: false, message: "Acesso negado. Apenas o perfil Master pode alterar metas." }

  const id = formData.get('id') as string
  const pelotao_id = formData.get('pelotao_id') as string
  const ano = parseInt(formData.get('ano') as string)
  const alvo_anual = parseInt(formData.get('alvo_anual') as string)
  const alvo_alcancado = parseInt(formData.get('alvo_alcancado') as string)

  if (!pelotao_id) return { success: false, message: "Pelotão não selecionado." }
  if (isNaN(ano) || isNaN(alvo_anual) || isNaN(alvo_alcancado)) {
    return { success: false, message: "Valores numéricos inválidos preenchidos no formulário." }
  }

  const { error } = await supabase
    .from('metas')
    .update({ ano, pelotao_id, alvo_anual, alvo_alcancado })
    .eq('id', id)

  if (error) {
    console.error("Erro ao editar meta:", error)
    return { success: false, message: "Falha ao editar a meta no banco de dados." }
  }

  revalidatePath('/dashboard/metas')
  revalidatePath('/', 'layout') 
  return { success: true, message: "Meta alterada com sucesso!" }
}

// ==========================================
// 3. EXCLUIR META
// ==========================================
export async function excluirMeta(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }
  
  const isMaster = await checkMaster(supabase, user.id)
  if (!isMaster) return { success: false, message: "Acesso negado. Apenas o perfil Master pode excluir metas." }

  const { error } = await supabase.from('metas').delete().eq('id', id)

  if (error) {
    console.error("Erro ao excluir meta:", error)
    return { success: false, message: "Falha ao excluir a meta." }
  }

  revalidatePath('/dashboard/metas')
  revalidatePath('/', 'layout') 
  return { success: true, message: "Meta excluída com sucesso!" }
}