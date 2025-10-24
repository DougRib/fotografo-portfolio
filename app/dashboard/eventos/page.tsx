/**
 * Dashboard - Eventos
 * Visualização filtrada dos projetos com categoria "eventos"
 */

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import { Plus, FolderOpen } from 'lucide-react'
import { CreateEventosCategoryButton } from '@/components/create-eventos-category-button'

export const revalidate = 300

async function getData() {
  const [category, projects] = await Promise.all([
    prisma.category.findUnique({ where: { slug: 'eventos' } }),
    prisma.project.findMany({
      where: {
        status: ProjectStatus.PUBLISHED,
        categories: { some: { category: { slug: 'eventos' } } },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        gallery: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
      },
    }),
  ])
  return { category, projects }
}

export default async function EventosDashboardPage() {
  const { category, projects } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">Gerencie projetos de eventos</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Projeto
          </Link>
        </Button>
      </div>

      {!category && (
        <Card>
          <CardHeader>
            <CardTitle>Categoria &quot;Eventos&quot; não encontrada</CardTitle>
            <CardDescription>Crie a categoria para organizarmos seus eventos.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEventosCategoryButton />
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum evento encontrado. Crie um novo projeto e selecione a categoria Eventos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const cover = project.coverUrl || project.gallery?.images?.[0]?.url
            return (
              <Card key={project.id} className="overflow-hidden">
                <div className="relative aspect-[4/3] bg-muted">
                  {cover && (
                    <Image src={cover} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold line-clamp-1">{project.title}</h3>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/projects/${project.id}`}>Editar</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
