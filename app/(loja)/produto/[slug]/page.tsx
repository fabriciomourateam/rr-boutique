import { notFound } from 'next/navigation'
import { getProductBySlug, getStoreConfig } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { finalPriceCents, hasDiscount } from '@/lib/pricing'
import { isLowStock, isSoldOut } from '@/lib/stock'
import { BuyBox } from '@/components/buy-box'

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const config = await getStoreConfig()
  const final = finalPriceCents(product)
  const promo = hasDiscount(product)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        {product.photos.length === 0 && (
          <div className="aspect-[3/4] bg-neutral-100 rounded flex items-center justify-center text-neutral-400">sem foto</div>
        )}
        {product.photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={p.url} alt={product.name} className="w-full rounded object-cover" />
        ))}
      </div>
      <div>
        <h1 className="font-serif text-3xl">{product.name}</h1>
        <p className="mt-2 text-2xl">
          {promo && <span className="line-through text-neutral-400 mr-2 text-lg">{formatBRL(product.priceCents)}</span>}
          {formatBRL(final)}
        </p>
        {isSoldOut(product) && <p className="text-red-600 mt-1">Esgotado</p>}
        {isLowStock(product) && !isSoldOut(product) && <p className="text-amber-600 mt-1 text-sm">Últimas peças!</p>}
        <p className="mt-4 whitespace-pre-line text-neutral-700">{product.description}</p>
        <div className="mt-6">
          {!isSoldOut(product) && <BuyBox product={product} whatsapp={config.whatsapp} />}
        </div>
      </div>
    </div>
  )
}
