/**
 * Página de Galerias
 *
 * Hub para gerenciar imagens de todos os projetos rapidamente.
 * Lista projetos com contagem de imagens e atalho para a tela de galeria.
 */

import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, Images, Plus } from 'lucide-react'
import { ProjectStatus } from '@prisma/client'

export const revalidate = 300

async function getProjectsWithGalleries() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      gallery: {
        include: {
          images: {
            select: { id: true },
          },
        },
      },
    },
  })

  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    coverUrl: p.coverUrl,
    status: p.status,
    imagesCount: p.gallery?.images.length || 0,
  }))
}

export default async function GalleriesPage() {
  const projects = await getProjectsWithGalleries()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galerias</h1>
          <p className="text-muted-foreground">Gerencie as imagens dos seus projetos</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar a gerenciar uma galeria
            </p>
            <Button asChild>
              <Link href="/dashboard/projects/new">Criar Projeto</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {project.coverUrl ? (
                  <Image
                    src={project.coverUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <Badge variant={project.status === ProjectStatus.PUBLISHED ? 'success' : project.status === ProjectStatus.DRAFT ? 'warning' : 'outline'}>
                    {project.status === ProjectStatus.PUBLISHED && 'Publicado'}
                    {project.status === ProjectStatus.DRAFT && 'Rascunho'}
                    {project.status === ProjectStatus.ARCHIVED && 'Arquivado'}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  {project.imagesCount} imagem{project.imagesCount === 1 ? '' : 's'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/dashboard/projects/${project.id}/gallery`}>Gerenciar</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/projects/${project.id}`}>Editar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

