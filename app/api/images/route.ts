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

// ============================================
// app/api/images/[id]/route.ts
// ============================================

// PATCH - Atualizar imagem
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updateSchema = z.object({
      alt: z.string().optional(),
      caption: z.string().optional(),
      order: z.number().optional(),
    })

    const validatedData = updateSchema.parse(body)

    // Atualizar imagem
    const image = await prisma.image.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar imagem' },
      { status: 500 }
    )
  }
}

// DELETE - Remover imagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Deletar imagem
    await prisma.image.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Imagem removida com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar imagem' },
      { status: 500 }
    )
  }
}