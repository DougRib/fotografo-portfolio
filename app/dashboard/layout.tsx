/**
 * Layout do Dashboard
 * 
 * Sidebar de navegação e header
 * Protegido por autenticação (TODO: implementar middleware)
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { DashboardNav } from '@/components/dashboard-nav'
import { Camera } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth guard (belt-and-suspenders with middleware)
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login?callbackUrl=/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-muted/40">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Camera className="h-6 w-6 text-primary" />
          <span className="font-semibold">Dashboard</span>
        </div>
        
        <div className="flex-1 overflow-auto py-6">
          <DashboardNav />
        </div>

        <div className="border-t p-4">
          <Link href="/" target="_blank">
            <Button variant="outline" className="w-full justify-start hover:bg-primary transition-colors duration-200">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Ver Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content (sem header do dashboard) */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
