/**
 * Navegação do Dashboard
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderOpen,
  Image as ImageIcon,
  MessageSquare,
  Briefcase,
  Users,
  Tag,
  Tags,
} from 'lucide-react'

const navItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projetos',
    href: '/dashboard/projects',
    icon: FolderOpen,
  },
  {
    title: 'Galerias',
    href: '/dashboard/galleries',
    icon: ImageIcon,
  },
  {
    title: 'Eventos',
    href: '/dashboard/eventos',
    icon: FolderOpen,
  },
  {
    title: 'Leads',
    href: '/dashboard/leads',
    icon: Users,
  },
  {
    title: 'Depoimentos',
    href: '/dashboard/testimonials',
    icon: MessageSquare,
  },
  {
    title: 'Serviços',
    href: '/dashboard/services',
    icon: Briefcase,
  },
  {
    title: 'Categorias',
    href: '/dashboard/categories',
    icon: Tags,
  },
  {
    title: 'Tags',
    href: '/dashboard/tags',
    icon: Tag,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
