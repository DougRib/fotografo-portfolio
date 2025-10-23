import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const testimonialSchema = z.object({
  author: z.string().min(2).optional(),
  role: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  text: z.string().min(20).optional(),
  visible: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = testimonialSchema.parse(body)

    const updated = await prisma.testimonial.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(updated)
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.testimonial.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Depoimento removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar depoimento:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar depoimento' },
      { status: 500 }
    )
  }
}

