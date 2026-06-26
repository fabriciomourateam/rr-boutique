import Link from 'next/link'
import { MessageCircle } from './icons'
import { waUrl } from './waphone'
import type { StoreConfig } from '@/lib/types'

export function Hero({ config }: { config: StoreConfig }) {
  const wa = waUrl(config.whatsapp) ?? '#destaques'
  const bg = config.bannerUrl

  return (
    <section className="relative bg-[#0B0B0D] text-[#F6F1EB] overflow-hidden">
      {bg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover object-[center_right]" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(11,11,13,0.95) 0%, rgba(11,11,13,0.82) 45%, rgba(11,11,13,0.35) 100%)',
        }}
      />
      <div className="relative max-w-[1280px] mx-auto px-4 py-12 md:py-16">
        <div className="max-w-xl">
          <p className="uppercase tracking-[0.3em] text-xs text-[#C8A97E] mb-3">Nova coleção</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05]">
            Elegância que veste<br />
            sua <span className="text-[#E8A1B4] italic">melhor versão</span>.
          </h1>
          <p className="mt-5 text-[#B8AEA6] max-w-md">
            Peças selecionadas para mulheres que valorizam estilo, confiança e sofisticação em cada detalhe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#destaques"
              className="px-6 py-3 rounded-full bg-[#E8A1B4] text-[#17181B] font-medium hover:bg-[#D98DA3] transition-colors"
            >
              Ver coleção
            </Link>
            <a
              href={wa} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#F6F1EB]/40 hover:border-[#E8A1B4] hover:text-[#E8A1B4] transition-colors"
            >
              <MessageCircle size={18} /> Comprar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
