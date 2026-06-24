import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatBRL, installmentText } from '@/lib/money'
import { finalPriceCents, hasDiscount } from '@/lib/pricing'
import { isSoldOut } from '@/lib/stock'

export function ProductCard({ product }: { product: Product }) {
  const final = finalPriceCents(product)
  const promo = hasDiscount(product)
  const sold = isSoldOut(product)
  const cover = product.photos[0]?.url
  const parcela = installmentText(final)

  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-[#F7F3EF] rounded-xl overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">sem foto</div>
        )}
        {promo && (
          <span className="absolute top-3 left-3 bg-[#E8A1B4] text-[#17181B] text-[11px] font-medium px-2.5 py-1 rounded-full">
            Promoção
          </span>
        )}
        {sold && (
          <span className="absolute top-3 right-3 bg-[#17181B] text-white text-[11px] px-2.5 py-1 rounded-full">
            Esgotado
          </span>
        )}
      </div>
      <h3 className="mt-3 text-sm text-[#17181B]">{product.name}</h3>
      <div className="mt-1">
        {promo && <span className="line-through text-neutral-400 text-xs mr-2">{formatBRL(product.priceCents)}</span>}
        <span className="text-[#17181B] font-medium">{formatBRL(final)}</span>
      </div>
      {parcela && <p className="text-xs text-[#6B6763] mt-0.5">{parcela}</p>}
    </Link>
  )
}
