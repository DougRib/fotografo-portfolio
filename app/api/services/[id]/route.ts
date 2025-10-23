import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const serviceSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  priceFrom: z.number().nullable().optional(),
  features: z.array(z.string()).optional(),
  active: z.boolean().optional(),
})

// PATCH - Atualizar serviço por ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar serviço' },
      { status: 500 }
    )
  }
}

// DELETE - Remover serviço por ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Serviço removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar serviço' },
      { status: 500 }
    )
  }
}

