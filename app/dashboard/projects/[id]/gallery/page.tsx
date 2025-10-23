/**
 * Página de Gerenciamento de Galeria
 * 
 * Esta página permite ao fotógrafo gerenciar as imagens de um projeto:
 * - Upload de múltiplas imagens via drag-and-drop
 * - Reordenação de imagens por drag-and-drop
 * - Edição de alt text e captions
 * - Exclusão de imagens
 * - Preview de imagens
 * 
 * Usa UploadThing para upload e armazenamento das imagens.
 * As imagens são automaticamente otimizadas e thumbnails são gerados.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GalleryManager } from '@/components/gallery-manager'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'

interface GalleryPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Buscar dados do projeto e galeria
 */
async function getProjectGallery(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      gallery: {
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  return project
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { id } = await params
  const project = await getProjectGallery(id)

  // Se projeto não existe, retorna 404
  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/dashboard/projects/${project.id}`} className='hover:bg-primary transition-colors duration-200'>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Galeria de Imagens</h1>
          <p className="text-muted-foreground">
            {project.title}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/projects/${project.id}`}>
            Voltar ao Projeto
          </Link>
        </Button>
      </div>

      {/* Componente de gerenciamento de galeria */}
      <GalleryManager
        projectId={project.id}
        galleryId={project.gallery?.id}
        images={project.gallery?.images || []}
      />
    </div>
  )
}
