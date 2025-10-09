/**
 * Route handler para UploadThing
 * 
 * Este arquivo é necessário para expor o File Router como uma rota da API.
 * O UploadThing usa esta rota para processar os uploads.
 */

import { createRouteHandler } from 'uploadthing/next'
import { uploadThingFileRouter } from './core'

// Exportar as rotas GET e POST
export const { GET, POST } = createRouteHandler({
  router: uploadThingFileRouter,
  
  // Configuração opcional
  config: {
    // Token de autenticação (virá do .env automaticamente)
    // uploadthingSecret: process.env.UPLOADTHING_SECRET,
  },
})