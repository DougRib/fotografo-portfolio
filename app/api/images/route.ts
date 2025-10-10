/**
 * API de Imagens - Criação
 * 
 * POST: Adicionar nova imagem à galeria
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createImageSchema = z.object({
  galleryId: z.string(),
  url: z.string().url(),
  thumbUrl: z.string().url().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  order: z.number().default(0),
  alt: z.string().optional(),
  caption: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createImageSchema.parse(body)

    // Criar imagem
    const image = await prisma.image.create({
      data: validatedData,
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar imagem:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar imagem' },
      { status: 500 }
    )
  }
}