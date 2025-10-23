/**
 * API de Serviços/Pacotes
 * 
 * GET: Listar todos os serviços
 * POST: Criar novo serviço
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const serviceSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  priceFrom: z.number().nullable().optional(),
  features: z.array(z.string()),
  active: z.boolean().default(true),
})

// GET - Listar serviços
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar serviços' },
      { status: 500 }
    )
  }
}

// POST - Criar serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    // Buscar último order para adicionar o novo no final
    const lastService = await prisma.service.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        order: (lastService?.order || 0) + 1,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar serviço:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar serviço' },
      { status: 500 }
    )
  }
}

// ============================================
// app/api/services/[id]/route.ts
// ============================================

// PATCH - Atualizar serviço
// Nota: Handlers de PATCH/DELETE para /api/services/[id] foram
// movidos para app/api/services/[id]/route.ts
