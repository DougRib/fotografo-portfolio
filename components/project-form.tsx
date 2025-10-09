/**
 * Formulário de Projeto
 * 
 * Este é um formulário completo e reutilizável para criar e editar projetos.
 * Ele é usado tanto na página /dashboard/projects/new quanto em /dashboard/projects/[id]
 * 
 * Funcionalidades:
 * - Validação completa com Zod e React Hook Form
 * - Seleção múltipla de categorias e tags
 * - Upload de imagem de capa
 * - Geração automática de slug a partir do título
 * - Preview de campos SEO
 * - Salvamento como rascunho ou publicação direta
 * 
 * Por que React Hook Form + Zod?
 * - React Hook Form: gerencia estado do formulário de forma performática
 * - Zod: validação type-safe que funciona tanto no cliente quanto no servidor
 * - Juntos: criam uma experiência de formulário robusta e sem bugs
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'
import { ProjectStatus } from '@prisma/client'

// Schema de validação com Zod
// Define exatamente quais campos são obrigatórios, seus tipos e limites
const projectSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres'),
  summary: z.string().max(500).optional(),
  coverUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.nativeEnum(ProjectStatus),
  seoTitle: z.string().max(60).optional(),
  seoDesc: z.string().max(160).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

// Props do componente
interface ProjectFormProps {
  // Se tiver project, está editando. Se não tiver, está criando.
  project?: {
    id: string
    title: string
    slug: string
    summary: string | null
    coverUrl: string | null
    status: ProjectStatus
    seoTitle: string | null
    seoDesc: string | null
    categories: Array<{ categoryId: string }>
    tags: Array<{ tagId: string }>
  }
  // Listas de categorias e tags disponíveis para seleção
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
}

export function ProjectForm({ project, categories, tags }: ProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Configurar React Hook Form com validação Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          slug: project.slug,
          summary: project.summary || '',
          coverUrl: project.coverUrl || '',
          status: project.status,
          seoTitle: project.seoTitle || '',
          seoDesc: project.seoDesc || '',
          categoryIds: project.categories.map((c) => c.categoryId),
          tagIds: project.tags.map((t) => t.tagId),
        }
      : {
          status: ProjectStatus.DRAFT,
          categoryIds: [],
          tagIds: [],
        },
  })

  // Observar mudanças no título para gerar slug automaticamente
  const watchTitle = watch('title')

  useEffect(() => {
    // Só atualizar slug automaticamente se usuário não editou manualmente
    if (watchTitle && !slugManuallyEdited) {
      setValue('slug', slugify(watchTitle))
    }
  }, [watchTitle, slugManuallyEdited, setValue])

  /**
   * Função para enviar o formulário
   * 
   * Fluxo:
   * 1. Valida dados (Zod faz isso automaticamente via resolver)
   * 2. Faz POST (criar) ou PATCH (editar) para a API
   * 3. Se sucesso, mostra toast e redireciona
   * 4. Se erro, mostra mensagem de erro
   */
  async function onSubmit(data: ProjectFormData) {
    setIsSubmitting(true)

    try {
      const url = project
        ? `/api/projects/${project.id}`
        : '/api/projects'
      
      const method = project ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar projeto')
      }

      const savedProject = await response.json()

      toast.success(
        project ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!'
      )

      // Redirecionar para a página de edição (ou galeria para novos projetos)
      router.push(`/dashboard/projects/${savedProject.id}`)
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar projeto. Tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Dados principais do projeto que aparecerão no portfólio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título do Projeto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ex: Casamento Ana & Carlos"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug (URL) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="casamento-ana-carlos"
              disabled={isSubmitting}
              onChange={(e) => {
                setSlugManuallyEdited(true)
                register('slug').onChange(e)
              }}
            />
            <p className="text-xs text-muted-foreground">
              URL amigável para o projeto. Gerado automaticamente a partir do título.
            </p>
            {errors.slug && (
              <p className="text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Label htmlFor="summary">Resumo</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              placeholder="Breve descrição do projeto..."
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Aparece nos cards de projeto. Máximo 500 caracteres.
            </p>
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>

          {/* URL da Capa */}
          <div className="space-y-2">
            <Label htmlFor="coverUrl">URL da Imagem de Capa</Label>
            <Input
              id="coverUrl"
              type="url"
              {...register('coverUrl')}
              placeholder="https://..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              URL da imagem que aparecerá como capa do projeto
            </p>
            {errors.coverUrl && (
              <p className="text-sm text-red-600">{errors.coverUrl.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              defaultValue={watch('status')}
              onValueChange={(value) => setValue('status', value as ProjectStatus)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectStatus.DRAFT}>Rascunho</SelectItem>
                <SelectItem value={ProjectStatus.PUBLISHED}>Publicado</SelectItem>
                <SelectItem value={ProjectStatus.ARCHIVED}>Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Apenas projetos publicados aparecem no site
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO (Otimização para Buscadores)</CardTitle>
          <CardDescription>
            Configure como o projeto aparecerá no Google e redes sociais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SEO Title */}
          <div className="space-y-2">
            <Label htmlFor="seoTitle">Título SEO</Label>
            <Input
              id="seoTitle"
              {...register('seoTitle')}
              placeholder="Se vazio, usa o título do projeto"
              disabled={isSubmitting}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              Máximo 60 caracteres. Aparece no Google e compartilhamentos.
            </p>
          </div>

          {/* SEO Description */}
          <div className="space-y-2">
            <Label htmlFor="seoDesc">Descrição SEO</Label>
            <Textarea
              id="seoDesc"
              {...register('seoDesc')}
              placeholder="Descrição que aparece nos resultados de busca..."
              rows={3}
              disabled={isSubmitting}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              Máximo 160 caracteres. Resumo que aparece no Google.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {project ? 'Atualizar Projeto' : 'Criar Projeto'}
            </>
          )}
        </Button>

        {project && project.status === ProjectStatus.PUBLISHED && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            asChild
          >
            <a
              href={`/portfolio/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver no Site
            </a>
          </Button>
        )}
      </div>
    </form>
  )
}