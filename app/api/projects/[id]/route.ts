import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ProjectStatus, Prisma } from '@prisma/client'
import { slugify } from '@/lib/utils'

const updateProjectSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).optional(),
  summary: z.string().max(500).nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  seoTitle: z.string().max(60).nullable().optional(),
  seoDesc: z.string().max(160).nullable().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updateProjectSchema.parse(body)

    // Se slug não fornecido mas título mudou, gerar slug
    let resolvedSlug = data.slug
    if (!resolvedSlug && data.title) {
      resolvedSlug = slugify(data.title)
    }

    // Preparar payload
    const updateData: Prisma.ProjectUpdateInput = {
      title: data.title,
      slug: resolvedSlug,
      summary: data.summary ?? undefined,
      coverUrl: data.coverUrl ?? undefined,
      status: data.status,
      seoTitle: data.seoTitle ?? undefined,
      seoDesc: data.seoDesc ?? undefined,
    }

    // Ajustar publishedAt quando publicar
    if (data.status === ProjectStatus.PUBLISHED) {
      updateData.publishedAt = new Date()
    }

    // Atualizar categorias e tags se fornecidas
    if (data.categoryIds) {
      updateData.categories = {
        deleteMany: {},
        create: data.categoryIds.map((categoryId) => ({ categoryId })),
      }
    }
    if (data.tagIds) {
      updateData.tags = {
        deleteMany: {},
        create: data.tagIds.map((tagId) => ({ tagId })),
      }
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        gallery: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    })

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Projeto removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar projeto' },
      { status: 500 }
    )
  }
}
