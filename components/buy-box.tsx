'use client'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import { finalPriceCents } from '@/lib/pricing'
import { whatsappLink } from '@/lib/whatsapp'

export function BuyBox({ product, whatsapp }: { product: Product; whatsapp: string }) {
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)

  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[]
  const colors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[]
  const needsSize = product.hasGrid && sizes.length > 0
  const needsColor = product.hasGrid && colors.length > 0
  const ready = (!needsSize || size) && (!needsColor || color)

  const phone = whatsapp.startsWith('55') ? whatsapp : `55${whatsapp}`
  const link = whatsappLink(phone, { name: product.name, size, color, priceCents: finalPriceCents(product) })

  return (
    <div className="space-y-4">
      {needsSize && (
        <div>
          <p className="text-sm text-neutral-600 mb-1">Tamanho</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)}
                className={`px-3 py-1 border rounded ${size === s ? 'bg-[#E89BB0] text-black' : ''}`}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {needsColor && (
        <div>
          <p className="text-sm text-neutral-600 mb-1">Cor</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`px-3 py-1 border rounded ${color === c ? 'bg-[#E89BB0] text-black' : ''}`}>{c}</button>
            ))}
          </div>
        </div>
      )}
      {whatsapp ? (
        <a href={ready ? link : undefined}
          target="_blank" rel="noopener noreferrer"
          className={`block text-center px-6 py-3 rounded font-medium ${ready ? 'bg-[#E89BB0] text-black' : 'bg-neutral-200 text-neutral-400 pointer-events-none'}`}>
          {ready ? 'Comprar pelo WhatsApp' : 'Selecione tamanho/cor'}
        </a>
      ) : (
        <p className="text-sm text-neutral-500">WhatsApp não configurado.</p>
      )}
    </div>
  )
}
