import Link from 'next/link'
import { MessageCircle } from './icons'
import { AnnouncementBar } from './announcement-bar'
import { waUrl } from './waphone'
import type { Category, StoreConfig } from '@/lib/types'

export function SiteHeader({ categories, config }: { categories: Category[]; config: StoreConfig }) {
  const tops = categories.filter((c) => !c.parentId)
  const wa = waUrl(config.whatsapp)
  const nav = [
    { label: 'Início', href: '/' },
    ...tops.map((c) => ({ label: c.name, href: `/categoria/${c.slug}` })),
    { label: 'Sobre', href: '/sobre' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0D] text-[#F6F1EB] border-b border-[#2A2B2F]">
      <AnnouncementBar />
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-wide shrink-0">
          <span className="text-[#E8A1B4]">RR</span> Boutique
        </Link>
        {wa ? (
          <a
            href={wa} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-[#E8A1B4] text-[#E8A1B4] px-4 py-1.5 text-sm hover:bg-[#E8A1B4] hover:text-[#17181B] transition-colors shrink-0"
          >
            <MessageCircle size={16} /> <span className="hidden sm:inline">WhatsApp</span>
          </a>
        ) : (
          <span className="w-8" />
        )}
      </div>

      {/* faixa de categorias: quebra em linhas, cada nome inteiro (nada cortado) */}
      <nav className="border-t border-[#2A2B2F]">
        <div className="max-w-[1280px] mx-auto px-4 py-2.5">
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href} href={n.href}
                className="text-[#B8AEA6] hover:text-[#E8A1B4] transition-colors whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
