/**
 * Página de Portfólio - Listagem de Projetos
 * 
 * Grid filtrável por categorias e tags
 * Com busca e paginação
 */

import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProjectStatus, Prisma } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Metadados da página
export const metadata: Metadata = {
  title: 'Portfólio',
  description: 'Veja todos os nossos trabalhos de fotografia profissional.',
}

// Revalidar a cada 30 minutos
export const revalidate = 1800

interface PortfolioPageProps {
  searchParams: Promise<{
    category?: string
    tag?: string
    page?: string
  }>
}

async function getPortfolioData(searchParams: {
  category?: string
  tag?: string
  page?: string
}) {
  const page = parseInt(searchParams.page || '1')
  const perPage = 12
  const skip = (page - 1) * perPage

  // Construir filtros
  const where: Prisma.ProjectWhereInput = {
    status: ProjectStatus.PUBLISHED,
  }

  if (searchParams.category) {
    where.categories = {
      some: {
        category: {
          slug: searchParams.category,
        },
      },
    }
  }

  if (searchParams.tag) {
    where.tags = {
      some: {
        tag: {
          slug: searchParams.tag,
        },
      },
    }
  }

  // Buscar projetos e contagem total em paralelo
  const [projects, total, categories, tags] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: perPage,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverUrl: true,
        publishedAt: true,
        categories: {
          select: {
            category: {
              select: { name: true, slug: true },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    }),
    prisma.project.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return { projects, total, totalPages, page, categories, tags }
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const resolvedSearchParams = await searchParams
  const data = await getPortfolioData(resolvedSearchParams)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-[linear-gradient(90deg,#858a86,#a6aab9,#ededed)] dark:bg-[linear-gradient(90deg,#4f6166,#c8bbb4)]">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Portfólio</h1>
          <p className="text-lg text-secondary-foreground max-w-2xl">
            Explore nossa coleção de trabalhos em fotografia profissional.
            Cada projeto conta uma história única.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-4 space-y-4">
              {/* Categorias */}
              <div>
                <h3 className="font-semibold mb-3">Categorias</h3>
                <div className="space-y-2">
                  <Link href="/portfolio">
                    <Button
                      variant={!resolvedSearchParams.category ? 'secondary' : 'ghost'}
                      className="w-full justify-start mb-1"
                    >
                      Todas
                    </Button>
                  </Link>
                  {data.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/portfolio?category=${category.slug}`}
                    >
                      <Button
                        variant={
                          resolvedSearchParams.category === category.slug
                            ? 'secondary'
                            : 'ghost'
                        }
                        className="w-full justify-start mb-1"
                      >
                        {category.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <Link key={tag.id} href={`/portfolio?tag=${tag.slug}`}>
                      <Button
                        variant={
                          resolvedSearchParams.tag === tag.slug ? 'default' : 'outline'
                        }
                        size="sm"
                      >
                        {tag.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Limpar filtros */}
              {(resolvedSearchParams.category || resolvedSearchParams.tag) && (
                <Link href="/portfolio">
                  <Button variant="outline" className="w-full">
                    Limpar filtros
                  </Button>
                </Link>
              )}
            </div>
          </aside>

          {/* Grid de Projetos */}
          <div className="flex-1">
            {data.projects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  Nenhum projeto encontrado com os filtros selecionados.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {data.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/portfolio/${project.slug}`}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-xl glass transition-shadow">
                        <div className="relative aspect-[4/3]">
                          {project.coverUrl && (
                            <Image
                              src={project.coverUrl}
                              alt={project.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                            {project.title}
                          </h3>
                          {project.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {project.summary}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {project.categories.map((cat, idx) => (
                              <span
                                key={idx}
                                className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                              >
                                {cat.category.name}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Paginação */}
                {data.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {data.page > 1 && (
                      <Link
                        href={`/portfolio?${new URLSearchParams({
                          ...resolvedSearchParams,
                          page: (data.page - 1).toString(),
                        })}`}
                      >
                        <Button variant="outline">Anterior</Button>
                      </Link>
                    )}

                    <div className="flex items-center gap-2">
                      {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Link
                            key={pageNum}
                            href={`/portfolio?${new URLSearchParams({
                              ...resolvedSearchParams,
                              page: pageNum.toString(),
                            })}`}
                          >
                            <Button
                              variant={
                                pageNum === data.page ? 'default' : 'outline'
                              }
                              size="sm"
                            >
                              {pageNum}
                            </Button>
                          </Link>
                        )
                      )}
                    </div>

                    {data.page < data.totalPages && (
                      <Link
                        href={`/portfolio?${new URLSearchParams({
                          ...resolvedSearchParams,
                          page: (data.page + 1).toString(),
                        })}`}
                      >
                        <Button variant="outline">Próxima</Button>
                      </Link>
                    )}
                  </div>
                )}

                {/* Informação sobre total */}
                <p className="text-center text-sm text-secondary-foreground mt-8">
                  Mostrando {data.projects.length} de {data.total} projetos
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}