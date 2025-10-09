/**
 * Dashboard Overview
 * 
 * Página principal do dashboard com estatísticas e atividades recentes
 */

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import { formatDate, formatPhone } from '@/lib/utils'
import {
  FolderOpen,
  Users,
  MessageSquare,
  Eye,
  ArrowRight,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react'

// Revalidar a cada 5 minutos
export const revalidate = 300

async function getDashboardData() {
  // Buscar estatísticas em paralelo
  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    totalLeads,
    recentLeads,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: ProjectStatus.PUBLISHED } }),
    prisma.project.count({ where: { status: ProjectStatus.DRAFT } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  return {
    stats: {
      totalProjects,
      publishedProjects,
      draftProjects,
      totalLeads,
    },
    recentLeads,
    recentProjects,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      title: 'Total de Projetos',
      value: data.stats.totalProjects,
      icon: FolderOpen,
      description: `${data.stats.publishedProjects} publicados`,
      href: '/dashboard/projects',
    },
    {
      title: 'Leads Recebidos',
      value: data.stats.totalLeads,
      icon: Users,
      description: 'Contatos e orçamentos',
      href: '/dashboard/leads',
    },
    {
      title: 'Rascunhos',
      value: data.stats.draftProjects,
      icon: MessageSquare,
      description: 'Projetos não publicados',
      href: '/dashboard/projects?status=DRAFT',
    },
    {
      title: 'Visitas (Em Breve)',
      value: '0',
      icon: Eye,
      description: 'Analytics disponível em breve',
      href: '/dashboard',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu portfólio e atividades
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Leads Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Leads Recentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Últimos contatos recebidos
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/leads">
                Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum lead recebido ainda
              </p>
            ) : (
              <div className="space-y-4">
                {data.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {lead.name}
                      </p>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatPhone(lead.phone)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(lead.createdAt, {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projetos Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projetos Recentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Últimos projetos criados/editados
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/projects">
                Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhum projeto criado ainda
                </p>
                <Button asChild size="sm">
                  <Link href="/dashboard/projects/new">Criar Projeto</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {project.coverUrl ? (
                      <div
                        className="h-12 w-12 shrink-0 rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${project.coverUrl})` }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FolderOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {project.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            project.status === ProjectStatus.PUBLISHED
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {project.status === ProjectStatus.PUBLISHED
                            ? 'Publicado'
                            : 'Rascunho'}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDate(project.updatedAt, {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-auto py-4" variant="outline">
              <Link href="/dashboard/projects/new" className="flex flex-col gap-2">
                <FolderOpen className="h-6 w-6" />
                <span>Novo Projeto</span>
              </Link>
            </Button>
            
            <Button asChild className="h-auto py-4" variant="outline">
              <Link href="/dashboard/leads" className="flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Ver Leads</span>
              </Link>
            </Button>
            
            <Button asChild className="h-auto py-4" variant="outline">
              <Link href="/portfolio" target="_blank" className="flex flex-col gap-2">
                <Eye className="h-6 w-6" />
                <span>Ver Site</span>
              </Link>
            </Button>
            
            <Button asChild className="h-auto py-4" variant="outline">
              <Link href="/dashboard/settings" className="flex flex-col gap-2">
                <MessageSquare className="h-6 w-6" />
                <span>Configurações</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}