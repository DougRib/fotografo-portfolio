import { PrismaClient, ProjectStatus, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (cuidado em produção!)
  await prisma.lead.deleteMany()
  await prisma.image.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.projectTag.deleteMany()
  await prisma.projectCategory.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.project.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.service.deleteMany()
  await prisma.user.deleteMany()

  // ============================================
  // USUÁRIO ADMIN
  // ============================================
  // Hashear senha antes de salvar (NUNCA armazene senhas em texto puro!)
  // bcrypt é o padrão da indústria para hash de senhas
  const hashedPassword = await hash('admin123', 12) // 12 rounds de hash
  
  const admin = await prisma.user.create({
    data: {
      name: '{NOME_FOTOGRAFO}',
      email: '{EMAIL}',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })
  console.log('✅ Usuário admin criado (senha: admin123)')

  // ============================================
  // CATEGORIAS
  // ============================================
  const categorias = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Casamento',
        slug: 'casamento',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Retrato',
        slug: 'retrato',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Arquitetura',
        slug: 'arquitetura',
      },
    }),
  ])
  console.log('✅ 3 categorias criadas')

  // ============================================
  // TAGS
  // ============================================
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Pre-wedding', slug: 'pre-wedding' } }),
    prisma.tag.create({ data: { name: 'Ensaio Externo', slug: 'ensaio-externo' } }),
    prisma.tag.create({ data: { name: 'Editorial', slug: 'editorial' } }),
    prisma.tag.create({ data: { name: 'P&B', slug: 'pb' } }),
    prisma.tag.create({ data: { name: 'Drone', slug: 'drone' } }),
    prisma.tag.create({ data: { name: 'Noturno', slug: 'noturno' } }),
  ])
  console.log('✅ 6 tags criadas')

  // ============================================
  // PROJETOS COM GALERIAS
  // ============================================
  
  // Projeto 1: Casamento na Praia
  const projeto1 = await prisma.project.create({
    data: {
      slug: 'casamento-praia-sophia-bruno',
      title: 'Casamento Sophia & Bruno',
      summary: 'Um casamento emocionante à beira-mar durante o pôr do sol. Capturamos cada momento especial deste dia inesquecível com toda a emoção e alegria que merecia.',
      coverUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop',
      status: ProjectStatus.PUBLISHED,
      publishedAt: new Date('2024-11-15'),
      seoTitle: 'Casamento Sophia & Bruno - Fotografia Profissional',
      seoDesc: 'Registros emocionantes do casamento de Sophia e Bruno na praia com fotografia profissional.',
      categories: {
        create: [{ categoryId: categorias[0].id }], // Casamento
      },
      tags: {
        create: [
          { tagId: tags[1].id }, // Ensaio Externo
          { tagId: tags[5].id }, // Noturno
        ],
      },
      gallery: {
        create: {
          images: {
            create: [
              {
                url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 1,
                alt: 'Noivos durante cerimônia na praia',
              },
              {
                url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 2,
                alt: 'Momento dos votos',
              },
              {
                url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 3,
                alt: 'Beijo dos noivos',
              },
              {
                url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 4,
                alt: 'Festa e celebração',
              },
              {
                url: 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 5,
                alt: 'Primeira dança',
              },
              {
                url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 6,
                alt: 'Decoração da festa',
              },
            ],
          },
        },
      },
    },
  })

  // Projeto 2: Ensaio Pre-Wedding
  const projeto2 = await prisma.project.create({
    data: {
      slug: 'pre-wedding-ana-carlos',
      title: 'Pre-Wedding Ana & Carlos',
      summary: 'Um ensaio romântico em meio à natureza, capturando a conexão genuína do casal em um dia de outono perfeito.',
      coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=800&fit=crop',
      status: ProjectStatus.PUBLISHED,
      publishedAt: new Date('2024-10-20'),
      seoTitle: 'Pre-Wedding Ana & Carlos - Ensaio Fotográfico',
      seoDesc: 'Ensaio pre-wedding em meio à natureza com fotografia profissional e emocional.',
      categories: {
        create: [{ categoryId: categorias[0].id }], // Casamento
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // Pre-wedding
          { tagId: tags[1].id }, // Ensaio Externo
        ],
      },
      gallery: {
        create: {
          images: {
            create: [
              {
                url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 1,
                alt: 'Casal em campo aberto',
              },
              {
                url: 'https://images.unsplash.com/photo-1582735689682-756e570d1f5a?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1582735689682-756e570d1f5a?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 2,
                alt: 'Abraço romântico',
              },
              {
                url: 'https://images.unsplash.com/photo-1594552072238-5fbe7e72dea4?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1594552072238-5fbe7e72dea4?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 3,
                alt: 'Momento íntimo',
              },
              {
                url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 4,
                alt: 'Risadas ao pôr do sol',
              },
              {
                url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 5,
                alt: 'Caminhada de mãos dadas',
              },
              {
                url: 'https://images.unsplash.com/photo-1626771757502-2797695c5867?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1626771757502-2797695c5867?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 6,
                alt: 'Beijo apaixonado',
              },
            ],
          },
        },
      },
    },
  })

  // Projeto 3: Editorial de Moda
  const projeto3 = await prisma.project.create({
    data: {
      slug: 'editorial-moda-urbano',
      title: 'Editorial Moda Urbana',
      summary: 'Produção editorial moderna com looks contemporâneos em cenários urbanos. Um trabalho que mescla moda, arte e arquitetura.',
      coverUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
      status: ProjectStatus.PUBLISHED,
      publishedAt: new Date('2024-09-10'),
      seoTitle: 'Editorial de Moda Urbana - Fotografia Fashion',
      seoDesc: 'Fotografia editorial de moda em ambientes urbanos com estilo contemporâneo.',
      categories: {
        create: [{ categoryId: categorias[1].id }], // Retrato
      },
      tags: {
        create: [
          { tagId: tags[2].id }, // Editorial
          { tagId: tags[3].id }, // P&B
        ],
      },
      gallery: {
        create: {
          images: {
            create: [
              {
                url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 1,
                alt: 'Modelo em cenário urbano',
              },
              {
                url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 2,
                alt: 'Look urbano contemporâneo',
              },
              {
                url: 'https://images.unsplash.com/photo-1492447273231-0f8fecec1e3a?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1492447273231-0f8fecec1e3a?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 3,
                alt: 'Composição minimalista',
              },
              {
                url: 'https://images.unsplash.com/photo-1558769132-cb1aea1f1d8c?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea1f1d8c?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 4,
                alt: 'Fotografia em preto e branco',
              },
              {
                url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 5,
                alt: 'Pose fashion',
              },
              {
                url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 6,
                alt: 'Detalhe do look',
              },
            ],
          },
        },
      },
    },
  })

  // Projeto 4: Arquitetura Moderna
  const projeto4 = await prisma.project.create({
    data: {
      slug: 'arquitetura-residencial-moderna',
      title: 'Residência Moderna',
      summary: 'Fotografia arquitetônica de uma residência contemporânea. Ênfase nas linhas, volumes e integração com o ambiente natural.',
      coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
      status: ProjectStatus.PUBLISHED,
      publishedAt: new Date('2024-08-05'),
      seoTitle: 'Fotografia Arquitetura Residencial Moderna',
      seoDesc: 'Registro profissional de arquitetura contemporânea com foco em design e iluminação.',
      categories: {
        create: [{ categoryId: categorias[2].id }], // Arquitetura
      },
      tags: {
        create: [
          { tagId: tags[4].id }, // Drone
          { tagId: tags[5].id }, // Noturno
        ],
      },
      gallery: {
        create: {
          images: {
            create: [
              {
                url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 1,
                alt: 'Fachada principal da residência',
              },
              {
                url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 2,
                alt: 'Área social integrada',
              },
              {
                url: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 3,
                alt: 'Cozinha moderna',
              },
              {
                url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 4,
                alt: 'Área externa e piscina',
              },
              {
                url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 5,
                alt: 'Dormitório principal',
              },
              {
                url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 6,
                alt: 'Vista noturna externa',
              },
              {
                url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 7,
                alt: 'Detalhe arquitetônico',
              },
              {
                url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1200&h=800&fit=crop',
                thumbUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&h=300&fit=crop',
                width: 1200,
                height: 800,
                order: 8,
                alt: 'Vista aérea com drone',
              },
            ],
          },
        },
      },
    },
  })

  console.log('✅ 4 projetos com galerias criados')

  // ============================================
  // DEPOIMENTOS
  // ============================================
  await prisma.testimonial.createMany({
    data: [
      {
        author: 'Sophia Martins',
        role: 'Noiva',
        text: 'Escolher o {NOME_FOTOGRAFO} foi a melhor decisão! As fotos ficaram perfeitas e capturam exatamente a emoção e alegria do nosso dia especial. Profissionalismo impecável e resultado além das expectativas!',
        visible: true,
      },
      {
        author: 'Carlos Eduardo Silva',
        role: 'Empresário',
        text: 'Precisava de fotos profissionais do meu empreendimento e o resultado superou minhas expectativas. Atenção aos detalhes, pontualidade e qualidade excepcional. Recomendo fortemente!',
        visible: true,
      },
      {
        author: 'Mariana Costa',
        role: 'Designer de Interiores',
        text: 'Trabalho com fotografia de ambientes há anos e posso dizer que o {NOME_FOTOGRAFO} entende de composição, iluminação e sabe valorizar cada espaço. Parceria de sucesso!',
        visible: true,
      },
    ],
  })
  console.log('✅ 3 depoimentos criados')

  // ============================================
  // SERVIÇOS/PACOTES
  // ============================================
  await prisma.service.createMany({
    data: [
      {
        name: 'Pacote Essencial',
        description: 'Ideal para eventos menores e ensaios rápidos. Inclui cobertura de até 4 horas com edição profissional das melhores fotos.',
        priceFrom: 150000, // R$ 1.500,00
        features: [
          '4 horas de cobertura',
          '150+ fotos editadas',
          'Galeria online privada',
          'Entrega em até 15 dias',
        ],
        active: true,
        order: 1,
      },
      {
        name: 'Pacote Completo',
        description: 'Perfeito para casamentos e eventos de dia inteiro. Cobertura extensiva com fotógrafo e assistente.',
        priceFrom: 350000, // R$ 3.500,00
        features: [
          '10 horas de cobertura',
          '500+ fotos editadas',
          'Álbum digital premium',
          'Fotos em alta resolução',
          'Galeria online privada',
          'Preview em 48h',
          'Entrega em até 30 dias',
        ],
        active: true,
        order: 2,
      },
      {
        name: 'Pacote Premium',
        description: 'O pacote mais completo, incluindo pré-wedding, cerimônia e festa. Para quem busca excelência absoluta.',
        priceFrom: 650000, // R$ 6.500,00
        features: [
          'Ensaio pré-wedding (4h)',
          'Cobertura completa do casamento (12h)',
          '800+ fotos editadas',
          'Álbum físico premium 30x30cm',
          'Álbum digital premium',
          'Fotos em alta resolução',
          'Pendrive personalizado',
          'Vídeo teaser',
          'Galeria online privada',
          'Preview em 24h',
          'Entrega em até 45 dias',
        ],
        active: true,
        order: 3,
      },
    ],
  })
  console.log('✅ 3 pacotes de serviços criados')

  // ============================================
  // LEADS DE EXEMPLO
  // ============================================
  await prisma.lead.createMany({
    data: [
      {
        name: 'Juliana Oliveira',
        email: 'juliana@example.com',
        phone: '(51) 99999-1111',
        message: 'Olá! Gostaria de um orçamento para cobertura de casamento em dezembro/2025.',
        source: 'formulario-home',
        serviceType: 'Casamento',
        eventDate: new Date('2025-12-15'),
        eventLocation: '{CIDADE}',
        estimatedBudget: 'R$ 4.000 - R$ 6.000',
      },
      {
        name: 'Roberto Almeida',
        email: 'roberto@example.com',
        phone: '(51) 99999-2222',
        message: 'Preciso de fotos profissionais para meu escritório de arquitetura. Interesse em agendar visita.',
        source: 'formulario-contato',
        serviceType: 'Arquitetura',
      },
    ],
  })
  console.log('✅ 2 leads de exemplo criados')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log(`\n📊 Resumo:`)
  console.log(`   - 1 usuário admin`)
  console.log(`   - 3 categorias`)
  console.log(`   - 6 tags`)
  console.log(`   - 4 projetos publicados`)
  console.log(`   - 27 imagens em galerias`)
  console.log(`   - 3 depoimentos`)
  console.log(`   - 3 pacotes de serviços`)
  console.log(`   - 2 leads de exemplo`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro durante seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })