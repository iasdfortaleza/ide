'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. CRIAR PELOTÃO
// ==========================================
export async function criarPelotao(formData: FormData) {
  const supabase = await createClient()

  // 1. Verificação de segurança: Garantir que o usuário está logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  // 2. Extraindo os dados que o usuário digitou no formulário
  const nome = formData.get('nome') as string
  const igreja = formData.get('igreja') as string
  const capitao_id = formData.get('capitao_id') as string
  const whatsapp_capitao = formData.get('whatsapp_capitao') as string
  
  // O arquivo de imagem recebido do input type="file"
  const imagem = formData.get('imagem') as File

  let url_imagem_estandarte: string | null = null

  // 3. Lógica de Upload para o Supabase Storage (Se o usuário enviou uma foto)
  if (imagem && imagem.size > 0) {
    const fileExt = imagem.name.split('.').pop()
    const fileName = `estandartes/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, imagem, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error("Erro no upload da imagem:", uploadError)
      throw new Error("Falha ao enviar o estandarte.")
    }

    const { data: publicUrlData } = supabase.storage
      .from('mural_imagens')
      .getPublicUrl(fileName)

    url_imagem_estandarte = publicUrlData.publicUrl
  }

  // 4. Salvar tudo na nossa tabela 'pelotoes'
  const { error: dbError } = await supabase
    .from('pelotoes')
    .insert({
      nome,
      igreja,
      capitao_id: capitao_id ? capitao_id : null, 
      whatsapp_capitao,
      url_imagem_estandarte
    })

  if (dbError) {
    console.error("Erro ao salvar no banco:", dbError)
    throw new Error("Falha ao cadastrar o pelotão no banco de dados.")
  }

  revalidatePath('/dashboard/pelotoes')
}


// ==========================================
// 2. EDITAR PELOTÃO
// ==========================================
export async function editarPelotao(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const id = formData.get('id') as string
  const nome = formData.get('nome') as string
  const igreja = formData.get('igreja') as string
  const capitao_id = formData.get('capitao_id') as string
  const whatsapp_capitao = formData.get('whatsapp_capitao') as string
  
  const imagem = formData.get('imagem') as File
  const imagem_atual = formData.get('imagem_atual') as string
  const remover_imagem = formData.get('remover_imagem') === 'true'

  let url_imagem_estandarte: string | null = imagem_atual || null

  // 1. Se marcou a caixinha de remover a imagem, apagamos do servidor
  if (remover_imagem) {
    if (imagem_atual) {
      const velhaFileName = imagem_atual.split('/').pop()
      if (velhaFileName) {
        await supabase.storage.from('mural_imagens').remove([`estandartes/${velhaFileName}`])
      }
    }
    url_imagem_estandarte = null
  } 
  // 2. Se o usuário enviou uma nova foto, fazemos o upload e DELETAMOS a antiga
  else if (imagem && imagem.size > 0) {
    const fileExt = imagem.name.split('.').pop()
    const fileName = `estandartes/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, imagem, { cacheControl: '3600', upsert: false })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('mural_imagens')
        .getPublicUrl(fileName)
      url_imagem_estandarte = publicUrlData.publicUrl

      // Exclui a foto antiga
      if (imagem_atual) {
        const velhaFileName = imagem_atual.split('/').pop()
        if (velhaFileName) {
          await supabase.storage.from('mural_imagens').remove([`estandartes/${velhaFileName}`])
        }
      }
    }
  }

  const { error } = await supabase
    .from('pelotoes')
    .update({ 
      nome, 
      igreja, 
      capitao_id: capitao_id ? capitao_id : null, 
      whatsapp_capitao, 
      url_imagem_estandarte 
    })
    .eq('id', id)

  if (error) throw new Error("Falha ao editar o pelotão.")
  revalidatePath('/dashboard/pelotoes')
}


// ==========================================
// 3. EXCLUIR PELOTÃO
// ==========================================
export async function excluirPelotao(id: string) {
  'use server'
  const supabase = await createClient()
  
  // 1. Busca o pelotão para saber qual é a URL do estandarte dele
  const { data: pelotao } = await supabase.from('pelotoes').select('url_imagem_estandarte').eq('id', id).single()

  // 2. Exclui o registro (o ON DELETE CASCADE nas outras tabelas limpará as duplas vinculadas)
  const { error } = await supabase.from('pelotoes').delete().eq('id', id)
  
  // 3. Se foi deletado com sucesso e tinha um estandarte, deleta a foto do Storage
  if (!error && pelotao?.url_imagem_estandarte) {
    const fileName = pelotao.url_imagem_estandarte.split('/').pop()
    if (fileName) {
      await supabase.storage.from('mural_imagens').remove([`estandartes/${fileName}`])
    }
  }

  if (error) {
    console.error("Erro ao excluir pelotão:", error)
    throw new Error("Falha ao excluir o pelotão.")
  }

  revalidatePath('/dashboard/pelotoes')
}