/**
 * Cliente Prisma singleton para evitar múltiplas instâncias durante hot reload
 * 
 * Em desenvolvimento, o Next.js faz hot reload do código a cada mudança,
 * o que poderia criar múltiplas conexões com o banco de dados.
 * Este pattern garante que usamos sempre a mesma instância.
 */

import { PrismaClient } from '@prisma/client'

// Configuração de log para diferentes ambientes
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

// Definir tipo do cliente
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Criar ou reutilizar instância existente
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

// Salvar instância no global em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// Export named para facilitar imports
export { prisma }