'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function OpenGalleryButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-gallery', { detail: { index: 0 } }))
    }
  }

  return (
    <Button asChild variant="outline" className="bg-primary/70 text-white hover:bg-primary hover:text-black transition-colors duration-300">
      <Link href="#galeria" onClick={handleClick}>Ver fotos do ensaio</Link>
    </Button>
  )
}

