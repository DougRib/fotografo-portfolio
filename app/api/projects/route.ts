/**
 * API de Projetos - CRUD Completo
 * 
 * GET: Lista projetos (público, com filtros)
 * POST: Cria novo projeto (requer auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import { slugify } from '@/lib/utils'

// Schema de validação para criação de projeto
const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  summary: z.string().max(500).optional(),
  coverUrl: z.string().url().optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.DRAFT),
  seoTitle: z.string().max(60).optional(),
  seoDesc: z.string().max(160).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

// GET - Listar projetos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const status = searchParams.get('status') as ProjectStatus | null
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    const skip = (page - 1) * perPage

    // Construir filtros
    const where: import('@prisma/client').Prisma.ProjectWhereInput = {}

    if (status) {
      where.status = status
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Buscar projetos e contagem
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
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
          gallery: {
            include: {
              images: {
                take: 1,
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      projects,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    // TODO: Adicionar verificação de autenticação
    // const session = await getServerSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Gerar slug se não fornecido
    const slug = validatedData.slug || slugify(validatedData.title)

    // Verificar se slug já existe
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    })

    if (existingProject) {
      return NextResponse.json(
        { error: 'Já existe um projeto com este slug' },
        { status: 400 }
      )
    }

    // Criar projeto
    const project = await prisma.project.create({
      data: {
        title: validatedData.title,
        slug,
        summary: validatedData.summary,
        coverUrl: validatedData.coverUrl,
        status: validatedData.status,
        seoTitle: validatedData.seoTitle,
        seoDesc: validatedData.seoDesc,
        publishedAt: validatedData.status === ProjectStatus.PUBLISHED 
          ? new Date() 
          : null,
        // Criar galeria vazia automaticamente
        gallery: {
          create: {},
        },
        // Conectar categorias se fornecidas
        categories: validatedData.categoryIds
          ? {
              create: validatedData.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
        // Conectar tags se fornecidas
        tags: validatedData.tagIds
          ? {
              create: validatedData.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        gallery: true,
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

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar projeto:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    )
  }
}