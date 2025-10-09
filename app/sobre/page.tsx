/**
 * Página Sobre
 * 
 * Bio, equipamentos, prêmios e informações sobre o fotógrafo
 */

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Award, MapPin, Mail, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça mais sobre meu trabalho, equipamentos e trajetória na fotografia.',
}

export default function AboutPage() {
  const photographerName = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME || 'Fotógrafo'
  const photographerCity = process.env.NEXT_PUBLIC_PHOTOGRAPHER_CITY || 'Sua Cidade'
  const photographerEmail = process.env.NEXT_PUBLIC_PHOTOGRAPHER_EMAIL
  const photographerPhone = process.env.NEXT_PUBLIC_PHOTOGRAPHER_PHONE

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="container relative z-10 mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Sobre Mim
            </h1>
            <p className="text-xl text-purple-100">
              Paixão por capturar momentos autênticos e criar memórias inesquecíveis
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Foto do fotógrafo */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=1000&fit=crop"
              alt={photographerName}
              fill
              className="object-cover"
            />
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Olá, sou {photographerName}</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Há mais de 10 anos dedico minha vida à fotografia profissional, 
                capturando momentos únicos e transformando-os em memórias eternas. 
                Minha jornada começou com uma simples câmera emprestada e uma paixão 
                inabalável por contar histórias através de imagens.
              </p>
              
              <p>
                Especializei-me em fotografia de casamentos, eventos e retratos, 
                sempre buscando capturar a essência genuína de cada momento. Acredito 
                que as melhores fotos são aquelas que revelam emoções verdadeiras e 
                conexões autênticas entre as pessoas.
              </p>
              
              <p>
                Baseado em {photographerCity}, atendo clientes em todo o Brasil, 
                sempre com o compromisso de entregar um trabalho de excelência que 
                supere expectativas. Cada projeto é único e merece toda a minha 
                dedicação e atenção aos detalhes.
              </p>
            </div>

            {/* Informações de contato */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{photographerCity}</span>
              </div>
              {photographerEmail && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${photographerEmail}`} className="hover:text-primary">
                    {photographerEmail}
                  </a>
                </div>
              )}
              {photographerPhone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5" />
                  <a href={`tel:${photographerPhone}`} className="hover:text-primary">
                    {photographerPhone}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-6">
              <Button asChild size="lg">
                <Link href="/#contato">Entre em Contato</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Equipamentos */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Equipamentos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para garantir a melhor qualidade nas suas fotos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Camera className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Câmeras</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Canon EOS R5 (Full-frame)</li>
                  <li>• Canon EOS R6 (Backup)</li>
                  <li>• Sony A7 IV</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Camera className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Lentes</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• RF 24-70mm f/2.8L</li>
                  <li>• RF 70-200mm f/2.8L</li>
                  <li>• RF 85mm f/1.2L</li>
                  <li>• RF 35mm f/1.8</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Camera className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Acessórios</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Godox AD600 Pro (Flash)</li>
                  <li>• DJI Mavic 3 (Drone)</li>
                  <li>• Tripés Manfrotto</li>
                  <li>• Sistema de backup</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prêmios e Reconhecimentos */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Prêmios & Reconhecimentos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trabalho reconhecido nacionalmente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Top 10 Brasil</h3>
                <p className="text-sm text-muted-foreground">
                  Fotógrafo de Casamentos 2023
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Prêmio Regional</h3>
                <p className="text-sm text-muted-foreground">
                  Melhor Portfólio 2022
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">5 Estrelas</h3>
                <p className="text-sm text-muted-foreground">
                  100+ Avaliações Google
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Featured</h3>
                <p className="text-sm text-muted-foreground">
                  Revista Noivas Brasil
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Final */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Vamos criar algo incrível juntos?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Estou pronto para capturar seus momentos mais especiais com criatividade, 
              profissionalismo e dedicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/#contato">Solicitar Orçamento</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/portfolio">Ver Portfólio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}