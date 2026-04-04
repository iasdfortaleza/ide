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

  // CORREÇÃO TYPESCRIPT: Avisar que a variável pode ser nula ou string
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

export async function editarDupla(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const id = formData.get('id') as string
  const nome_dupla = formData.get('nome_dupla') as string
  const pelotao_id = formData.get('pelotao_id') as string
  const foto = formData.get('foto') as File
  const foto_atual = formData.get('foto_atual') as string
  const remover_foto = formData.get('remover_foto') === 'true' // Lógica do checkbox de remoção

  // CORREÇÃO TYPESCRIPT: Avisar que a variável pode ser nula ou string
  let url_foto_dupla: string | null = foto_atual || null 

  // 1. Se marcou a caixinha de remover a foto, apagamos do servidor e limpamos a URL
  if (remover_foto) {
    if (foto_atual) {
      const velhaFileName = foto_atual.split('/').pop()
      if (velhaFileName) {
        await supabase.storage.from('mural_imagens').remove([`duplas/${velhaFileName}`])
      }
    }
    url_foto_dupla = null
  } 
  // 2. Se o usuário enviou uma nova foto, fazemos o upload e DELETAMOS a antiga
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

      // Exclui a foto antiga para não gastar espaço
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

  if (error) throw new Error("Falha ao editar a dupla.")
  revalidatePath('/dashboard/duplas')
}

export async function excluirDupla(id: string) {
  'use server'
  const supabase = await createClient()
  
  // Primeiro, busca a dupla para saber qual é a URL da foto dela
  const { data: dupla } = await supabase.from('duplas').select('url_foto_dupla').eq('id', id).single()

  // Deleta do banco de dados (o ON DELETE CASCADE já limpa os membros e estudantes)
  const { error } = await supabase.from('duplas').delete().eq('id', id)
  
  // Se a dupla for deletada do banco com sucesso e tiver uma foto, deleta a foto do Storage
  if (!error && dupla?.url_foto_dupla) {
    const fileName = dupla.url_foto_dupla.split('/').pop()
    if (fileName) {
      await supabase.storage.from('mural_imagens').remove([`duplas/${fileName}`])
    }
  }

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
  const endereco = formData.get('endereco') as string
  
  const data_nascimento_raw = formData.get('data_nascimento') as string
  const data_nascimento = data_nascimento_raw ? data_nascimento_raw : null

  const { error } = await supabase
    .from('membros_dupla')
    .insert({ dupla_id, nome, whatsapp, endereco, data_nascimento })

  if (error) throw new Error("Falha ao adicionar o membro à dupla.")
  revalidatePath('/dashboard/duplas')
}

export async function editarMembro(formData: FormData) {
  const supabase = await createClient()
  
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

  if (error) throw new Error("Falha ao editar o membro da dupla.")
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

  if (error) throw new Error("Falha ao cadastrar a pessoa interessada.")
  revalidatePath('/dashboard/duplas')
}

export async function editarEstudante(formData: FormData) {
  const supabase = await createClient()
  
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

  if (error) throw new Error("Falha ao editar o estudante.")
  revalidatePath('/dashboard/duplas')
}

export async function excluirEstudante(id: string) {
  'use server'
  const supabase = await createClient()
  const { error } = await supabase.from('estudantes').delete().eq('id', id)
  if (error) throw new Error("Falha ao excluir o estudante.")
  revalidatePath('/dashboard/duplas')
}