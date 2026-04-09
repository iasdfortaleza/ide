'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. GESTÃO DE ESTUDOS (PROGRESSO)
// ==========================================

export async function lancarEstudo(formData: FormData) {
  const supabase = await createClient()

  // Verificação de segurança
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const estudante_id = formData.get('estudante_id') as string
  const licao_id = formData.get('licao_id') as string
  const data_registro_raw = formData.get('data_registro') as string
  
  // Se o usuário não preencher a data no calendário, usamos a data de hoje
  const data_registro = data_registro_raw ? data_registro_raw : new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('progresso_estudo')
    .insert({
      estudante_id,
      licao_id,
      data_registro
    })

  if (error) {
    console.error("Erro ao lançar estudo:", error)
    throw new Error("Falha ao registrar o estudo.")
  }

  // Revalida para atualizar os dados na tela de lançamentos e no mural público
  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/', 'layout')
}

export async function editarLancamentoEstudo(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const id = formData.get('id') as string
  const licao_id = formData.get('licao_id') as string
  const data_registro = formData.get('data_registro') as string

  const { error } = await supabase
    .from('progresso_estudo')
    .update({
      licao_id,
      data_registro
    })
    .eq('id', id)

  if (error) {
    console.error("Erro ao editar estudo:", error)
    throw new Error("Falha ao atualizar o registro de estudo.")
  }

  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/', 'layout')
}

export async function excluirLancamentoEstudo(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const { error } = await supabase
    .from('progresso_estudo')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Erro ao excluir estudo:", error)
    throw new Error("Falha ao excluir o registro de estudo.")
  }

  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/', 'layout')
}

// ==========================================
// 2. GESTÃO DE VISITAS
// ==========================================

export async function lancarVisita(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const dupla_id = formData.get('dupla_id') as string
  const nome_visitado = formData.get('nome_visitado') as string
  const whatsapp = formData.get('whatsapp') as string
  const data_nascimento = formData.get('data_nascimento') as string
  const data_visita_raw = formData.get('data_visita') as string

  const data_visita = data_visita_raw ? data_visita_raw : new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('visitas')
    .insert({
      dupla_id,
      nome_visitado,
      whatsapp: whatsapp || null,
      data_nascimento: data_nascimento || null,
      data_visita
    })

  if (error) {
    console.error("Erro ao lançar visita:", error)
    throw new Error("Falha ao registrar a visita.")
  }

  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/', 'layout')
}

export async function editarVisita(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const id = formData.get('id') as string
  const nome_visitado = formData.get('nome_visitado') as string
  const whatsapp = formData.get('whatsapp') as string
  const data_visita = formData.get('data_visita') as string

  const { error } = await supabase
    .from('visitas')
    .update({
      nome_visitado,
      whatsapp: whatsapp || null,
      data_visita
    })
    .eq('id', id)

  if (error) {
    console.error("Erro ao editar visita:", error)
    throw new Error("Falha ao atualizar o registro de visita.")
  }

  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/', 'layout')
}

export async function excluirVisita(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const { error } = await supabase
    .from('visitas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Erro ao excluir visita:", error)
    throw new Error("Falha ao excluir o registro de visita.")
  }

  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/', 'layout')
}