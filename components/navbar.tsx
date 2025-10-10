// components/site-navbar.tsx
/**
 * Navbar do Site Público
 * 
 * Esta é a barra de navegação principal que aparece em todas as páginas públicas
 * do site (landing page, portfólio, sobre, etc.). Ela oferece:
 * 
 * FEATURES:
 * - Links para todas as páginas principais do site
 * - Menu mobile responsivo com animação suave
 * - Toggle de dark/light mode
 * - Botão de login para acessar o dashboard
 * - Sticky (fixa no topo ao fazer scroll)
 * - Destaque visual do link ativo (página atual)
 * - Logo/marca do fotógrafo
 * 
 * A navbar é um Client Component porque precisa de interatividade
 * (abrir/fechar menu, detectar scroll, etc.)
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Camera, Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

// Links de navegação do site
// Cada link tem um label (texto exibido) e um href (URL de destino)
const navigationLinks = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Portfólio',
    href: '/portfolio',
  },
  {
    label: 'Sobre',
    href: '/sobre',
  },
  {
    label: 'Contato',
    href: '/#contato', // Ancora para a seção de contato na home
  },
]

export function SiteNavbar() {
  // State para controlar se o menu mobile está aberto ou fechado
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // State para controlar se a navbar deve ter background (após scroll)
  const [hasScrolled, setHasScrolled] = useState(false)
  
  // Hook para obter o pathname atual (qual página estamos)
  const pathname = usePathname()
  
  // Hook do next-themes para controlar o tema (dark/light)
  const { theme, setTheme } = useTheme()
  
  // Nome do fotógrafo vindo das variáveis de ambiente
  const photographerName = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME || 'Fotógrafo'

  // Effect para detectar scroll e adicionar background na navbar
  // Isso cria um efeito elegante onde a navbar é transparente no topo
  // e ganha um background sólido quando o usuário faz scroll
  useEffect(() => {
    const handleScroll = () => {
      // Se scrollou mais de 50px, ativa o background
      setHasScrolled(window.scrollY > 50)
    }

    // Adiciona listener de scroll
    window.addEventListener('scroll', handleScroll)
    
    // Cleanup: remove listener quando componente é desmontado
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Função para fechar o menu mobile quando um link é clicado
  // Isso melhora a UX pois o usuário vê a navegação acontecendo
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Função para alternar o tema entre dark e light
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <nav
      className={cn(
        // Classes base da navbar
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        // Adiciona background e sombra após scroll
        hasScrolled
          ? 'bg-[linear-gradient(90deg,#2e2f22,#ca9f02)] dark:bg-[linear-gradient(90deg,#2e2f22,#ca9f02)] shadow-sm shadow-gray-800 transitio-all duration-300'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO / MARCA */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
              hasScrolled ? "bg-primary/10" : "bg-white/10"
            )}>
              <Camera className={cn(
                "h-6 w-6",
                hasScrolled ? "text-primary" : "text-white"
              )} />
            </div>
            <span className={cn(
              "transition-colors",
              hasScrolled ? "text-white" : "text-white"
            )}>
              {photographerName}
            </span>
          </Link>

          {/* LINKS DE NAVEGAÇÃO - DESKTOP */}
          {/* Estes links aparecem apenas em telas médias ou maiores */}
          <div className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => {
              // Verifica se este link é o da página atual
              // Para links com ancora (#), compara apenas a parte antes do #
              const isActive = link.href.includes('#')
                ? pathname === '/'
                : pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    // Classes base do link
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    // Classes para link ativo (página atual)
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : hasScrolled
                      ? 'text-white hover:bg-primary hover:text-accent-foreground'
                      : 'text-white hover:bg-primary'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* AÇÕES DA DIREITA - DESKTOP */}
          <div className="hidden md:flex items-center gap-2">
            {/* Toggle Dark/Light Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "rounded-full",
                !hasScrolled && "text-white hover:bg-white/10"
              )}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Alternar tema</span>
            </Button>

            {/* Botão de Login */}
            <Button
              asChild
              variant={hasScrolled ? "default" : "secondary"}
              size="sm"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>

          {/* BOTÃO MENU MOBILE */}
          {/* Aparece apenas em telas pequenas (celulares e tablets) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Toggle tema mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "rounded-full",
                !hasScrolled && "text-white hover:bg-white/10"
              )}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Botão hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "rounded-full",
                !hasScrolled && "text-white hover:bg-white/10"
              )}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      {/* Este menu aparece/desaparece com animação quando o botão hamburger é clicado */}
      <div
        className={cn(
          // Classes base do menu mobile
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          // Classes para abrir/fechar (controla altura)
          isMobileMenuOpen ? 'max-h-96' : 'max-h-0',
          // Background do menu
          'bg-background/95 backdrop-blur-md border-t'
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          {/* Links de navegação mobile */}
          {navigationLinks.map((link) => {
            const isActive = link.href.includes('#')
              ? pathname === '/'
              : pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={cn(
                  'block px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Botão de Login mobile */}
          <Button
            asChild
            className="w-full"
            onClick={closeMobileMenu}
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}