import { Sparkles, MessageCircle, Truck, RefreshCw } from './icons'

const items = [
  { Icon: Sparkles, text: 'Peças com curadoria' },
  { Icon: MessageCircle, text: 'Atendimento pelo WhatsApp' },
  { Icon: Truck, text: 'Envio para todo o Brasil' },
  { Icon: RefreshCw, text: 'Troca facilitada' },
]

export function AnnouncementBar() {
  return (
    <div className="bg-[#E8A1B4] text-[#17181B]">
      <div className="max-w-[1280px] mx-auto px-4 py-2 flex items-center justify-center gap-6 text-xs font-medium">
        {items.map(({ Icon, text }, i) => (
          <span
            key={i}
            className={`items-center gap-1.5 whitespace-nowrap ${i > 1 ? 'hidden md:flex' : 'flex'}`}
          >
            <Icon size={14} /> {text}
          </span>
        ))}
      </div>
    </div>
  )
}
