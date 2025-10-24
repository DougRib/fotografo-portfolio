/**
 * Página de Eventos
 * Lista projetos categorizados como "Eventos"
 */

import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProjectStatus, Prisma } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Veja os eventos fotográficos realizados.',
}

export const revalidate = 1800

interface EventosPageProps {
  searchParams: Promise<{
    category?: string
    tag?: string
    page?: string
  }>
}

async function getEventsData(searchParams: { category?: string; tag?: string; page?: string }) {
  const page = parseInt(searchParams.page || '1')
  const perPage = 12
  const skip = (page - 1) * perPage

  const where: Prisma.ProjectWhereInput = {
    status: ProjectStatus.PUBLISHED,
    categories: { some: { category: { slug: 'eventos' } } },
  }

  if (searchParams.category) {
    where.categories = {
      AND: [
        { some: { category: { slug: 'eventos' } } },
        { some: { category: { slug: searchParams.category } } },
      ],
    } as Prisma.ProjectWhereInput['categories']
  }
  if (searchParams.tag) {
    where.tags = {
      some: { tag: { slug: searchParams.tag } },
    }
  }

  const [projects, total, categories, tags] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: perPage,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        gallery: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
      },
    }),
    prisma.project.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }),
  ])

  return { projects, total, page, perPage, totalPages: Math.ceil(total / perPage), categories, tags }
}

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const resolved = await searchParams
  const data = await getEventsData(resolved)

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-[linear-gradient(90deg,#858a86,#a6aab9,#ededed)] dark:bg-[linear-gradient(90deg,#4f6166,#c8bbb4)]">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Eventos</h1>
          <p className="text-lg text-secondary-foreground max-w-2xl">
            Cobertura de eventos e ocasiões especiais.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="lg:w-64 shrink-0 md:sticky md:top-24 self-start">
            <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-auto pr-1">
              <div>
                <h3 className="font-semibold mb-3">Categorias</h3>
                <div className="space-y-2">
                  <Link href="/eventos">
                    <Button 
                      variant={!resolved.category ? 'secondary' : 'ghost'} 
                      className="w-full justify-start mb-1">Todas</Button>
                  </Link>
                  {data.categories.map((category) => (
                    <Link key={category.id} href={`/eventos?category=${category.slug}`}>
                      <Button variant={resolved.category === category.slug ? 'secondary' : 'ghost'} className="w-full justify-start mb-1">
                        {category.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {data.tags.map((tag) => (
                    <Link key={tag.id} href={`/eventos?tag=${tag.slug}`}>
                      <Button variant={resolved.tag === tag.slug ? 'default' : 'outline'} size="sm">{tag.name}</Button>
                    </Link>
                  ))}
                </div>
              </div>
              {(resolved.category || resolved.tag) && (
                <Link href="/eventos">
                  <Button variant="outline" className="w-full bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-500">Limpar filtros</Button>
                </Link>
              )}
            </div>
          </aside>
          <div className="flex-1">
            {data.projects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">Nenhum evento encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {data.projects.map((project) => {
                    const cover = project.coverUrl || project.gallery?.images?.[0]?.url
                    return (
                      <Link key={project.id} href={`/portfolio/${project.slug}`} className="group">
                        <Card className="group overflow-hidden hover:shadow-xl glass transition-shadow">
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {cover && (
                              <Image src={cover} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                            {project.summary && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.summary}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {project.categories.map((cat, idx) => (
                                <span key={idx} className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded">{cat.category.name}</span>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
