'use client'

import Link from 'next/link'
import { Instagram, Facebook, Mail, Phone, MapPin, Camera } from 'lucide-react'

/**
 * Footer Moderno para Portfólio de Fotografia
 * 
 * Design minimalista e elegante que complementa o trabalho fotográfico
 * sem roubar o foco visual. Inclui:
 * - Informações de contato facilmente acessíveis
 * - Links de navegação rápida
 * - Redes sociais com ícones elegantes
 * - Copyright e informações legais
 * - Totalmente responsivo para mobile e desktop
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className=" border-t bg-[linear-gradient(90deg,#858a86,#a6aab9,#ededed)] dark:bg-[linear-gradient(90deg,#4f6166,#c8bbb4)]">
      {/* Container principal com padding generoso */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Coluna 1 - Brand e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="text-xl font-heading font-semibold">
                {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME || 'Douglas Ribeiro'}
              </span>
            </div>
            <p className="text-sm text-secondary-foreground leading-relaxed">
              Capturando momentos únicos e eternizando histórias através da fotografia profissional.
              Especializado em casamentos, ensaios e eventos corporativos.
            </p>
            {/* Redes Sociais */}
            <div className="flex gap-4 pt-2">
                <a
                    href="https://instagram.com/seuusuario"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
                    aria-label="Instagram"
                >
                    <Instagram className="h-5 w-5" />
                </a>
                <a
                    href="https://facebook.com/seuusuario"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
                    aria-label="Facebook"
                >
                    <Facebook className="h-5 w-5" />
                </a>
                <a
                    href={`mailto:${process.env.NEXT_PUBLIC_PHOTOGRAPHER_EMAIL || 'contato@seusite.com'}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
                    aria-label="Email"
                >
                    <Mail className="h-5 w-5" />
                </a>
            </div>
          </div>

          {/* Coluna 2 - Links Rápidos */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Navegação</h3>
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/"
                className="text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Início
              </Link>
              <Link 
                href="/portfolio"
                className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Portfólio
              </Link>
              <Link 
                href="/sobre"
                className="text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Sobre
              </Link>
              <Link 
                href="/#servicos"
                className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Serviços
              </Link>
              <Link 
                href="/#contato"
                className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Contato
              </Link>
            </nav>
          </div>

          {/* Coluna 3 - Serviços */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Serviços</h3>
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/portfolio?category=casamento"
                className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Casamentos
              </Link>
              <Link 
                href="/portfolio?category=ensaio"
                className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Ensaios Fotográficos
              </Link>
              <Link 
                href="/portfolio?category=corporativo"
                className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Fotografia Corporativa
              </Link>
              <Link 
                href="/portfolio?category=eventos"
                className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
              >
                Eventos Especiais
              </Link>
            </nav>
          </div>

          {/* Coluna 4 - Contato */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-secondary-foreground">
                  {process.env.NEXT_PUBLIC_PHOTOGRAPHER_CITY || 'Porto Alegre, RS'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <a 
                  href={`tel:${process.env.NEXT_PUBLIC_PHOTOGRAPHER_PHONE || '+55 51 99999-9999'}`}
                  className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200"
                >
                  {process.env.NEXT_PUBLIC_PHOTOGRAPHER_PHONE || '+55 51 99999-9999'}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <a 
                  href={`mailto:${process.env.NEXT_PUBLIC_PHOTOGRAPHER_EMAIL || 'contato@seusite.com'}`}
                  className="text-sm text-secondary-foreground hover:text-primary transition-colors duration-200 break-all"
                >
                  {process.env.NEXT_PUBLIC_PHOTOGRAPHER_EMAIL || 'contato@seusite.com'}
                </a>
              </div>
            </div>

            {/* CTA de WhatsApp */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_PHOTOGRAPHER_WHATSAPP || '5551999999999'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/60 transition-colors duration-200 mt-4"
            >
              <Phone className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>
        </div>

        {/* Linha divisória sutil */}
        <div className="mt-4 mb-4 h-px bg-border" />

        {/* Bottom bar - Copyright e Links Legais */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-secondary-foreground">
            © {currentYear} {process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME || 'Douglas Ribeiro'}. 
            Todos os direitos reservados.
          </p>
          <p className="text-xs text-secondary-foreground">
            Desenvolvido por Douglas Ribeiro
          </p>
          
          
        </div>
      </div>
    </footer>
  )
}