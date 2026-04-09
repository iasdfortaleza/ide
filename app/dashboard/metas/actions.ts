'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Função auxiliar para verificar se é master
async function checkMaster(supabase: any, userId: string) {
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', userId)
    .single()

  if (perfil?.role !== 'master') {
    throw new Error("Acesso negado. Apenas o perfil Master pode alterar as metas da igreja.")
  }
}

// ==========================================
// 1. SALVAR (NOVA META)
// ==========================================
export async function salvarMeta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")
  await checkMaster(supabase, user.id)

  const pelotao_id = formData.get('pelotao_id') as string
  const ano = parseInt(formData.get('ano') as string)
  const alvo_anual = parseInt(formData.get('alvo_anual') as string)
  const alvo_alcancado = parseInt(formData.get('alvo_alcancado') as string)

  if (!pelotao_id) throw new Error("Pelotão não selecionado.")
  if (isNaN(ano) || isNaN(alvo_anual) || isNaN(alvo_alcancado)) {
    throw new Error("Valores inválidos preenchidos no formulário.")
  }

  const { data: metaExistente } = await supabase
    .from('metas')
    .select('id')
    .eq('ano', ano)
    .eq('pelotao_id', pelotao_id)
    .single()

  if (metaExistente) {
    const { error: updateError } = await supabase.from('metas')
      .update({ alvo_anual, alvo_alcancado }).eq('id', metaExistente.id)
    if (updateError) throw new Error("Falha ao atualizar a meta existente.")
  } else {
    const { error: insertError } = await supabase.from('metas')
      .insert({ ano, pelotao_id, alvo_anual, alvo_alcancado })
    if (insertError) throw new Error("Falha ao criar uma nova meta.")
  }

  revalidatePath('/dashboard/metas')
  revalidatePath('/', 'layout') 
}

// ==========================================
// 2. EDITAR META EXISTENTE (VIA CARD)
// ==========================================
export async function editarMeta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")
  await checkMaster(supabase, user.id)

  const id = formData.get('id') as string
  const pelotao_id = formData.get('pelotao_id') as string
  const ano = parseInt(formData.get('ano') as string)
  const alvo_anual = parseInt(formData.get('alvo_anual') as string)
  const alvo_alcancado = parseInt(formData.get('alvo_alcancado') as string)

  if (!pelotao_id) throw new Error("Pelotão não selecionado.")
  if (isNaN(ano) || isNaN(alvo_anual) || isNaN(alvo_alcancado)) {
    throw new Error("Valores inválidos preenchidos no formulário.")
  }

  const { error } = await supabase
    .from('metas')
    .update({ ano, pelotao_id, alvo_anual, alvo_alcancado })
    .eq('id', id)

  if (error) {
    console.error("Erro ao editar meta:", error)
    throw new Error("Falha ao editar a meta.")
  }

  revalidatePath('/dashboard/metas')
  revalidatePath('/', 'layout') 
}

// ==========================================
// 3. EXCLUIR META
// ==========================================
export async function excluirMeta(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")
  await checkMaster(supabase, user.id)

  const { error } = await supabase.from('metas').delete().eq('id', id)

  if (error) {
    console.error("Erro ao excluir meta:", error)
    throw new Error("Falha ao excluir a meta.")
  }

  revalidatePath('/dashboard/metas')
  revalidatePath('/', 'layout') 
}