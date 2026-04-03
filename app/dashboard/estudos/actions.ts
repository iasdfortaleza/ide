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
  if (!user) throw new Error("Usuário não autenticado")

  const nome_estudo = formData.get('nome_estudo') as string
  const capa = formData.get('capa') as File

  let url_capa = null

  // 2. Upload da Capa para o Supabase Storage (se enviada)
  if (capa && capa.size > 0) {
    const fileExt = capa.name.split('.').pop()
    // Nome único gerado para não sobrescrever capas antigas
    const fileName = `estudos/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, capa, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error("Erro no upload da capa:", uploadError)
      throw new Error("Falha ao enviar a imagem da capa.")
    }

    // Pega a URL pública para salvar no banco
    const { data: publicUrlData } = supabase.storage
      .from('mural_imagens')
      .getPublicUrl(fileName)

    url_capa = publicUrlData.publicUrl
  }

  // 3. Insere na tabela 'estudos_biblicos'
  const { error: dbError } = await supabase
    .from('estudos_biblicos')
    .insert({
      nome_estudo,
      url_capa
    })

  if (dbError) {
    console.error("Erro ao salvar estudo no banco:", dbError)
    throw new Error("Falha ao cadastrar o estudo bíblico.")
  }

  revalidatePath('/dashboard/estudos')
}

export async function excluirEstudo(id: string) {
  'use server'
  const supabase = await createClient()
  
  // O banco já tem ON DELETE CASCADE, então as lições desse estudo sumirão junto!
  const { error } = await supabase.from('estudos_biblicos').delete().eq('id', id)
  
  if (error) {
    console.error("Erro ao excluir estudo:", error)
    throw new Error("Falha ao excluir o estudo.")
  }

  revalidatePath('/dashboard/estudos')
}


// ==========================================
// AÇÕES PARA AS LIÇÕES DO ESTUDO
// ==========================================

export async function adicionarLicao(formData: FormData) {
  const supabase = await createClient()

  const estudo_biblico_id = formData.get('estudo_biblico_id') as string
  const numero_licao = parseInt(formData.get('numero_licao') as string)
  const titulo_licao = formData.get('titulo_licao') as string

  const { error } = await supabase
    .from('licoes')
    .insert({
      estudo_biblico_id,
      numero_licao,
      titulo_licao
    })

  if (error) {
    console.error("Erro ao adicionar lição:", error)
    throw new Error("Falha ao adicionar a lição.")
  }

  revalidatePath('/dashboard/estudos')
}

export async function excluirLicao(id: string) {
  'use server'
  const supabase = await createClient()
  
  const { error } = await supabase.from('licoes').delete().eq('id', id)
  
  if (error) {
    console.error("Erro ao excluir lição:", error)
    throw new Error("Falha ao excluir a lição.")
  }

  revalidatePath('/dashboard/estudos')
}