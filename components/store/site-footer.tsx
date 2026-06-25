import Link from 'next/link'
import { Instagram, MessageCircle } from './icons'
import { waUrl } from './waphone'
import type { Category, StoreConfig } from '@/lib/types'

export function SiteFooter({ categories, config }: { categories: Category[]; config: StoreConfig }) {
  const tops = categories.filter((c) => !c.parentId)
  const wa = waUrl(config.whatsapp)
  const ig = config.instagram ? `https://instagram.com/${config.instagram.replace('@', '')}` : null

  return (
    <footer className="bg-[#0B0B0D] text-[#B8AEA6]">
      <div className="max-w-[1280px] mx-auto px-4 py-14 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="font-serif text-2xl text-[#F6F1EB]">
            <span className="text-[#E8A1B4]">RR</span> Boutique
          </p>
          <p className="mt-3 text-sm">Moda feminina com elegância, confiança e propósito.</p>
          <div className="flex gap-3 mt-4">
            {ig && (
              <a href={ig} target="_blank" rel="noopener noreferrer" className="hover:text-[#E8A1B4]">
                <Instagram size={20} />
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-[#E8A1B4]">
                <MessageCircle size={20} />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="text-[#F6F1EB] font-medium mb-3 text-sm">Coleção</p>
          <ul className="space-y-2 text-sm">
            {tops.map((c) => (
              <li key={c.id}>
                <Link href={`/categoria/${c.slug}`} className="hover:text-[#E8A1B4]">{c.name}</Link>
              </li>
            ))}
            <li><Link href="/sobre" className="hover:text-[#E8A1B4]">Sobre nós</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[#F6F1EB] font-medium mb-3 text-sm">Atendimento</p>
          <ul className="space-y-2 text-sm">
            {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-[#E8A1B4]">WhatsApp</a></li>}
            <li><Link href="/sobre" className="hover:text-[#E8A1B4]">Trocas e devoluções</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[#F6F1EB] font-medium mb-3 text-sm">Pagamento</p>
          {config.pixKey && <p className="text-sm">Pix: {config.pixKey}</p>}
          <p className="text-sm mt-2">Combine pagamento e entrega pelo WhatsApp.</p>
        </div>
      </div>

      <div className="border-t border-[#2A2B2F]">
        <div className="max-w-[1280px] mx-auto px-4 py-5 text-xs text-[#6B6763] flex flex-col md:flex-row justify-between gap-2">
          <span>© RR Boutique. Todos os direitos reservados.</span>
          <span>Moda Feminina — Estilo • Elegância • Confiança</span>
        </div>
      </div>
    </footer>
  )
}
