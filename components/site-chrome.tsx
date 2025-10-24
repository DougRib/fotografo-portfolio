'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SiteNavbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDashboard = pathname?.startsWith('/dashboard')

  if (isDashboard) return <>{children}</>

  return (
    <>
      <SiteNavbar />
      {children}
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
