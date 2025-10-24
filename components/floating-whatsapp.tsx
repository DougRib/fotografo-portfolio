'use client'

import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp() {
  const phone = process.env.NEXT_PUBLIC_PHOTOGRAPHER_WHATSAPP || '5551999999999'
  const href = `https://wa.me/${phone}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}

