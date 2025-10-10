import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const testimonialSchema = z.object({
  author: z.string().min(2),
  role: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  text: z.string().min(20),
  visible: z.boolean().default(true),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    const validatedData = testimonialSchema.partial().parse(body)

    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Erro ao atualizar depoimento:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar depoimento' },
      { status: 500 }
    )
  }
}

// DELETE - Remover depoimento
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    await prisma.testimonial.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Depoimento removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar depoimento:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar depoimento' },
      { status: 500 }
    )
  }
}