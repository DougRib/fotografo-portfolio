/**
 * Página de Edição de Projeto
 * 
 * Esta página carrega os dados de um projeto existente e permite editá-lo.
 * Similar à página de criação, mas pré-popula o formulário com dados existentes.
 * 
 * A página usa o ID da URL ([id]) para buscar o projeto específico no banco.
 * Se o projeto não existir, retorna 404 (notFound).
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/project-form'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'

interface EditProjectPageProps {
  params: {
    id: string
  }
}

/**
 * Buscar dados do projeto e opções de categorias/tags
 */
async function getProjectData(id: string) {
  const [project, categories, tags] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        categories: {
          select: { categoryId: true },
        },
        tags: {
          select: { tagId: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  return { project, categories, tags }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { project, categories, tags } = await getProjectData(params.id)

  // Se projeto não existe, retorna 404
  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar Projeto</h1>
          <p className="text-muted-foreground">
            {project.title}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/projects/${project.id}/gallery`}>
            Gerenciar Galeria
          </Link>
        </Button>
      </div>

      {/* Formulário de edição (mesm componente que criação, mas com dados) */}
      <ProjectForm project={project} categories={categories} tags={tags} />
    </div>
  )
}