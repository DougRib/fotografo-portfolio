/**
 * Página de Gerenciamento de Leads
 * 
 * Esta página exibe todos os contatos/orçamentos recebidos através do
 * formulário de contato do site. O fotógrafo pode:
 * - Ver todos os leads em formato de tabela
 * - Filtrar por período
 * - Ver detalhes completos de cada lead
 * - Marcar como respondido/não respondido (futura feature)
 * 
 * Os leads são ordenados do mais recente para o mais antigo.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPhone } from '@/lib/utils'
import { Mail, Phone, Calendar, MapPin, DollarSign, FileText, User } from 'lucide-react'

// Revalidar a cada 5 minutos
export const revalidate = 300

async function getLeads() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  })

  // Estatísticas
  const stats = {
    total: leads.length,
    thisMonth: leads.filter(lead => {
      const leadDate = new Date(lead.createdAt)
      const now = new Date()
      return leadDate.getMonth() === now.getMonth() && 
             leadDate.getFullYear() === now.getFullYear()
    }).length,
    thisWeek: leads.filter(lead => {
      const leadDate = new Date(lead.createdAt)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return leadDate >= weekAgo
    }).length,
  }

  return { leads, stats }
}

export default async function LeadsPage() {
  const { leads, stats } = await getLeads()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads e Contatos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os orçamentos e contatos recebidos
        </p>
      </div>

      {/* Cards com estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Leads</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Este Mês</CardDescription>
            <CardTitle className="text-3xl text-primary">{stats.thisMonth}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Esta Semana</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.thisWeek}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Leads</CardTitle>
          <CardDescription>
            {leads.length === 0
              ? 'Nenhum lead recebido ainda'
              : `${leads.length} lead${leads.length > 1 ? 's' : ''} recebido${leads.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum lead ainda</h3>
              <p className="text-sm text-muted-foreground">
                Os contatos recebidos através do formulário aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Informações de Contato */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{lead.name}</h3>
                          <div className="space-y-1 text-sm">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${lead.email}`} className="hover:text-primary">
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${lead.phone}`} className="hover:text-primary">
                                  {formatPhone(lead.phone)}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(lead.createdAt, {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Badges de tipo e origem */}
                        <div className="flex flex-wrap gap-2">
                          {lead.serviceType && (
                            <Badge variant="outline">
                              {lead.serviceType}
                            </Badge>
                          )}
                          {lead.source && (
                            <Badge variant="secondary">
                              {lead.source}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Detalhes do Evento/Projeto */}
                      <div className="space-y-2 text-sm">
                        {lead.eventDate && (
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <strong>Data do Evento:</strong><br />
                              {formatDate(lead.eventDate, {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        )}

                        {lead.eventLocation && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <strong>Local:</strong><br />
                              {lead.eventLocation}
                            </div>
                          </div>
                        )}

                        {lead.estimatedBudget && (
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <strong>Orçamento:</strong><br />
                              {lead.estimatedBudget}
                            </div>
                          </div>
                        )}

                        {lead.project && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <strong>Projeto Relacionado:</strong><br />
                              <a 
                                href={`/portfolio/${lead.project.slug}`}
                                target="_blank"
                                className="text-primary hover:underline"
                              >
                                {lead.project.title}
                              </a>
                            </div>
                          </div>
                        )}

                        {lead.referenceFileUrl && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <strong>Arquivo de Referência:</strong><br />
                              <a 
                                href={lead.referenceFileUrl}
                                target="_blank"
                                className="text-primary hover:underline"
                              >
                                Ver arquivo
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mensagem */}
                    {lead.message && (
                      <div className="mt-4 pt-4 border-t">
                        <strong className="text-sm">Mensagem:</strong>
                        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                          {lead.message}
                        </p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button size="sm" asChild>
                        <a href={`mailto:${lead.email}?subject=Re: Orçamento`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Responder
                        </a>
                      </Button>
                      {lead.phone && (
                        <Button size="sm" variant="outline" asChild>
                          <a 
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            WhatsApp
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}