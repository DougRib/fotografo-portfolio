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