'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

  let url_imagem_estandarte = null

  // 3. Lógica de Upload para o Supabase Storage (Se o usuário enviou uma foto)
  if (imagem && imagem.size > 0) {
    // Cria um nome de arquivo único (ex: 1712423456-nome-da-imagem.jpg) para não dar conflito
    const fileExt = imagem.name.split('.').pop()
    const fileName = `estandartes/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    // Faz o envio do arquivo para o bucket 'mural_imagens'
    const { error: uploadError } = await supabase.storage
      .from('mural_imagens')
      .upload(fileName, imagem, {
        cacheControl: '3600',
        upsert: false // Não substitui se já existir um com o mesmo nome
      })

    if (uploadError) {
      console.error("Erro no upload da imagem:", uploadError)
      throw new Error("Falha ao enviar o estandarte. Verifique o tamanho ou formato da imagem.")
    }

    // Após o envio, pegamos o link público dessa imagem para salvar na tabela
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
      // Se não selecionar um capitão, salva como nulo para não quebrar o banco
      capitao_id: capitao_id ? capitao_id : null, 
      whatsapp_capitao,
      url_imagem_estandarte
    })

  if (dbError) {
    console.error("Erro ao salvar no banco:", dbError)
    throw new Error("Falha ao cadastrar o pelotão no banco de dados.")
  }

  // 5. Atualiza a página do Next.js para mostrar o novo pelotão na lista instantaneamente
  revalidatePath('/dashboard/pelotoes')
}

export async function excluirPelotao(id: string) {
  'use server'
  const supabase = await createClient()
  
  // Exclui o registro (o ON DELETE CASCADE nas outras tabelas limpará as duplas vinculadas)
  const { error } = await supabase.from('pelotoes').delete().eq('id', id)
  
  if (error) {
    console.error("Erro ao excluir pelotão:", error)
    throw new Error("Falha ao excluir o pelotão.")
  }

  revalidatePath('/dashboard/pelotoes')
}