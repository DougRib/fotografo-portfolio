'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Hero Slideshow - Galeria automática fullscreen
 * 
 * Este componente cria uma experiência visual impressionante na página inicial,
 * mostrando as melhores fotos do portfólio em um slideshow automático.
 * 
 * Características:
 * - Transições suaves entre imagens usando fade in/out
 * - Troca automática a cada 5 segundos
 * - Navegação manual com setas (opcional)
 * - Indicadores visuais de qual slide está ativo
 * - Overlay gradiente para garantir legibilidade do texto
 * - Totalmente responsivo
 * - Preload das imagens para transições sem flicker
 */

interface HeroImage {
  url: string
  title: string
  category?: string
}

interface HeroSlideshowProps {
  images: HeroImage[]
  autoPlayInterval?: number
  photographerCity?: string
}

export function HeroSlideshow({ 
  images, 
  autoPlayInterval = 5000,
  photographerCity = 'Sua Cidade'
}: HeroSlideshowProps) {
  // Estado para controlar qual imagem está sendo exibida atualmente
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Estado para controlar se o slideshow está pausado (quando usuário interage)
  const [isPaused, setIsPaused] = useState(false)

  /**
   * Função para avançar para a próxima imagem
   * Usa módulo (%) para voltar ao início quando chegar no fim
   */
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images.length])

  /**
   * Função para voltar para a imagem anterior
   * Adiciona images.length antes do módulo para lidar com índices negativos
   */
  const previousSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }, [images.length])

  /**
   * Função para ir diretamente para uma imagem específica
   * Usada pelos indicadores de navegação (dots)
   */
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])


  /**
   * Effect para o slideshow automático
   * 
   * Este useEffect configura um intervalo que avança automaticamente
   * para a próxima imagem a cada X segundos (definido por autoPlayInterval).
   * 
   * O cleanup function (return) é crucial para evitar memory leaks,
   * garantindo que o intervalo seja limpo quando o componente é desmontado
   * ou quando as dependências mudam.
   */
  useEffect(() => {
    // Não inicia o autoplay se estiver pausado ou se não houver múltiplas imagens
    if (isPaused || images.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    // Cleanup: limpar o intervalo quando o componente desmontar
      return () => clearInterval(interval)
  }, [nextSlide, isPaused, autoPlayInterval, images.length])

  // Se não houver imagens, não renderizar nada
  if (images.length === 0) {
    return null
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Container das imagens com animação de fade */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* 
              Next.js Image com prioridade para a primeira imagem
              Isso garante que a imagem inicial carregue o mais rápido possível
            */}
            <Image
              src={image.url}
              alt={image.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
              quality={90}
            />
          </div>
        ))}
      </div>

      {/* 
        Overlay gradiente escuro
        Garante que o texto seja sempre legível independente da cor da imagem
        O gradiente é mais forte na parte inferior onde está o texto
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

      {/* Conteúdo textual sobreposto */}
      <div className="container relative z-10 mx-auto px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* 
            Animação sutil do texto quando a imagem muda
            Usando key={currentIndex} forçamos o React a recriar o elemento,
            ativando a animação CSS cada vez que o slide muda
          */}
          <div key={currentIndex} className="">
            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl drop-shadow-2xl">
              Fotografia autêntica para histórias{' '}
              <span className="text-primary">inesquecíveis</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-gray-200 sm:text-xl mt-6 drop-shadow-lg">
              Capturo momentos genuínos e emocionantes que você vai guardar para sempre.
              Especialista em casamentos, eventos e retratos em {photographerCity}.
            </p>

            {/* Mostra a categoria da imagem atual se disponível */}
            {images[currentIndex].category && (
              <p className="text-sm uppercase tracking-wider text-primary/90 mt-4">
                {images[currentIndex].category}
              </p>
            )}
          </div>
          
          {/* Botões de call-to-action */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
                asChild
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl"
                >
                <Link href="/portfolio" className="inline-flex items-center">
                    Ver Portfólio
                    <ArrowRight
                    aria-hidden="true"
                    className="
                        ml-2 h-5 w-5
                        motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out
                        group-hover:translate-x-1
                        will-change-transform
                    "
                    />
                </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <Link href="#contato">
                Pedir Orçamento
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 
        Controles de navegação manual
        Aparecem apenas no hover para não poluir a interface
      */}
      {images.length > 1 && (
        <>
          {/* Botão anterior - esquerda */}
          <button
            onClick={() => {
              previousSlide()
              setIsPaused(true)
              // Resume o autoplay após 10 segundos de inatividade
              setTimeout(() => setIsPaused(false), 10000)
            }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 "
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Botão próximo - direita */}
          <button
            onClick={() => {
              nextSlide()
              setIsPaused(true)
              setTimeout(() => setIsPaused(false), 10000)
            }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 "
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* 
            Indicadores de navegação (dots)
            Mostram quantas imagens existem e qual está ativa
          */}
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  goToSlide(index)
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 10000)
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}