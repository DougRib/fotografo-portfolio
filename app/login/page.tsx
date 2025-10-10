/**
 * Página de Login
 * 
 * Esta é a página onde os usuários se autenticam para acessar o dashboard.
 * Usamos o signIn do NextAuth com o provider "credentials" (email + senha).
 * 
 * Fluxo:
 * 1. Usuário digita email e senha
 * 2. Formulário envia para NextAuth via signIn()
 * 3. NextAuth valida com o authorize() que configuramos em lib/auth.ts
 * 4. Se válido, cria sessão e redireciona para /dashboard
 * 5. Se inválido, mostra mensagem de erro
 * 
 * NOTA: Para desenvolvimento, estamos usando senha hardcoded "admin123"
 * Em produção, você DEVE implementar hash de senha com bcrypt!
 */

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Verificar se há mensagem de erro na URL (ex: após tentar acessar rota protegida)
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Tentar fazer login com NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Não redirecionar automaticamente, vamos controlar isso
      })

      if (result?.error) {
        // Se houve erro, mostra mensagem
        setError('Email ou senha incorretos. Tente novamente.')
      } else if (result?.ok) {
        // Se login bem-sucedido, redireciona para o dashboard
        router.push(callbackUrl)
        router.refresh() // Força refresh para atualizar estado de autenticação
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err)
      setError('Erro ao tentar fazer login. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(90deg,#858a86,#a6aab9,#ededed)] dark:bg-[linear-gradient(90deg,#4f6166,#c8bbb4)] p-4">
      <div className="absolute inset-0  opacity-20" />
      
      <Card className="w-full max-w-md relative bg-[linear-gradient(180deg,#dedede,#ffffff)]  z-10 shadow-2xl glass">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold dark:text-gray-800">Dashboard</CardTitle>
          <CardDescription className='dark:text-gray-800'>
            Entre com suas credenciais para acessar o painel administrativo
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Mostrar erro se houver */}
          {(error || errorParam) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Você precisa fazer login para acessar esta página.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Alert informativo para desenvolvimento */}
          <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <AlertDescription className="text-sm">
              <strong>Modo Desenvolvimento:</strong><br />
              Email: qualquer email cadastrado no seed<br />
              Senha: <code className="bg-black/10 px-1 rounded">admin123</code>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4 dark:text-gray-800">
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Botão de Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Link para voltar ao site */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm dark:text-gray-800 hover:text-primary underline-offset-4 hover:underline"
            >
              ← Voltar para o site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}