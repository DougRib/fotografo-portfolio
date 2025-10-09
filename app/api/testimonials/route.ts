/**
 * API de Depoimentos
 * 
 * GET: Listar todos os depoimentos
 * POST: Criar novo depoimento
 */

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

// GET - Listar depoimentos
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Erro ao buscar depoimentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar depoimentos' },
      { status: 500 }
    )
  }
}

// POST - Criar depoimento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = testimonialSchema.parse(body)

    const testimonial = await prisma.testimonial.create({
      data: validatedData,
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar depoimento:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar depoimento' },
      { status: 500 }
    )
  }
}

// ============================================
// app/api/testimonials/[id]/route.ts
// ============================================

// PATCH - Atualizar depoimento
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  { params }: { params: { id: string } }
) {
  try {
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