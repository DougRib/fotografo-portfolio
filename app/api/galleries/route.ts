/**
 * API de Galerias
 * 
 * POST: Criar nova galeria para um projeto
 * 
 * Uma galeria é criada automaticamente quando o primeiro upload
 * de imagem é feito para um projeto que ainda não tem galeria.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema de validação
const createGallerySchema = z.object({
  projectId: z.string(),
})

// POST - Criar galeria
export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar autenticação
    
    const body = await request.json()
    const validatedData = createGallerySchema.parse(body)

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe galeria para este projeto
    const existingGallery = await prisma.gallery.findUnique({
      where: { projectId: validatedData.projectId },
    })

    if (existingGallery) {
      // Retornar galeria existente
      return NextResponse.json(existingGallery)
    }

    // Criar nova galeria
    const gallery = await prisma.gallery.create({
      data: {
        projectId: validatedData.projectId,
      },
    })

    return NextResponse.json(gallery, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar galeria:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar galeria' },
      { status: 500 }
    )
  }
}