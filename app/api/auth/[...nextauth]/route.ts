/**
 * Rota de API do NextAuth
 * 
 * Esta é uma rota "catch-all" que captura TODAS as requisições de autenticação.
 * Por exemplo:
 * - POST /api/auth/signin → Login
 * - GET /api/auth/signout → Logout
 * - GET /api/auth/session → Verificar sessão
 * - POST /api/auth/callback/credentials → Callback após login
 * 
 * O NextAuth gerencia tudo isso automaticamente através do NextAuth() handler.
 * O arquivo "[...nextauth]" é uma rota dinâmica do Next.js que captura
 * múltiplos segmentos de URL.
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Criar o handler com as opções configuradas
const handler = NextAuth(authOptions)

// Exportar para métodos GET e POST
// Next.js App Router exige que exportemos os métodos HTTP explicitamente
export { handler as GET, handler as POST }