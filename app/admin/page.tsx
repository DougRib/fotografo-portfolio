import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminEntry() {
  redirect('/login?callbackUrl=%2Fdashboard')
}

