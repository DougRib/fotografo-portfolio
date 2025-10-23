import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const hasAdmin = await prisma.user.count({ where: { role: 'ADMIN' as any } })
    return NextResponse.json({ userCount, hasAdmin: hasAdmin > 0 })
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}

