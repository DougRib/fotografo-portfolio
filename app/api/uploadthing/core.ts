/**
 * File Router do UploadThing
 * 
 * Aqui definimos os diferentes "endpoints" de upload e suas regras:
 * - Tipos de arquivo permitidos
 * - Tamanho máximo
 * - Quantidade de arquivos
 * - Middleware para autenticação/validação
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import sharp from 'sharp'

const f = createUploadthing()

// Função auxiliar para verificar autenticação (implementar conforme seu sistema de auth)
// Por enquanto, vamos simular uma verificação básica
async function authenticate(req: Request) {
  // TODO: Implementar verificação real de autenticação
  // Exemplo: verificar cookie de sessão, JWT token, etc.
  
  // Por enquanto, retornamos um usuário mockado
  // Em produção, isso deve verificar se o usuário está autenticado
  return { id: 'user_123', role: 'ADMIN' }
}

/**
 * File Router - define os tipos de upload permitidos
 */
export const uploadThingFileRouter = {
  /**
   * Upload de imagens para galerias de projetos
   * - Apenas imagens
   * - Até 10 arquivos por vez
   * - Máximo 8MB por arquivo
   */
  projectImages: f({
    image: { 
      maxFileSize: '8MB',
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      // Verificar se usuário está autenticado e tem permissão
      const user = await authenticate(req)
      
      if (!user) {
        throw new UploadThingError('Não autorizado. Faça login para fazer upload.')
      }
      
      // Passar metadados que estarão disponíveis em onUploadComplete
      return { 
        userId: user.id,
        uploadedAt: new Date().toISOString(),
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Este callback é executado após o upload ser concluído
      console.log('✅ Upload concluído:', file.url)
      console.log('📋 Metadados:', metadata)
      
      // Aqui você pode:
      // 1. Gerar thumbnail usando Sharp
      // 2. Salvar informações no banco de dados
      // 3. Processar/otimizar a imagem
      // 4. Extrair EXIF data
      
      try {
        // Baixar a imagem original
        const response = await fetch(file.url)
        const buffer = Buffer.from(await response.arrayBuffer())
        
        // Obter dimensões da imagem
        const imageMetadata = await sharp(buffer).metadata()
        
        // Gerar thumbnail (400x300)
        const thumbnail = await sharp(buffer)
          .resize(400, 300, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 85 })
          .toBuffer()
        
        // Em produção, você faria upload do thumbnail para o UploadThing também
        // Por enquanto, apenas retornamos as informações
        
        return {
          uploadedBy: metadata.userId,
          fileUrl: file.url,
          fileName: file.name,
          fileSize: file.size,
          width: imageMetadata.width,
          height: imageMetadata.height,
          format: imageMetadata.format,
          // thumbUrl: 'URL do thumbnail após upload',
        }
      } catch (error) {
        console.error('❌ Erro ao processar imagem:', error)
        // Mesmo se o processamento falhar, o upload principal foi bem-sucedido
        return {
          uploadedBy: metadata.userId,
          fileUrl: file.url,
        }
      }
    }),

  /**
   * Upload de avatar/foto de perfil
   * - Apenas 1 imagem
   * - Máximo 2MB
   */
  avatar: f({
    image: { 
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await authenticate(req)
      
      if (!user) {
        throw new UploadThingError('Não autorizado')
      }
      
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Avatar enviado por:', metadata.userId)
      
      // Processar avatar (redimensionar para 200x200)
      try {
        const response = await fetch(file.url)
        const buffer = Buffer.from(await response.arrayBuffer())
        
        await sharp(buffer)
          .resize(200, 200, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 90 })
          .toBuffer()
        
        // Salvar no banco de dados ou retornar URL
      } catch (error) {
        console.error('❌ Erro ao processar avatar:', error)
      }
      
      return { url: file.url }
    }),

  /**
   * Upload de arquivo de referência no formulário de contato
   * - Imagens ou PDFs
   * - Apenas 1 arquivo
   * - Máximo 10MB
   */
  referenceFile: f({
    image: { maxFileSize: '10MB', maxFileCount: 1 },
    pdf: { maxFileSize: '10MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // Este endpoint não requer autenticação (formulário público)
      return { 
        source: 'contact-form',
        uploadedAt: new Date().toISOString(),
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Arquivo de referência enviado:', file.name)
      
      return {
        url: file.url,
        name: file.name,
        size: file.size,
      }
    }),

  /**
   * Upload de cover do projeto
   * - Apenas 1 imagem
   * - Máximo 5MB
   * - Para ser usada como capa/thumbnail do projeto
   */
  projectCover: f({
    image: { 
      maxFileSize: '5MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await authenticate(req)
      
      if (!user) {
        throw new UploadThingError('Não autorizado')
      }
      
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Cover de projeto enviado:', file.url)
      
      // Gerar versões otimizadas da cover
      try {
        const response = await fetch(file.url)
        const buffer = Buffer.from(await response.arrayBuffer())
        
        const imageMetadata = await sharp(buffer).metadata()
        
        // Gerar thumbnail para cards (600x400)
        await sharp(buffer)
          .resize(600, 400, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 85 })
          .toBuffer()
        
        return {
          url: file.url,
          width: imageMetadata.width,
          height: imageMetadata.height,
        }
      } catch (error) {
        console.error('❌ Erro ao processar cover:', error)
        return { url: file.url }
      }
    }),
} satisfies FileRouter

export type UploadThingFileRouter = typeof uploadThingFileRouter