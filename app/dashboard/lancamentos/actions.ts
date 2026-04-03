'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. LANÇAMENTO DE ESTUDOS (PROGRESSO)
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

  revalidatePath('/dashboard/lancamentos')
}

export async function excluirLancamentoEstudo(id: string) {
  'use server'
  const supabase = await createClient()
  const { error } = await supabase.from('progresso_estudo').delete().eq('id', id)
  if (error) throw new Error("Falha ao excluir o registro de estudo.")
  revalidatePath('/dashboard/lancamentos')
}

// ==========================================
// 2. LANÇAMENTO DE VISITAS
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

  // Se não preencher a data da visita, usa a data atual
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
}

export async function excluirVisita(id: string) {
  'use server'
  const supabase = await createClient()
  const { error } = await supabase.from('visitas').delete().eq('id', id)
  if (error) throw new Error("Falha ao excluir o registro de visita.")
  revalidatePath('/dashboard/lancamentos')
}