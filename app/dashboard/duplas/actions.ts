'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. AÇÕES DA DUPLA MISSIONÁRIA
// ==========================================

export async function criarDupla(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const nome_dupla = formData.get('nome_dupla') as string
  const pelotao_id = formData.get('pelotao_id') as string
  const foto = formData.get('foto') as File

  let url_foto_dupla: string | null = null

  // Lógica de Upload da Foto da Dupla
  if (foto && foto.size > 0) {
    const fileExt = foto.name.split('.').pop()
    const fileName = `duplas/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, foto, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error("Erro no upload da foto da dupla:", uploadError)
      return { success: false, message: "Falha ao enviar a foto da dupla." }
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
    return { success: false, message: "Falha ao cadastrar a dupla." }
  }

  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Dupla criada com sucesso!" }
}

export async function editarDupla(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const id = formData.get('id') as string
  const nome_dupla = formData.get('nome_dupla') as string
  const pelotao_id = formData.get('pelotao_id') as string
  const foto = formData.get('foto') as File
  const foto_atual = formData.get('foto_atual') as string
  const remover_foto = formData.get('remover_foto') === 'true'

  let url_foto_dupla: string | null = foto_atual || null 

  if (remover_foto) {
    if (foto_atual) {
      const velhaFileName = foto_atual.split('/').pop()
      if (velhaFileName) {
        await supabase.storage.from('mural_imagens').remove([`duplas/${velhaFileName}`])
      }
    }
    url_foto_dupla = null
  } 
  else if (foto && foto.size > 0) {
    const fileExt = foto.name.split('.').pop()
    const fileName = `duplas/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, foto, { cacheControl: '3600', upsert: false })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('mural_imagens')
        .getPublicUrl(fileName)
      url_foto_dupla = publicUrlData.publicUrl

      if (foto_atual) {
        const velhaFileName = foto_atual.split('/').pop()
        if (velhaFileName) {
          await supabase.storage.from('mural_imagens').remove([`duplas/${velhaFileName}`])
        }
      }
    }
  }

  const { error } = await supabase
    .from('duplas')
    .update({ nome_dupla, pelotao_id, url_foto_dupla })
    .eq('id', id)

  if (error) {
    console.error("Erro ao editar dupla:", error)
    return { success: false, message: "Falha ao editar a dupla." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Dupla atualizada com sucesso!" }
}

export async function excluirDupla(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }
  
  const { data: dupla } = await supabase.from('duplas').select('url_foto_dupla').eq('id', id).single()

  const { error } = await supabase.from('duplas').delete().eq('id', id)
  
  if (!error && dupla?.url_foto_dupla) {
    const fileName = dupla.url_foto_dupla.split('/').pop()
    if (fileName) {
      await supabase.storage.from('mural_imagens').remove([`duplas/${fileName}`])
    }
  }

  if (error) {
    console.error("Erro ao excluir dupla:", error)
    return { success: false, message: "Falha ao excluir a dupla." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Dupla excluída com sucesso!" }
}

// ==========================================
// 2. AÇÕES DOS MEMBROS DA DUPLA
// ==========================================

export async function adicionarMembro(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const dupla_id = formData.get('dupla_id') as string
  const nome = formData.get('nome') as string
  const whatsapp = formData.get('whatsapp') as string
  const endereco = formData.get('endereco') as string
  
  const data_nascimento_raw = formData.get('data_nascimento') as string
  const data_nascimento = data_nascimento_raw ? data_nascimento_raw : null

  const { error } = await supabase
    .from('membros_dupla')
    .insert({ dupla_id, nome, whatsapp, endereco, data_nascimento })

  if (error) {
    console.error("Erro ao adicionar membro:", error)
    return { success: false, message: "Falha ao adicionar o membro à dupla." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Membro adicionado com sucesso!" }
}

export async function editarMembro(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }
  
  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const whatsapp = formData.get('whatsapp') as string
  const endereco = formData.get('endereco') as string
  
  const data_nascimento_raw = formData.get('data_nascimento') as string
  const data_nascimento = data_nascimento_raw ? data_nascimento_raw : null

  const { error } = await supabase
    .from('membros_dupla')
    .update({ nome, whatsapp, endereco, data_nascimento })
    .eq('id', id)

  if (error) {
    console.error("Erro ao editar membro:", error)
    return { success: false, message: "Falha ao editar o membro da dupla." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Membro atualizado com sucesso!" }
}

export async function excluirMembro(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const { error } = await supabase.from('membros_dupla').delete().eq('id', id)
  
  if (error) {
    console.error("Erro ao excluir membro:", error)
    return { success: false, message: "Falha ao excluir o membro." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Membro excluído com sucesso!" }
}

// ==========================================
// 3. AÇÕES DOS ESTUDANTES (PESSOAS RECEBENDO ESTUDO)
// ==========================================

export async function adicionarEstudante(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const dupla_id = formData.get('dupla_id') as string
  const nome_pessoa = formData.get('nome_pessoa') as string
  const estudo_biblico_id = formData.get('estudo_biblico_id') as string
  const telefone = formData.get('telefone') as string
  const endereco = formData.get('endereco') as string
  
  const data_nascimento_raw = formData.get('data_nascimento') as string
  const data_nascimento = data_nascimento_raw ? data_nascimento_raw : null

  const { error } = await supabase
    .from('estudantes')
    .insert({
      dupla_id,
      nome_pessoa,
      estudo_biblico_id: estudo_biblico_id ? estudo_biblico_id : null,
      telefone,
      endereco,
      data_nascimento,
      status: 'ativo'
    })

  if (error) {
    console.error("Erro ao adicionar estudante:", error)
    return { success: false, message: "Falha ao cadastrar a pessoa interessada." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Estudante adicionado com sucesso!" }
}

export async function editarEstudante(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }
  
  const id = formData.get('id') as string
  const nome_pessoa = formData.get('nome_pessoa') as string
  const estudo_biblico_id = formData.get('estudo_biblico_id') as string
  const telefone = formData.get('telefone') as string
  const endereco = formData.get('endereco') as string
  
  const data_nascimento_raw = formData.get('data_nascimento') as string
  const data_nascimento = data_nascimento_raw ? data_nascimento_raw : null

  const { error } = await supabase
    .from('estudantes')
    .update({
      nome_pessoa,
      estudo_biblico_id: estudo_biblico_id ? estudo_biblico_id : null,
      telefone,
      endereco,
      data_nascimento
    })
    .eq('id', id)

  if (error) {
    console.error("Erro ao editar estudante:", error)
    return { success: false, message: "Falha ao editar o estudante." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Estudante atualizado com sucesso!" }
}

export async function excluirEstudante(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const { error } = await supabase.from('estudantes').delete().eq('id', id)
  
  if (error) {
    console.error("Erro ao excluir estudante:", error)
    return { success: false, message: "Falha ao excluir o estudante." }
  }
  
  revalidatePath('/dashboard/duplas')
  return { success: true, message: "Estudante excluído com sucesso!" }
}