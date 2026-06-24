import { Sparkles, MessageCircle, Truck, RefreshCw } from './icons'

const items = [
  { Icon: Sparkles, title: 'Curadoria exclusiva', desc: 'Peças escolhidas a dedo' },
  { Icon: MessageCircle, title: 'Atendimento personalizado', desc: 'Fale conosco pelo WhatsApp' },
  { Icon: Truck, title: 'Envio para todo o Brasil', desc: 'Com rapidez e segurança' },
  { Icon: RefreshCw, title: 'Troca facilitada', desc: 'Sem burocracia' },
]

export function BenefitsBar() {
  return (
    <section className="bg-[#0B0B0D] text-[#F6F1EB] border-b border-[#2A2B2F]">
      <div className="max-w-[1280px] mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ Icon, title, desc }, i) => (
          <div key={i} className="flex items-start gap-3">
            <Icon className="text-[#E8A1B4] shrink-0 mt-0.5" size={22} />
            <div>
              <p className="text-sm font-medium leading-tight">{title}</p>
              <p className="text-xs text-[#B8AEA6] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
