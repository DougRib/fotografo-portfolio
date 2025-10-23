/**
 * Página de Listagem de Projetos
 * 
 * Esta é a página principal de gerenciamento de projetos no dashboard.
 * Aqui o fotógrafo pode:
 * - Ver todos os seus projetos em formato de tabela
 * - Filtrar por status (Publicado, Rascunho, Arquivado)
 * - Buscar projetos por título
 * - Criar novo projeto
 * - Editar ou deletar projetos existentes
 * 
 * A tabela usa Server Components do Next.js para performance otimizada.
 * Os dados são buscados diretamente do banco via Prisma, sem necessidade de API.
 */

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ProjectActions } from '@/components/project-actions'
import { prisma } from '@/lib/prisma'
import { ProjectStatus, Prisma } from '@prisma/client'
import { formatDate } from '@/lib/utils'
import { Plus, FolderOpen } from 'lucide-react'

// Revalidar dados a cada 5 minutos
export const revalidate = 300

// Interface para os parâmetros de busca da URL
interface ProjectsPageProps {
  searchParams: Promise<{
    status?: ProjectStatus
    search?: string
  }>
}

/**
 * Função para buscar projetos do banco de dados
 * Aceita filtros opcionais de status e busca por texto
 */
async function getProjects(searchParams: Awaited<ProjectsPageProps['searchParams']>) {
  const where: Prisma.ProjectWhereInput = {}

  // Filtrar por status se fornecido
  if (searchParams.status) {
    where.status = searchParams.status
  }

  // Buscar por título se fornecido
  if (searchParams.search) {
    where.title = {
      contains: searchParams.search,
      mode: 'insensitive', // Case-insensitive search
    }
  }

  // Buscar projetos com informações relacionadas
  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: 'desc' }, // Mais recentemente atualizados primeiro
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      gallery: {
        include: {
          images: {
            take: 1, // Apenas a primeira imagem para thumbnail
            orderBy: { order: 'asc' },
          },
        },
      },
      _count: {
        select: {
          leads: true, // Contar quantos leads vieram deste projeto
        },
      },
    },
  })

  // Contar projetos por status para mostrar nos filtros
  const statusCounts = await prisma.project.groupBy({
    by: ['status'],
    _count: true,
  })

  return { projects, statusCounts }
}

/**
 * Componente principal da página
 * Server Component que renderiza no servidor para melhor SEO e performance
 */
export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams
  const { projects, statusCounts } = await getProjects(resolvedSearchParams)

  // Converter counts em objeto para fácil acesso
  const counts = statusCounts.reduce((acc, curr) => {
    acc[curr.status] = curr._count
    return acc
  }, {} as Record<ProjectStatus, number>)

  return (
    <div className="space-y-6">
      {/* Header com título e botão de criar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seu portfólio de projetos fotográficos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      {/* Cards com estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/dashboard/projects">
          <Card className={`cursor-pointer transition-colors ${!resolvedSearchParams.status ? 'border-primary' : 'hover:border-muted-foreground/50'}`}>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">
                {projects.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/projects?status=PUBLISHED">
          <Card className={`cursor-pointer transition-colors ${resolvedSearchParams.status === 'PUBLISHED' ? 'border-primary' : 'hover:border-muted-foreground/50'}`}>
            <CardHeader className="pb-2">
              <CardDescription>Publicados</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {counts.PUBLISHED || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/projects?status=DRAFT">
          <Card className={`cursor-pointer transition-colors ${resolvedSearchParams.status === 'DRAFT' ? 'border-primary' : 'hover:border-muted-foreground/50'}`}>
            <CardHeader className="pb-2">
              <CardDescription>Rascunhos</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {counts.DRAFT || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/projects?status=ARCHIVED">
          <Card className={`cursor-pointer transition-colors ${resolvedSearchParams.status === 'ARCHIVED' ? 'border-primary' : 'hover:border-muted-foreground/50'}`}>
            <CardHeader className="pb-2">
              <CardDescription>Arquivados</CardDescription>
              <CardTitle className="text-3xl text-gray-600">
                {counts.ARCHIVED || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Tabela de projetos */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Projetos</CardTitle>
          <CardDescription>
            {projects.length === 0
              ? 'Você ainda não criou nenhum projeto'
              : `${projects.length} projeto${projects.length > 1 ? 's' : ''} encontrado${projects.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            // Estado vazio - nenhum projeto encontrado
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                {resolvedSearchParams.status || resolvedSearchParams.search
                  ? 'Tente ajustar seus filtros ou criar um novo projeto.'
                  : 'Comece criando seu primeiro projeto para mostrar seu trabalho.'}
              </p>
              <Button asChild>
                <Link href="/dashboard/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Projeto
                </Link>
              </Button>
            </div>
          ) : (
            // Tabela com projetos
            <Table>
              <TableHeader >
                <TableRow>
                  <TableHead className="w-[60px] ">Cover</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    {/* Cover/Thumbnail */}
                    <TableCell>
                      {project.coverUrl ? (
                        <div className="relative h-12 w-12 rounded-md overflow-hidden">
                          <Image
                            src={project.coverUrl}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>

                    {/* Título */}
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.title}
                      </Link>
                    </TableCell>

                    {/* Categoria */}
                    <TableCell>
                      {project.categories.length > 0 ? (
                        <span className="text-sm text-muted-foreground">
                          {project.categories[0].category.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={
                          project.status === ProjectStatus.PUBLISHED
                            ? 'success'
                            : project.status === ProjectStatus.DRAFT
                            ? 'warning'
                            : 'outline'
                        }
                      >
                        {project.status === ProjectStatus.PUBLISHED && 'Publicado'}
                        {project.status === ProjectStatus.DRAFT && 'Rascunho'}
                        {project.status === ProjectStatus.ARCHIVED && 'Arquivado'}
                      </Badge>
                    </TableCell>

                    {/* Leads */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {project._count.leads}
                      </span>
                    </TableCell>

                    {/* Data de atualização */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(project.updatedAt, {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right">
                      <ProjectActions project={project} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
