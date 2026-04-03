'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Redireciona com mensagem de erro na URL
    return redirect('/login?error=Dados incorretos')
  }

  return redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string

  // 1. Cadastra no Supabase Auth (Sistema interno)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: nome }
    }
  })

  if (error) return redirect('/cadastro?error=' + encodeURIComponent(error.message))

  // 2. Insere na nossa tabela 'perfis' (Sincronização com seus dados)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('perfis')
      .insert({
        id: data.user.id,
        nome: nome,
        email: email, // <--- AGORA SALVANDO O EMAIL AQUI
        role: 'padrao'
      })
    
    if (profileError) {
      console.error("Erro ao criar perfil:", profileError)
      // Opcional: deletar o user do auth se o perfil falhar, mas vamos manter simples por enquanto
    }
  }

  // Redireciona para login com mensagem de sucesso
  return redirect('/login?message=' + encodeURIComponent('Cadastro realizado! Aguarde a liberação do administrador.'))
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}