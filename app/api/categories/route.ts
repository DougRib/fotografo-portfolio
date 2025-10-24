import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'
import { slugify } from '@/lib/utils'

const categorySchema = z.object({
  name: z.string().min(2),
})

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(categories)
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.allowed) return NextResponse.json({ error: 'Não autorizado' }, { status: auth.status })

    const body = await request.json()
    const data = categorySchema.parse(body)
    const slug = slugify(data.name)

    // Verificar slug único
    const exists = await prisma.category.findUnique({ where: { slug } })
    if (exists) {
      return NextResponse.json({ error: 'Já existe uma categoria com este nome/slug' }, { status: 400 })
    }

    const category = await prisma.category.create({ data: { name: data.name, slug } })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}

