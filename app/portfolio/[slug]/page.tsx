/**
 * Página Individual do Projeto
 * 
 * Mostra detalhes completos do projeto com galeria interativa
 * Inclui lightbox com zoom e navegação
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectGallery } from '@/components/project-gallery'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ProjectPageProps {
  params: {
    slug: string
  }
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      seoTitle: true,
      seoDesc: true,
      summary: true,
      coverUrl: true,
    },
  })

  if (!project) {
    return {
      title: 'Projeto não encontrado',
    }
  }

  const title = project.seoTitle || project.title
  const description = project.seoDesc || project.summary || ''
  const ogImage = project.coverUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

// Revalidar a cada 1 hora
export const revalidate = 3600

async function getProject(slug: string) {
  const project = await prisma.project.findUnique({
    where: {
      slug,
      status: ProjectStatus.PUBLISHED,
    },
    include: {
      gallery: {
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  return project
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.slug)

  if (!project) {
    notFound()
  }

  // Preparar imagens para o lightbox
  const images = project.gallery?.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt || project.title,
    width: img.width || 1200,
    height: img.height || 800,
    caption: img.caption,
  })) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header com imagem de capa */}
      <section className="relative h-[60vh] min-h-[400px]">
        {project.coverUrl && (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Link href="/portfolio">
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Portfólio
              </Button>
            </Link>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap gap-3 text-white/90">
              {project.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {formatDate(project.publishedAt)}
                  </span>
                </div>
              )}
              
              {project.categories.map((cat) => (
                <Link
                  key={cat.category.id}
                  href={`/portfolio?category=${cat.category.slug}`}
                >
                  <span className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-sm">
                    <Tag className="h-3 w-3" />
                    {cat.category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Descrição */}
          {project.summary && (
            <Card className="mb-12">
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {project.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                TAGS
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tagRel) => (
                  <Link
                    key={tagRel.tag.id}
                    href={`/portfolio?tag=${tagRel.tag.slug}`}
                  >
                    <Button variant="outline" size="sm">
                      {tagRel.tag.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Galeria com Lightbox */}
          {images.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Galeria</h2>
              <ProjectGallery images={images} projectTitle={project.title} />
            </div>
          )}

          {/* CTA */}
          <Card className="mt-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Gostou do que viu?
              </h3>
              <p className="text-muted-foreground mb-6">
                Entre em contato para conversarmos sobre seu próximo projeto.
              </p>
              <Button asChild size="lg">
                <Link href="/#contato">
                  Solicitar Orçamento
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}