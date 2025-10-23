/**
 * Página de Gerenciamento de Depoimentos
 * 
 * Permite criar, editar e gerenciar depoimentos de clientes que aparecem
 * na landing page. Cada depoimento contém:
 * - Nome do autor
 * - Cargo/papel (ex: "Noiva", "Empresário")
 * - Avatar/foto (URL)
 * - Texto do depoimento
 * - Visibilidade (ativo/inativo)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
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
import { Plus, Edit2, Trash2, Loader2, Quote, User } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

const testimonialSchema = z.object({
  author: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.string().optional(),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  text: z.string().min(20, 'Depoimento deve ter pelo menos 20 caracteres'),
  visible: z.boolean().default(true),
})

type TestimonialFormData = z.infer<typeof testimonialSchema>

interface Testimonial {
  id: string
  author: string
  role: string | null
  avatarUrl: string | null
  text: string
  visible: boolean
}

export default function TestimonialsPage() {
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  async function fetchTestimonials() {
    try {
      const response = await fetch('/api/testimonials')
      if (!response.ok) throw new Error('Erro ao carregar depoimentos')
      const data = await response.json()
      setTestimonials(data)
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error)
      toast.error('Erro ao carregar depoimentos')
    } finally {
      setIsLoading(false)
    }
  }

  function openDialog(testimonial?: Testimonial) {
    if (testimonial) {
      setEditingTestimonial(testimonial)
      reset({
        author: testimonial.author,
        role: testimonial.role || '',
        avatarUrl: testimonial.avatarUrl || '',
        text: testimonial.text,
        visible: testimonial.visible,
      })
    } else {
      setEditingTestimonial(null)
      reset({
        author: '',
        role: '',
        avatarUrl: '',
        text: '',
        visible: true,
      })
    }
    setIsDialogOpen(true)
  }

  async function onSubmit(data: TestimonialFormData) {
    try {
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial.id}`
        : '/api/testimonials'
      
      const method = editingTestimonial ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Erro ao salvar depoimento')

      toast.success(
        editingTestimonial
          ? 'Depoimento atualizado com sucesso!'
          : 'Depoimento criado com sucesso!'
      )

      setIsDialogOpen(false)
      fetchTestimonials()
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error)
      toast.error('Erro ao salvar depoimento')
    }
  }

  async function handleDelete(id: string) {
    setIsDeletingId(id)

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao deletar depoimento')

      toast.success('Depoimento deletado com sucesso!')
      fetchTestimonials()
      router.refresh()
    } catch (error) {
      console.error('Erro ao deletar depoimento:', error)
      toast.error('Erro ao deletar depoimento')
    } finally {
      setIsDeletingId(null)
      setPendingDeleteId(null)
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
          <h1 className="text-3xl font-bold tracking-tight">Depoimentos</h1>
          <p className="text-muted-foreground">
            Gerencie os depoimentos exibidos na landing page
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Depoimento
        </Button>
      </div>

      {/* Lista de Depoimentos */}
      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Quote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum depoimento cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Adicione depoimentos de clientes para aumentar sua credibilidade
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Depoimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {testimonial.avatarUrl ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={testimonial.avatarUrl}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{testimonial.author}</CardTitle>
                    {testimonial.role && (
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    )}
                  </div>
                  <Badge variant={testimonial.visible ? 'success' : 'outline'}>
                    {testimonial.visible ? 'Visível' : 'Oculto'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Quote className="h-8 w-8 text-muted-foreground/20 absolute -top-2 -left-2" />
                  <p className="text-sm text-muted-foreground italic pl-6">
                    {testimonial.text}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDialog(testimonial)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPendingDeleteId(testimonial.id)}
                    disabled={isDeletingId === testimonial.id}
                  >
                    {isDeletingId === testimonial.id ? (
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
        <DialogContent className="max-w-2xl bg-[linear-gradient(180deg,#f8fafc,#ffffff)] dark:bg-[linear-gradient(180deg,#0b0b0c,#111214)] border border-primary/30 shadow-2xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do depoimento do cliente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome do Autor */}
            <div className="space-y-2">
              <Label htmlFor="author">
                Nome do Cliente <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author"
                {...register('author')}
                placeholder="Ex: Maria Silva"
                disabled={isSubmitting}
              />
              {errors.author && (
                <p className="text-sm text-red-600">{errors.author.message}</p>
              )}
      </div>

            {/* Cargo/Papel */}
            <div className="space-y-2">
              <Label htmlFor="role">Cargo ou Papel</Label>
              <Input
                id="role"
                {...register('role')}
                placeholder="Ex: Noiva, Empresário, Designer"
                disabled={isSubmitting}
              />
            </div>

            {/* URL do Avatar */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL da Foto</Label>
              <Input
                id="avatarUrl"
                type="url"
                {...register('avatarUrl')}
                placeholder="https://..."
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                URL da foto do cliente (opcional)
              </p>
            </div>

            {/* Texto do Depoimento */}
            <div className="space-y-2">
              <Label htmlFor="text">
                Depoimento <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="text"
                {...register('text')}
                placeholder="O que o cliente disse sobre seu trabalho..."
                rows={5}
                disabled={isSubmitting}
              />
              {errors.text && (
                <p className="text-sm text-red-600">{errors.text.message}</p>
              )}
            </div>

            {/* Visível */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visible"
                {...register('visible')}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="visible" className="cursor-pointer">
                Exibir no site (visível)
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="min-w-[120px] hover:bg-red-500 transition-colors duration-200 hover:text-white"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[180px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Depoimento'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={() => setPendingDeleteId(null)}>
        <AlertDialogContent className="max-w-md bg-[linear-gradient(180deg,#f8fafc,#ffffff)] dark:bg-[linear-gradient(180deg,#0b0b0c,#111214)] border border-primary/30 shadow-2xl sm:rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir depoimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O depoimento será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-w-[120px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[140px]"
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
