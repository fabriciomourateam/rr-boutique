import Link from 'next/link'
import type { StoreConfig } from '@/lib/types'

export function AboutBanner({ config }: { config: StoreConfig }) {
  return (
    <section className="relative bg-[#0B0B0D] text-[#F6F1EB] overflow-hidden">
      <div className="relative max-w-[1280px] mx-auto px-4 pt-12 md:pt-16 pb-6 md:pb-8">
        <span className="pointer-events-none select-none absolute right-2 top-1/2 -translate-y-1/2 font-serif text-[12rem] md:text-[18rem] leading-none text-white/[0.04]">
          RR
        </span>
        <div className="relative max-w-xl">
          <p className="uppercase tracking-[0.3em] text-xs text-[#C8A97E] mb-3">Sobre a RR</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Moda feminina que traduz quem você é.
          </h2>
          <p className="mt-4 text-[#B8AEA6] max-w-md whitespace-pre-line">
            {config.aboutText ||
              'Mais que roupas, entregamos autoestima, presença e identidade em cada escolha.'}
          </p>
          <Link
            href="/sobre"
            className="inline-block mt-6 px-6 py-3 rounded-full bg-[#E8A1B4] text-[#17181B] font-medium hover:bg-[#D98DA3] transition-colors"
          >
            Conhecer mais
          </Link>
        </div>
      </div>
    </section>
  )
}
