import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'

const updateImageSchema = z.object({
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
})

// PATCH - Atualizar campos de uma imagem
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.allowed) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: auth.status })
    }
    const body = await request.json()
    const validated = updateImageSchema.parse(body)

    const image = await prisma.image.update({
      where: { id: params.id },
      data: {
        alt: validated.alt ?? undefined,
        caption: validated.caption ?? undefined,
        order: validated.order ?? undefined,
      },
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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.allowed) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: auth.status })
    }
    await prisma.image.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Imagem deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar imagem' },
      { status: 500 }
    )
  }
}
