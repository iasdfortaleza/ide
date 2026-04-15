'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// AÇÕES PARA O ESTUDO (LIVRO/CAPA)
// ==========================================

export async function criarEstudo(formData: FormData) {
  const supabase = await createClient()

  // 1. Verificação de segurança
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const nome_estudo = formData.get('nome_estudo') as string
  const capa = formData.get('capa') as File

  let url_capa: string | null = null

  // 2. Upload da Capa para o Supabase Storage (se enviada)
  if (capa && capa.size > 0) {
    const fileExt = capa.name.split('.').pop()
    const fileName = `estudos/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, capa, { cacheControl: '3600', upsert: false })

    if (uploadError) return { success: false, message: "Falha ao enviar a imagem da capa." }

    const { data: publicUrlData } = supabase.storage.from('mural_imagens').getPublicUrl(fileName)
    url_capa = publicUrlData.publicUrl
  }

  // 3. Insere na tabela 'estudos_biblicos'
  const { error: dbError } = await supabase.from('estudos_biblicos').insert({ nome_estudo, url_capa })

  if (dbError) return { success: false, message: "Falha ao cadastrar o estudo bíblico no sistema." }
  
  revalidatePath('/dashboard/estudos')
  return { success: true, message: "Estudo bíblico cadastrado com sucesso!" }
}

export async function editarEstudo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const id = formData.get('id') as string
  const nome_estudo = formData.get('nome_estudo') as string
  const capa = formData.get('capa') as File
  const capa_atual = formData.get('capa_atual') as string
  const remover_capa = formData.get('remover_capa') === 'true'

  let url_capa: string | null = capa_atual || null

  // 1. Se marcou a caixinha de remover a capa, apagamos do servidor
  if (remover_capa) {
    if (capa_atual) {
      const velhaFileName = capa_atual.split('/').pop()
      if (velhaFileName) await supabase.storage.from('mural_imagens').remove([`estudos/${velhaFileName}`])
    }
    url_capa = null
  } 
  // 2. Se o usuário enviou uma nova foto, fazemos o upload e DELETAMOS a antiga
  else if (capa && capa.size > 0) {
    const fileExt = capa.name.split('.').pop()
    const fileName = `estudos/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, capa, { cacheControl: '3600', upsert: false })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('mural_imagens').getPublicUrl(fileName)
      url_capa = publicUrlData.publicUrl

      // Exclui a capa antiga
      if (capa_atual) {
        const velhaFileName = capa_atual.split('/').pop()
        if (velhaFileName) await supabase.storage.from('mural_imagens').remove([`estudos/${velhaFileName}`])
      }
    }
  }

  const { error } = await supabase
    .from('estudos_biblicos')
    .update({ nome_estudo, url_capa })
    .eq('id', id)

  if (error) return { success: false, message: "Falha ao atualizar os dados do estudo." }
  
  revalidatePath('/dashboard/estudos')
  return { success: true, message: "Informações do estudo atualizadas!" }
}

export async function excluirEstudo(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  // Primeiro busca a URL da capa
  const { data: estudo } = await supabase.from('estudos_biblicos').select('url_capa').eq('id', id).single()

  // Deleta o registro (as lições sumirão via ON DELETE CASCADE)
  const { error } = await supabase.from('estudos_biblicos').delete().eq('id', id)
  
  // Se foi deletado com sucesso e tinha capa, exclui do Storage
  if (!error && estudo?.url_capa) {
    const fileName = estudo.url_capa.split('/').pop()
    if (fileName) await supabase.storage.from('mural_imagens').remove([`estudos/${fileName}`])
  }

  if (error) return { success: false, message: "Falha ao excluir o estudo. Pode haver dados dependentes." }
  
  revalidatePath('/dashboard/estudos')
  return { success: true, message: "Estudo excluído com sucesso!" }
}


// ==========================================
// AÇÕES PARA AS LIÇÕES DO ESTUDO
// ==========================================

export async function adicionarLicao(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const estudo_biblico_id = formData.get('estudo_biblico_id') as string
  const numero_licao = parseInt(formData.get('numero_licao') as string)
  const titulo_licao = formData.get('titulo_licao') as string

  const { error } = await supabase.from('licoes').insert({ estudo_biblico_id, numero_licao, titulo_licao })

  if (error) return { success: false, message: "Falha ao adicionar a lição ao estudo." }
  
  revalidatePath('/dashboard/estudos')
  return { success: true, message: "Lição adicionada com sucesso!" }
}

export async function editarLicao(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const id = formData.get('id') as string
  const numero_licao = parseInt(formData.get('numero_licao') as string)
  const titulo_licao = formData.get('titulo_licao') as string

  const { error } = await supabase.from('licoes').update({ numero_licao, titulo_licao }).eq('id', id)

  if (error) return { success: false, message: "Falha ao atualizar os dados da lição." }
  
  revalidatePath('/dashboard/estudos')
  return { success: true, message: "Lição atualizada com sucesso!" }
}

export async function excluirLicao(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Usuário não autenticado." }

  const { error } = await supabase.from('licoes').delete().eq('id', id)
  
  if (error) return { success: false, message: "Falha ao excluir a lição. Pode haver registros dependentes." }
  
  revalidatePath('/dashboard/estudos')
  return { success: true, message: "Lição excluída com sucesso!" }
}