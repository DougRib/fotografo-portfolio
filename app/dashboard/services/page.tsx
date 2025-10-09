/**
 * Página de Gerenciamento de Serviços/Pacotes
 * 
 * Permite ao fotógrafo criar, editar e gerenciar os pacotes de serviços
 * que aparecem na landing page do site. Cada serviço pode ter:
 * - Nome do pacote
 * - Descrição
 * - Preço "a partir de"
 * - Lista de features/inclus

ões
 * - Status ativo/inativo
 * - Ordem de exibição
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Loader2, DollarSign, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

// Schema de validação
const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  priceFrom: z.string().optional(),
  features: z.string().min(1, 'Adicione pelo menos uma feature'),
  active: z.boolean().default(true),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface Service {
  id: string
  name: string
  description: string
  priceFrom: number | null
  features: string[]
  active: boolean
  order: number
}

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  })

  // Carregar serviços
  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const response = await fetch('/api/services')
      if (!response.ok) throw new Error('Erro ao carregar serviços')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      toast.error('Erro ao carregar serviços')
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir dialog para criar/editar
  function openDialog(service?: Service) {
    if (service) {
      setEditingService(service)
      reset({
        name: service.name,
        description: service.description,
        priceFrom: service.priceFrom ? (service.priceFrom / 100).toString() : '',
        features: service.features.join('\n'),
        active: service.active,
      })
    } else {
      setEditingService(null)
      reset({
        name: '',
        description: '',
        priceFrom: '',
        features: '',
        active: true,
      })
    }
    setIsDialogOpen(true)
  }

  // Salvar serviço
  async function onSubmit(data: ServiceFormData) {
    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : '/api/services'
      
      const method = editingService ? 'PATCH' : 'POST'

      // Converter features de string para array
      const featuresArray = data.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0)

      // Converter preço para centavos
      const priceInCents = data.priceFrom
        ? Math.round(parseFloat(data.priceFrom) * 100)
        : null

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          priceFrom: priceInCents,
          features: featuresArray,
        }),
      })

      if (!response.ok) throw new Error('Erro ao salvar serviço')

      toast.success(
        editingService
          ? 'Serviço atualizado com sucesso!'
          : 'Serviço criado com sucesso!'
      )

      setIsDialogOpen(false)
      fetchServices()
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      toast.error('Erro ao salvar serviço')
    }
  }

  // Deletar serviço
  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar este serviço?')) return

    setIsDeletingId(id)

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao deletar serviço')

      toast.success('Serviço deletado com sucesso!')
      fetchServices()
      router.refresh()
    } catch (error) {
      console.error('Erro ao deletar serviço:', error)
      toast.error('Erro ao deletar serviço')
    } finally {
      setIsDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços e Pacotes</h1>
          <p className="text-muted-foreground">
            Gerencie os pacotes exibidos na landing page
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Lista de Serviços */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Comece criando seu primeiro pacote de serviços
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{service.name}</CardTitle>
                    {service.priceFrom && (
                      <CardDescription className="text-2xl font-bold text-primary mt-2">
                        A partir de {formatCurrency(service.priceFrom)}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={service.active ? 'success' : 'outline'}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>

                <div className="space-y-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDialog(service)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    disabled={isDeletingId === service.id}
                  >
                    {isDeletingId === service.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do pacote de serviço
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Pacote <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Pacote Completo"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Breve descrição do pacote..."
                rows={3}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="priceFrom">Preço apartir de: (R$)</Label>
              <Input
                id="priceFrom"
                type="number"
                step="0.01"
                {...register('priceFrom')}
                placeholder="1500.00"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio se não quiser exibir preço
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features">
                O que está incluído <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="features"
                {...register('features')}
                placeholder="Digite uma feature por linha:&#10;4 horas de cobertura&#10;150+ fotos editadas&#10;Galeria online"
                rows={6}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Digite uma feature por linha. Cada linha será um item da lista.
              </p>
              {errors.features && (
                <p className="text-sm text-red-600">{errors.features.message}</p>
              )}
            </div>

            {/* Ativo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                {...register('active')}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Exibir no site (ativo)
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Serviço'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}