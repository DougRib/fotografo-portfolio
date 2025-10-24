import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'
import { slugify } from '@/lib/utils'

const tagSchema = z.object({ name: z.string().min(2) })

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(tags)
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.allowed) return NextResponse.json({ error: 'Não autorizado' }, { status: auth.status })

    const body = await request.json()
    const data = tagSchema.parse(body)
    const slug = slugify(data.name)
    const exists = await prisma.tag.findUnique({ where: { slug } })
    if (exists) return NextResponse.json({ error: 'Já existe uma tag com este nome/slug' }, { status: 400 })
    const tag = await prisma.tag.create({ data: { name: data.name, slug } })
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 })
  }
}

