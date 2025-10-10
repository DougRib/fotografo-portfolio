/**
 * API de Projeto Individual
 * 
 * GET: Busca projeto por ID
 * PATCH: Atualiza projeto
 * DELETE: Remove projeto
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// Schema de validação para atualização
const updateProjectSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().optional(),
  summary: z.string().max(500).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).optional(),
  seoTitle: z.string().max(60).optional().nullable(),
  seoDesc: z.string().max(160).optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

// GET - Buscar projeto por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        gallery: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projeto' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar projeto
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    // TODO: Adicionar verificação de autenticação
    // const session = await getServerSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // Verificar se projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Se mudou para PUBLISHED e não tinha publishedAt, definir agora
    let publishedAt = existingProject.publishedAt
    if (
      validatedData.status === ProjectStatus.PUBLISHED &&
      !existingProject.publishedAt
    ) {
      publishedAt = new Date()
    }

    // Se slug foi alterado, verificar se já existe
    if (validatedData.slug && validatedData.slug !== existingProject.slug) {
      const slugExists = await prisma.project.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Já existe um projeto com este slug' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: {
      title?: string
      slug?: string
      summary?: string | null
      coverUrl?: string | null
      status?: ProjectStatus
      seoTitle?: string | null
      seoDesc?: string | null
      publishedAt?: Date | null
      categories?: { create: Array<{ categoryId: string }> }
      tags?: { create: Array<{ tagId: string }> }
    } = {
      title: validatedData.title,
      slug: validatedData.slug,
      summary: validatedData.summary,
      coverUrl: validatedData.coverUrl,
      status: validatedData.status,
      seoTitle: validatedData.seoTitle,
      seoDesc: validatedData.seoDesc,
      publishedAt,
    }

    // Atualizar categorias se fornecidas
    if (validatedData.categoryIds !== undefined) {
      // Remover todas as categorias atuais
      await prisma.projectCategory.deleteMany({
        where: { projectId: params.id },
      })

      // Adicionar novas categorias
      if (validatedData.categoryIds.length > 0) {
        updateData.categories = {
          create: validatedData.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        }
      }
    }

    // Atualizar tags se fornecidas
    if (validatedData.tagIds !== undefined) {
      // Remover todas as tags atuais
      await prisma.projectTag.deleteMany({
        where: { projectId: params.id },
      })

      // Adicionar novas tags
      if (validatedData.tagIds.length > 0) {
        updateData.tags = {
          create: validatedData.tagIds.map((tagId) => ({
            tagId,
          })),
        }
      }
    }

    // Atualizar projeto
    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        gallery: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Revalidar páginas do portfolio
    revalidatePath('/portfolio')
    revalidatePath(`/portfolio/${project.slug}`)

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    )
  }
}

// DELETE - Remover projeto
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    // TODO: Adicionar verificação de autenticação
    // const session = await getServerSession()
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    // Verificar se projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      select: { slug: true },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Deletar projeto (cascade vai deletar galeria e imagens automaticamente)
    await prisma.project.delete({
      where: { id: params.id },
    })

    // Revalidar páginas do portfolio
    revalidatePath('/portfolio')
    revalidatePath(`/portfolio/${existingProject.slug}`)

    return NextResponse.json(
      { message: 'Projeto removido com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao remover projeto' },
      { status: 500 }
    )
  }
}