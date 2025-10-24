import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin()
    if (!auth.allowed) return NextResponse.json({ error: 'Não autorizado' }, { status: auth.status })

    await prisma.tag.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao deletar tag' }, { status: 500 })
  }
}

