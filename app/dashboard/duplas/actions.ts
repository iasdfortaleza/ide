'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. AÇÕES DA DUPLA MISSIONÁRIA
// ==========================================

export async function criarDupla(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const nome_dupla = formData.get('nome_dupla') as string
  const pelotao_id = formData.get('pelotao_id') as string
  const foto = formData.get('foto') as File

  let url_foto_dupla = null

  // Lógica de Upload da Foto da Dupla
  if (foto && foto.size > 0) {
    const fileExt = foto.name.split('.').pop()
    const fileName = `duplas/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, foto, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error("Erro no upload da foto da dupla:", uploadError)
      throw new Error("Falha ao enviar a foto da dupla.")
    }

    const { data: publicUrlData } = supabase.storage
      .from('mural_imagens')
      .getPublicUrl(fileName)

    url_foto_dupla = publicUrlData.publicUrl
  }

  const { error: dbError } = await supabase
    .from('duplas')
    .insert({
      nome_dupla,
      pelotao_id,
      url_foto_dupla
    })

  if (dbError) {
    console.error("Erro ao salvar dupla no banco:", dbError)
    throw new Error("Falha ao cadastrar a dupla.")
  }

  revalidatePath('/dashboard/duplas')
}

export async function excluirDupla(id: string) {
  'use server'
  const supabase = await createClient()
  
  // O ON DELETE CASCADE vai apagar os membros e os estudantes vinculados automaticamente
  const { error } = await supabase.from('duplas').delete().eq('id', id)
  
  if (error) throw new Error("Falha ao excluir a dupla.")
  revalidatePath('/dashboard/duplas')
}

// ==========================================
// 2. AÇÕES DOS MEMBROS DA DUPLA
// ==========================================

export async function adicionarMembro(formData: FormData) {
  const supabase = await createClient()

  const dupla_id = formData.get('dupla_id') as string
  const nome = formData.get('nome') as string
  const whatsapp = formData.get('whatsapp') as string
  // data_nascimento é opcional no seu banco, então tratamos se vier vazia
  const data_nascimento_raw = formData.get('data_nascimento') as string
  const data_nascimento = data_nascimento_raw ? data_nascimento_raw : null

  const { error } = await supabase
    .from('membros_dupla')
    .insert({
      dupla_id,
      nome,
      whatsapp,
      data_nascimento
    })

  if (error) {
    console.error("Erro ao adicionar membro:", error)
    throw new Error("Falha ao adicionar o membro à dupla.")
  }

  revalidatePath('/dashboard/duplas')
}

export async function excluirMembro(id: string) {
  'use server'
  const supabase = await createClient()
  const { error } = await supabase.from('membros_dupla').delete().eq('id', id)
  if (error) throw new Error("Falha ao excluir o membro.")
  revalidatePath('/dashboard/duplas')
}

// ==========================================
// 3. AÇÕES DOS ESTUDANTES (PESSOAS RECEBENDO ESTUDO)
// ==========================================

export async function adicionarEstudante(formData: FormData) {
  const supabase = await createClient()

  const dupla_id = formData.get('dupla_id') as string
  const nome_pessoa = formData.get('nome_pessoa') as string
  const estudo_biblico_id = formData.get('estudo_biblico_id') as string

  const { error } = await supabase
    .from('estudantes')
    .insert({
      dupla_id,
      nome_pessoa,
      estudo_biblico_id: estudo_biblico_id ? estudo_biblico_id : null, // Pode começar sem material definido
      status: 'ativo'
    })

  if (error) {
    console.error("Erro ao cadastrar estudante:", error)
    throw new Error("Falha ao cadastrar a pessoa interessada.")
  }

  revalidatePath('/dashboard/duplas')
}

export async function excluirEstudante(id: string) {
  'use server'
  const supabase = await createClient()
  const { error } = await supabase.from('estudantes').delete().eq('id', id)
  if (error) throw new Error("Falha ao excluir o estudante.")
  revalidatePath('/dashboard/duplas')
}