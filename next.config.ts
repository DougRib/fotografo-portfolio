import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Habilita o Turbopack em desenvolvimento para builds mais rápidos
  // (já está habilitado via script "dev": "next dev --turbopack")
  
  // Configuração de imagens
  images: {
    // Domínios permitidos para next/image (otimização automática)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing CDN
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
    ],
    // Formatos modernos para melhor performance
    formats: ['image/avif', 'image/webp'],
    // Tamanhos de imagem personalizados (usado no layout responsivo)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configuração de cabeçalhos de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Configurações de compilação
  typescript: {
    // Não ignorar erros de tipo durante build de produção
    ignoreBuildErrors: false,
  },
  eslint: {
    // Não ignorar erros de lint durante build de produção
    ignoreDuringBuilds: false,
  },

  // Configuração experimental do React
  experimental: {
    // Habilitar otimizações do React Server Components
    serverActions: {
      bodySizeLimit: '10mb', // Limite para uploads via Server Actions
    },
  },

  // Configuração de revalidação
  // Estas páginas serão regeneradas sob demanda
  async rewrites() {
    return []
  },
}

export default nextConfig
