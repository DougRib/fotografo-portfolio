/**
 * Formulário de Contato
 * 
 * Formulário completo com validação Zod e React Hook Form.
 * Envia leads para a API e mostra feedback ao usuário.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from './ui/textarea'

// Schema de validação
const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  serviceType: z.string().optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  estimatedBudget: z.string().optional(),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(1000),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          source: 'formulario-home',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar mensagem')
      }

      // Sucesso!
      setIsSuccess(true)
      toast.success('Mensagem enviada com sucesso!', {
        description: 'Entraremos em contato em breve.',
      })

      // Limpar formulário após 3 segundos
      setTimeout(() => {
        reset()
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      toast.error('Erro ao enviar mensagem', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Mensagem enviada!</h3>
          <p className="text-muted-foreground">
            Obrigado pelo contato. Responderemos em breve.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bg-[linear-gradient(180deg,#dedede,#ffffff)] border-primary text-primary-foreground'>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Seu nome"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email">
              E-mail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(51) 99999-9999"
              {...register('phone')}
              disabled={isSubmitting}
            />
          </div>

          {/* Grid com 2 colunas em telas maiores */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Tipo de Serviço */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de Serviço</Label>
              <select
                id="serviceType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('serviceType')}
                disabled={isSubmitting}
              >
                <option value="">Selecione...</option>
                <option value="Casamento">Casamento</option>
                <option value="Ensaio Pre-wedding">Ensaio Pre-wedding</option>
                <option value="Retrato">Retrato</option>
                <option value="Evento Corporativo">Evento Corporativo</option>
                <option value="Arquitetura">Arquitetura</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Data do Evento */}
            <div className="space-y-2">
              <Label htmlFor="eventDate">Data do Evento</Label>
              <Input
                id="eventDate"
                type="date"
                {...register('eventDate')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Local do Evento */}
          <div className="space-y-2">
            <Label htmlFor="eventLocation">Local do Evento</Label>
            <Input
              id="eventLocation"
              placeholder="Cidade ou endereço"
              {...register('eventLocation')}
              disabled={isSubmitting}
            />
          </div>

          {/* Orçamento Estimado */}
          <div className="space-y-2">
            <Label htmlFor="estimatedBudget">Orçamento Estimado</Label>
            <select
              id="estimatedBudget"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('estimatedBudget')}
              disabled={isSubmitting}
            >
              <option value="">Selecione...</option>
              <option value="Até R$ 2.000">Até R$ 2.000</option>
              <option value="R$ 2.000 - R$ 4.000">R$ 2.000 - R$ 4.000</option>
              <option value="R$ 4.000 - R$ 6.000">R$ 4.000 - R$ 6.000</option>
              <option value="R$ 6.000 - R$ 10.000">R$ 6.000 - R$ 10.000</option>
              <option value="Acima de R$ 10.000">Acima de R$ 10.000</option>
            </select>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Mensagem <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Conte-nos mais sobre seu projeto..."
              rows={6}
              {...register('message')}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* Botão de Envio */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Enviar Mensagem
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao enviar este formulário, você concorda com nossa política de privacidade.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}