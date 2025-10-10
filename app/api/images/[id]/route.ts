import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
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