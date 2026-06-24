import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatBRL } from '@/lib/money'
import { finalPriceCents, hasDiscount } from '@/lib/pricing'
import { isSoldOut } from '@/lib/stock'

export function ProductCard({ product }: { product: Product }) {
  const final = finalPriceCents(product)
  const promo = hasDiscount(product)
  const sold = isSoldOut(product)
  const cover = product.photos[0]?.url
  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-neutral-100 rounded overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">sem foto</div>
        )}
        {promo && <span className="absolute top-2 left-2 bg-[#E89BB0] text-black text-xs px-2 py-1 rounded">Promoção</span>}
        {sold && <span className="absolute top-2 right-2 bg-neutral-800 text-white text-xs px-2 py-1 rounded">Esgotado</span>}
      </div>
      <p className="mt-2 text-sm">{product.name}</p>
      <p className="text-sm">
        {promo && <span className="line-through text-neutral-400 mr-2">{formatBRL(product.priceCents)}</span>}
        <span className="font-medium">{formatBRL(final)}</span>
      </p>
    </Link>
  )
}
