import { Instagram } from './icons'
import type { StoreConfig } from '@/lib/types'

export function InstagramStrip({ images, config }: { images: string[]; config: StoreConfig }) {
  if (images.length === 0) return null
  const handleRaw = config.instagram || 'rrboutiques'
  const handle = handleRaw.startsWith('@') ? handleRaw : `@${handleRaw}`
  const url = `https://instagram.com/${handleRaw.replace('@', '')}`

  return (
    <section className="bg-[#0B0B0D] text-[#F6F1EB]">
      <div className="max-w-[1280px] mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-3xl">No Instagram</h2>
            <p className="text-[#B8AEA6] text-sm">{handle}</p>
          </div>
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-[#E8A1B4] text-[#17181B] text-sm font-medium hover:bg-[#D98DA3] transition-colors"
          >
            <Instagram size={16} /> Ver no Instagram
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {images.slice(0, 6).map((src, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square overflow-hidden rounded-lg block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
