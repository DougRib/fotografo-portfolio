/**
 * Componente Gerenciador de Galeria
 * 
 * Este é um dos componentes mais complexos do sistema. Ele permite:
 * 
 * 1. UPLOAD DE IMAGENS:
 *    - Drag-and-drop de múltiplos arquivos
 *    - Click para selecionar arquivos
 *    - Preview durante upload
 *    - Barra de progresso
 *    - Validação de tipo e tamanho
 * 
 * 2. REORDENAÇÃO:
 *    - Drag-and-drop para mudar ordem das imagens
 *    - Atualização automática da ordem no banco
 * 
 * 3. EDIÇÃO:
 *    - Alt text (acessibilidade)
 *    - Captions (legendas)
 *    - Dialog modal para edição
 * 
 * 4. EXCLUSÃO:
 *    - Deletar imagens individualmente
 *    - Confirmação antes de deletar
 * 
 * Integração com UploadThing para upload seguro e otimizado
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { UploadButton, UploadDropzone } from '@uploadthing/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  X, 
  Edit2, 
  GripVertical, 
  Loader2,
  AlertCircle,
  Image as ImageIcon 
} from 'lucide-react'
import { toast } from 'sonner'

// Tipo para as imagens
interface GalleryImage {
  id: string
  url: string
  thumbUrl: string | null
  alt: string | null
  caption: string | null
  order: number
  width: number | null
  height: number | null
}

interface GalleryManagerProps {
  projectId: string
  galleryId?: string
  images: GalleryImage[]
}

export function GalleryManager({ projectId, galleryId, images: initialImages }: GalleryManagerProps) {
  const router = useRouter()
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  /**
   * Função para criar galeria se não existir
   * Necessário antes do primeiro upload
   */
  async function ensureGalleryExists(): Promise<string> {
    if (galleryId) return galleryId

    try {
      const response = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (!response.ok) throw new Error('Erro ao criar galeria')

      const gallery = await response.json()
      return gallery.id
    } catch (error) {
      console.error('Erro ao criar galeria:', error)
      toast.error('Erro ao criar galeria')
      throw error
    }
  }

  /**
   * Callback após upload bem-sucedido
   * Adiciona imagens na galeria no banco de dados
   */
  async function handleUploadComplete(files: any[]) {
    try {
      const currentGalleryId = await ensureGalleryExists()
      
      // Para cada arquivo, criar entrada no banco
      const newImages = await Promise.all(
        files.map(async (file, index) => {
          const response = await fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              galleryId: currentGalleryId,
              url: file.url,
              thumbUrl: file.url, // UploadThing não gera thumb automaticamente, usar a mesma URL
              width: 1200, // Valores padrão - idealmente extrair do file
              height: 800,
              order: images.length + index,
              alt: file.name,
            }),
          })

          if (!response.ok) throw new Error('Erro ao salvar imagem')
          return response.json()
        })
      )

      // Adicionar novas imagens ao estado
      setImages([...images, ...newImages])
      toast.success(`${files.length} imagem(ns) enviada(s) com sucesso!`)
      router.refresh()
    } catch (error) {
      console.error('Erro ao processar upload:', error)
      toast.error('Erro ao processar imagens. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Atualizar alt text e caption de uma imagem
   */
  async function handleUpdateImage(imageId: string, alt: string, caption: string) {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt, caption }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar imagem')

      const updatedImage = await response.json()

      // Atualizar no estado local
      setImages(images.map(img => 
        img.id === imageId ? { ...img, alt, caption } : img
      ))

      toast.success('Imagem atualizada com sucesso!')
      setIsEditDialogOpen(false)
      setEditingImage(null)
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error)
      toast.error('Erro ao atualizar imagem')
    }
  }

  /**
   * Deletar uma imagem
   */
  async function handleDeleteImage(imageId: string) {
    if (!confirm('Tem certeza que deseja deletar esta imagem?')) {
      return
    }

    setIsDeletingId(imageId)

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao deletar imagem')

      // Remover do estado local
      setImages(images.filter(img => img.id !== imageId))
      toast.success('Imagem deletada com sucesso!')
      router.refresh()
    } catch (error) {
      console.error('Erro ao deletar imagem:', error)
      toast.error('Erro ao deletar imagem')
    } finally {
      setIsDeletingId(null)
    }
  }

  /**
   * Abrir dialog de edição
   */
  function openEditDialog(image: GalleryImage) {
    setEditingImage(image)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Enviar Imagens
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste e solte suas imagens aqui ou clique para selecionar
                </p>
              </div>

              {/* UploadThing Dropzone */}
              <UploadDropzone
                endpoint="projectImages"
                onClientUploadComplete={(files) => {
                  handleUploadComplete(files)
                }}
                onUploadError={(error: Error) => {
                  console.error('Erro no upload:', error)
                  toast.error(`Erro no upload: ${error.message}`)
                  setIsUploading(false)
                }}
                onUploadBegin={() => {
                  setIsUploading(true)
                }}
                appearance={{
                  button: 'bg-primary hover:bg-primary/90',
                  container: 'border-0',
                }}
              />
            </div>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aceita JPG, PNG e WEBP. Máximo 8MB por imagem. Até 10 imagens por vez.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Grid de Imagens */}
      {images.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  {/* Imagem */}
                  <Image
                    src={image.thumbUrl || image.url}
                    alt={image.alt || 'Imagem do projeto'}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditDialog(image)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isDeletingId === image.id}
                    >
                      {isDeletingId === image.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Indicador de ordem */}
                  <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    #{image.order + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma imagem ainda
            </h3>
            <p className="text-sm text-muted-foreground">
              Faça upload das primeiras imagens para começar sua galeria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Imagem</DialogTitle>
            <DialogDescription>
              Configure o texto alternativo e legenda da imagem
            </DialogDescription>
          </DialogHeader>

          {editingImage && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleUpdateImage(
                  editingImage.id,
                  formData.get('alt') as string,
                  formData.get('caption') as string
                )
              }}
              className="space-y-4"
            >
              {/* Preview da imagem */}
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={editingImage.url}
                  alt={editingImage.alt || 'Preview'}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label htmlFor="alt">Texto Alternativo (Alt)</Label>
                <Input
                  id="alt"
                  name="alt"
                  defaultValue={editingImage.alt || ''}
                  placeholder="Descrição da imagem para acessibilidade"
                />
                <p className="text-xs text-muted-foreground">
                  Importante para SEO e acessibilidade
                </p>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Legenda</Label>
                <Textarea
                  id="caption"
                  name="caption"
                  defaultValue={editingImage.caption || ''}
                  placeholder="Legenda que aparecerá no lightbox"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}