/**
 * Landing Page (Home)
 * 
 * Componentes:
 * - Hero com CTAs
 * - Serviços
 * - Portfólio destacado
 * - Depoimentos
 * - Formulário de contato
 */

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Award, Heart, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import { HeroSlideshow } from '@/components/hero-slideshow'

// Revalidar a cada 1 hora
export const revalidate = 3600

async function getHomeData() {
  // Buscar dados necessários para a home
  const [featuredProjects, services, testimonials, heroImages] = await Promise.all([
    // 6 projetos publicados mais recentes
    prisma.project.findMany({
      where: { status: ProjectStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverUrl: true,
        categories: {
          select: {
            category: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    }),
    // Serviços ativos
    prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
    // Depoimentos visíveis
    prisma.testimonial.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    // Buscar 5 projetos com covers para o hero slideshow
    prisma.project.findMany({
      where: { 
        status: ProjectStatus.PUBLISHED,
        coverUrl: { not: null }
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        title: true,
        coverUrl: true,
        categories: {
          select: {
            category: {
              select: { name: true },
            },
          },
          take: 1,
        },
      },
    }),
  ])
  // Transformar os projetos no formato que o HeroSlideshow espera
  const heroImagesFormatted = heroImages.map(project => ({
    url: project.coverUrl!,
    title: project.title,
    category: project.categories[0]?.category.name,
  }))

  return { featuredProjects, services, testimonials, heroImages: heroImagesFormatted }
}

export default async function HomePage() {
  const { featuredProjects, services, testimonials, heroImages } = await getHomeData()
  
  //const photographerName = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME || 'Fotógrafo'
  const photographerCity = process.env.NEXT_PUBLIC_PHOTOGRAPHER_CITY || 'Sua Cidade'

  return (
    <main className="flex min-h-screen flex-col">
      {/* HERO SECTION */}
      <HeroSlideshow 
        images={heroImages}
        photographerCity={photographerCity}
        autoPlayInterval={5000}
      />

      {/* SERVIÇOS SECTION */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Serviços</h2>
            <p className="text-lg text-muted-foreground">
              Pacotes personalizados para cada tipo de projeto
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="hover:shadow-lg transition-shadow bg-[linear-gradient(180deg,#dedede,#ffffff)] text-muted-foreground dark:text-gray-800 border-primary"
              >
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  {service.priceFrom && (
                    <CardDescription className="text-2xl font-bold text-primary">
                      A partir de R$ {(service.priceFrom / 100).toLocaleString('pt-BR')}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFÓLIO DESTACADO */}
      <section className="bg-[linear-gradient(90deg,#858a86,#a6aab9,#ededed)] dark:bg-[linear-gradient(90deg,#4f6166,#c8bbb4)] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Portfólio</h2>
            <p className="text-lg text-secondary-foreground">
              Alguns dos trabalhos mais recentes
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug}`}
                className="group relative overflow-hidden shadow dark:hover:shadow-primary/100 glass rounded-lg aspect-[4/3]"
              >
                {project.coverUrl && (
                  <Image
                    src={project.coverUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110 "
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  {project.summary && (
                    <p className="text-sm text-white/90 line-clamp-2">{project.summary}</p>
                  )}
                  {project.categories[0] && (
                    <span className="inline-block mt-2 text-xs bg-white/20 px-2 py-1 rounded">
                      {project.categories[0].category.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className='group'>
              <Link href="/portfolio">
                Ver Portfólio Completo 
                <ArrowRight 
                  aria-hidden="true"
                  className="ml-2 h-5 w-5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out
                        group-hover:translate-x-1
                        will-change-transform" 
                />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Depoimentos</h2>
            <p className="text-lg text-muted-foreground">
              O que nossos clientes dizem
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-yellow-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatarUrl && (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.avatarUrl}
                          alt={testimonial.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      {testimonial.role && (
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="bg-[linear-gradient(90deg,#858a86,#a6aab9,#ededed)] dark:bg-[linear-gradient(90deg,#4f6166,#c8bbb4)] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Equipamento Premium</h3>
                <p className="text-sm text-secondary-foreground">
                  Tecnologia de ponta para imagens impecáveis
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Experiência</h3>
                <p className="text-sm text-secondary-foreground">
                  Anos de experiência em eventos e retratos
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Dedicação Total</h3>
                <p className="text-sm text-secondary-foreground">
                  Atendimento personalizado do início ao fim
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Entrega Rápida</h3>
                <p className="text-sm text-secondary-foreground">
                  Suas fotos prontas em tempo recorde
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE CONTATO */}
      <section id="contato" className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Entre em Contato</h2>
              <p className="text-lg text-secondary-foreground">
                Vamos conversar sobre seu projeto? Preencha o formulário e entrarei em contato em breve.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  )
}