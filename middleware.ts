import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies da requisição (corrigido para o TS do Next.js)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Atualiza a resposta
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Atualiza os cookies da resposta
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Essa função getUser é o que atualiza a sessão caso o token esteja expirando
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Proteger rotas de dashboard (Bloqueia quem NÃO está logado)
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Proteger rotas de autenticação (Bloqueia quem JÁ ESTÁ logado)
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/cadastro'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}