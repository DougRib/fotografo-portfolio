/**
 * Componente de Ações do Projeto
 * 
 * Este componente fornece um menu dropdown com ações que podem ser realizadas
 * em cada projeto da listagem. As ações incluem:
 * - Editar: vai para página de edição
 * - Ver no site: abre o projeto no site público (nova aba)
 * - Galeria: gerenciar imagens do projeto
 * - Deletar: remove o projeto (com confirmação)
 * 
 * É um Client Component porque precisa de interatividade (clicks, states, etc.)
 * O 'use client' na primeira linha indica isso para o Next.js.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, ExternalLink, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Interface para as props do componente
// Recebe o projeto completo para ter acesso aos dados necessários
interface ProjectActionsProps {
  project: {
    id: string
    slug: string
    title: string
    status: string
  }
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Função para deletar o projeto
   * 
   * Fluxo:
   * 1. Faz requisição DELETE para a API
   * 2. Se sucesso, mostra toast de sucesso e refresh a página
   * 3. Se erro, mostra toast de erro
   * 
   * O refresh() do router força o Next.js a buscar dados atualizados do servidor
   */
  async function handleDelete() {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar projeto')
      }

      // Sucesso!
      toast.success('Projeto deletado com sucesso')
      setIsDeleteDialogOpen(false)
      
      // Refresh a página para mostrar a lista atualizada
      router.refresh()
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
      toast.error('Erro ao deletar projeto. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Dropdown Menu com as ações */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Editar */}
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/projects/${project.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>

          {/* Ver no site (só se publicado) */}
          {project.status === 'PUBLISHED' && (
            <DropdownMenuItem asChild>
              <Link
                href={`/portfolio/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver no site
              </Link>
            </DropdownMenuItem>
          )}

          {/* Gerenciar galeria */}
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/projects/${project.id}/gallery`}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Galeria
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Deletar */}
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de confirmação de deleção */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md bg-[linear-gradient(180deg,#f8fafc,#ffffff)] dark:bg-[linear-gradient(180deg,#0b0b0c,#111214)] border border-primary/30 shadow-2xl sm:rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto “{project.title}” e todas as suas imagens serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="min-w-[120px]"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="min-w-[160px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar Projeto'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
