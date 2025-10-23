import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { allowed: false as const, status: 401 as const, session: null }
  }
  return { allowed: true as const, status: 200 as const, session }
}

export async function requireAdmin() {
  const base = await requireSession()
  if (!base.allowed) return base
  const { session } = base
  if (session!.user.role !== 'ADMIN') {
    return { allowed: false as const, status: 403 as const, session }
  }
  return { allowed: true as const, status: 200 as const, session }
}

