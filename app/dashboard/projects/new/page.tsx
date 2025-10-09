/**
 * Página de Criação de Novo Projeto
 * 
 * Esta página permite ao fotógrafo criar um novo projeto do zero.
 * É uma página simples que renderiza o ProjectForm sem dados iniciais.
 * 
 * Server Component que busca categorias e tags do banco para popular
 * os dropdowns do formulário. Esses dados são passados como props
 * para o ProjectForm (que é Client Component).
 * 
 * Por que Server Component + Client Component?
 * - Server Component: busca dados eficientemente no servidor
 * - Client Component: fornece interatividade (formulário)
 * - Melhor dos dois mundos: performance + UX
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/project-form'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'

/**
 * Buscar categorias e tags do banco de dados
 * Estas são as opções que aparecerão nos dropdowns do formulário
 */
async function getFormData() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  return { categories, tags }
}

export default async function NewProjectPage() {
  const { categories, tags } = await getFormData()

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Projeto</h1>
          <p className="text-muted-foreground">
            Preencha as informações para criar um novo projeto no seu portfólio
          </p>
        </div>
      </div>

      {/* Formulário de criação */}
      <ProjectForm categories={categories} tags={tags} />
    </div>
  )
}