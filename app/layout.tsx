/**
 * Layout raiz da aplicação
 * 
 * Este é o layout principal que envolve todas as páginas.
 * Aqui configuramos:
 * - Metadados globais
 * - Fontes
 * - Providers (tema, etc)
 * - Analytics
 */

import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { SiteChrome } from '@/components/site-chrome'

// Configurar fontes do Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

// Metadados globais
export const metadata: Metadata = {
  title: {
    default: `${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} - Fotografia Profissional`,
    template: `%s | ${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME}`,
  },
  description:
    'Fotografia profissional de casamentos, eventos, retratos e arquitetura. Capturo momentos autênticos e inesquecíveis.',
  keywords: [
    'fotografia',
    'fotógrafo',
    'casamento',
    'eventos',
    'retrato',
    'arquitetura',
    process.env.NEXT_PUBLIC_PHOTOGRAPHER_CITY || '',
  ],
  authors: [
    {
      name: process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
  ],
  creator: process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME,
    title: `${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} - Fotografia Profissional`,
    description:
      'Fotografia profissional de casamentos, eventos, retratos e arquitetura.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME} - Fotografia Profissional`,
    description:
      'Fotografia profissional de casamentos, eventos, retratos e arquitetura.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
}

// Viewport para otimização mobile
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteChrome>
            {children}
          </SiteChrome>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>

        {/* Analytics - Vercel Analytics é automático */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
