'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function CreateEventosCategoryButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Eventos' }),
      })
      if (!res.ok) throw new Error('Falha ao criar categoria')
      // simples refresh para recarregar a página server-side
      window.location.reload()
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <Button type="button" onClick={handleClick} disabled={loading}>
      {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</>) : ('Criar Categoria "Eventos"')}
    </Button>
  )
}

