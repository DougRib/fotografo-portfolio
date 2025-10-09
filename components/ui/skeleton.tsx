/**
 * Componente Skeleton do shadcn/ui
 * 
 * Placeholders animados que aparecem enquanto o conteúdo está carregando.
 * Isso melhora a percepção de performance e dá feedback visual ao usuário.
 * 
 * Uso típico:
 * - Enquanto carrega lista de projetos, mostra skeletons das linhas
 * - Enquanto carrega imagem, mostra skeleton do card
 */

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }