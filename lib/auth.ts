/**
 * Configuração do NextAuth.js
 * 
 * NextAuth é a solução mais popular para autenticação em Next.js.
 * Aqui configuramos:
 * - Providers (métodos de login): Credentials (email/senha)
 * - Callbacks para customizar comportamento
 * - Páginas customizadas de login
 * - Sessão e JWT
 * 
 * IMPORTANTE: Em produção, você deve adicionar providers adicionais
 * como Google, GitHub, etc. para melhor segurança.
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Configuração de sessão
  session: {
    strategy: 'jwt', // Usar JWT para sessões (stateless)
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Páginas customizadas
  pages: {
    signIn: '/login', // Página de login customizada
    error: '/login', // Redireciona erros para o login
  },

  // Providers de autenticação
  providers: [
    // Provider de Credentials (email + senha)
    // Em produção, considere adicionar Google, GitHub, etc.
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'seu@email.com',
        },
        password: {
          label: 'Senha',
          type: 'password',
        },
      },
      async authorize(credentials) {
        // Validar que as credenciais foram fornecidas
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        // Buscar usuário no banco de dados
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // Verificar se usuário existe
        if (!user) {
          throw new Error('Email ou senha incorretos')
        }

        // Verificar senha usando bcrypt
        // bcrypt.compare() compara a senha em texto puro com o hash armazenado
        // É seguro porque não "decodifica" a senha - compara hashes
        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Email ou senha incorretos')
        }

        // Retornar dados do usuário para a sessão
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),

    // Você pode adicionar mais providers aqui:
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],

  // Callbacks para customizar comportamento
  callbacks: {
    // Callback JWT: adiciona informações extras ao token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    // Callback Session: adiciona informações do token à sessão
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  // Secret para assinar JWTs (MUITO IMPORTANTE!)
  // Use uma string aleatória forte em produção
  secret: process.env.NEXTAUTH_SECRET,

  // Ativar debug apenas em desenvolvimento
  debug: process.env.NODE_ENV === 'development',
}

// ============================================
// Tipos TypeScript para NextAuth
// ============================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}