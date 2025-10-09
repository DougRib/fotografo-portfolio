/**
 * Middleware de Autenticação
 * 
 * Este arquivo é executado ANTES de qualquer requisição chegar às páginas.
 * É aqui que protegemos as rotas do dashboard, verificando se o usuário
 * está autenticado.
 * 
 * Como funciona:
 * 1. Usuário tenta acessar /dashboard/algo
 * 2. Middleware intercepta a requisição
 * 3. Verifica se existe token de sessão válido
 * 4. Se sim, permite acesso
 * 5. Se não, redireciona para /login
 * 
 * O NextAuth fornece uma função getToken() que facilita isso.
 * 
 * IMPORTANTE: Este arquivo deve estar na RAIZ do projeto (mesmo nível que app/)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se a rota atual é protegida (começa com /dashboard)
  const isProtectedRoute = pathname.startsWith('/dashboard')

  // Se não for rota protegida, permite acesso sem verificar autenticação
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Para rotas protegidas, verificar se usuário está autenticado
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Se não tem token (não está autenticado), redireciona para login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      // Adiciona a URL atual como callbackUrl para redirecionar após login
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Token válido - permite acesso
    return NextResponse.next()
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error)
    
    // Em caso de erro, redireciona para login por segurança
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

// Configurar quais rotas o middleware deve processar
// Isso otimiza performance ao não executar middleware em TODAS as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
}