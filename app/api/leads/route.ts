import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

// Inicializar o cliente Resend com a API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Schema de validação Zod para o formulário de lead
const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(1000),
  serviceType: z.string().optional(),
  eventDate: z.string().optional(), // ISO date string
  eventLocation: z.string().optional(),
  estimatedBudget: z.string().optional(),
  referenceFileUrl: z.string().url().optional(),
  projectId: z.string().optional(),
  source: z.string().default('formulario-contato'),
})

// Map simples para rate limiting (em produção, use Redis ou similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Função auxiliar para verificar rate limit
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const limit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10')
  const windowMs = 60 * 60 * 1000 // 1 hora
  
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetAt) {
    // Criar novo registro ou resetar expirado
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  
  // Incrementar contador
  record.count++
  return { allowed: true, remaining: limit - record.count }
}

// Limpar rate limits expirados a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar rate limit baseado no IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const { allowed, remaining } = checkRateLimit(ip)
    
    if (!allowed) {
      return NextResponse.json(
        { 
          error: 'Muitas tentativas. Por favor, aguarde antes de enviar novamente.',
          code: 'RATE_LIMIT_EXCEEDED' 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': '3600', // 1 hora
          }
        }
      )
    }

    // 2. Parsear e validar o corpo da requisição
    const body = await request.json()
    const validatedData = leadSchema.parse(body)

    // 3. Salvar o lead no banco de dados
    const lead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        serviceType: validatedData.serviceType,
        eventDate: validatedData.eventDate ? new Date(validatedData.eventDate) : null,
        eventLocation: validatedData.eventLocation,
        estimatedBudget: validatedData.estimatedBudget,
        referenceFileUrl: validatedData.referenceFileUrl,
        projectId: validatedData.projectId,
        source: validatedData.source,
      },
    })

    // 4. Enviar e-mail de notificação via Resend
    const emailTo = process.env.RESEND_TO_EMAIL || process.env.RESEND_FROM_EMAIL
    const photographerName = process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME || 'Fotógrafo'

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: emailTo!,
        subject: `🎯 Novo Lead: ${validatedData.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
                .value { margin-top: 5px; font-size: 16px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">Novo Lead Recebido!</h1>
                  <p style="margin: 10px 0 0; opacity: 0.9;">Um potencial cliente entrou em contato</p>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Nome</div>
                    <div class="value">${validatedData.name}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">E-mail</div>
                    <div class="value"><a href="mailto:${validatedData.email}">${validatedData.email}</a></div>
                  </div>
                  
                  ${validatedData.phone ? `
                    <div class="field">
                      <div class="label">Telefone</div>
                      <div class="value">${validatedData.phone}</div>
                    </div>
                  ` : ''}
                  
                  ${validatedData.serviceType ? `
                    <div class="field">
                      <div class="label">Tipo de Serviço</div>
                      <div class="value">${validatedData.serviceType}</div>
                    </div>
                  ` : ''}
                  
                  ${validatedData.eventDate ? `
                    <div class="field">
                      <div class="label">Data do Evento</div>
                      <div class="value">${new Date(validatedData.eventDate).toLocaleDateString('pt-BR')}</div>
                    </div>
                  ` : ''}
                  
                  ${validatedData.eventLocation ? `
                    <div class="field">
                      <div class="label">Local do Evento</div>
                      <div class="value">${validatedData.eventLocation}</div>
                    </div>
                  ` : ''}
                  
                  ${validatedData.estimatedBudget ? `
                    <div class="field">
                      <div class="label">Orçamento Estimado</div>
                      <div class="value">${validatedData.estimatedBudget}</div>
                    </div>
                  ` : ''}
                  
                  <div class="field">
                    <div class="label">Mensagem</div>
                    <div class="value" style="white-space: pre-wrap;">${validatedData.message}</div>
                  </div>
                  
                  ${validatedData.referenceFileUrl ? `
                    <div class="field">
                      <div class="label">Arquivo de Referência</div>
                      <div class="value"><a href="${validatedData.referenceFileUrl}" target="_blank">Ver arquivo</a></div>
                    </div>
                  ` : ''}
                  
                  <div class="field">
                    <div class="label">Origem</div>
                    <div class="value">${validatedData.source}</div>
                  </div>
                </div>
                <div class="footer">
                  <p>Lead recebido em ${new Date().toLocaleString('pt-BR')}</p>
                  <p>ID do Lead: ${lead.id}</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      // 5. Enviar e-mail de confirmação para o cliente
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: validatedData.email,
        subject: `Recebemos seu contato, ${validatedData.name}!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 28px;">Obrigado pelo contato!</h1>
                </div>
                <div class="content">
                  <p>Olá, ${validatedData.name}!</p>
                  <p>Recebemos sua mensagem e ficamos muito felizes com seu interesse. Entraremos em contato em breve para conversarmos melhor sobre seu projeto.</p>
                  <p>Enquanto isso, sinta-se à vontade para explorar nosso portfólio e conhecer mais sobre nosso trabalho.</p>
                  <p style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portfolio" class="button">Ver Portfólio</a>
                  </p>
                </div>
                <div class="footer">
                  <p><strong>${photographerName}</strong></p>
                  <p>${process.env.NEXT_PUBLIC_PHOTOGRAPHER_EMAIL}</p>
                  <p>${process.env.NEXT_PUBLIC_PHOTOGRAPHER_PHONE}</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (emailError) {
      // Logar erro de e-mail mas não falhar a requisição
      // O lead já foi salvo, o que é o mais importante
      console.error('Erro ao enviar e-mail:', emailError)
    }

    // 6. Retornar resposta de sucesso
    return NextResponse.json(
      { 
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        leadId: lead.id 
      },
      { 
        status: 201,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    )

  } catch (error) {
    // Tratamento de erros
    console.error('Erro ao processar lead:', error)

    // Erro de validação Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    // Erro genérico
    return NextResponse.json(
      { 
        error: 'Erro ao processar sua solicitação. Por favor, tente novamente.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}