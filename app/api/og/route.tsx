/**
 * API de Open Graph Images Dinâmicas
 * 
 * Gera imagens OG personalizadas para cada projeto
 * usando @vercel/og (Satori + Resvg)
 */

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const title = searchParams.get('title') || 'Portfolio'
    const category = searchParams.get('category')
    const coverUrl = searchParams.get('coverUrl')

    const photographerName = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME || 'Fotógrafo'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage: coverUrl
              ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${coverUrl})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              maxWidth: '1000px',
            }}
          >
            {/* Título */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginBottom: 24,
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>

            {/* Categoria */}
            {category && (
              <div
                style={{
                  fontSize: 32,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: 48,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '12px 32px',
                  borderRadius: 9999,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {category}
              </div>
            )}

            {/* Separator */}
            <div
              style={{
                width: '200px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '2px',
                marginBottom: 48,
              }}
            />

            {/* Nome do fotógrafo */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.95)',
                letterSpacing: '0.05em',
              }}
            >
              {photographerName}
            </div>

            {/* Subtítulo */}
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: 12,
              }}
            >
              Fotografia Profissional
            </div>
          </div>

          {/* Logo/marca d'água (opcional) */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 9999,
                backdropFilter: 'blur(10px)',
              }}
            />
            <div
              style={{
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
              }}
            >
              {photographerName}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Erro ao gerar OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}