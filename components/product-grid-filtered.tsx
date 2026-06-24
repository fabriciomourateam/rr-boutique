'use client'
import { useState, useMemo } from 'react'
import type { Product } from '@/lib/types'
import { ProductCard } from '@/components/product-card'
import { finalPriceCents } from '@/lib/pricing'

export function ProductGridFiltered({ products }: { products: Product[] }) {
  const [size, setSize] = useState('')
  const [sort, setSort] = useState('recent')

  const sizes = useMemo(() => {
    const s = new Set<string>()
    products.forEach((p) => p.variants.forEach((v) => v.size && s.add(v.size)))
    return Array.from(s)
  }, [products])

  const list = useMemo(() => {
    let l = products
    if (size) l = l.filter((p) => p.variants.some((v) => v.size === size))
    if (sort === 'price-asc') l = [...l].sort((a, b) => finalPriceCents(a) - finalPriceCents(b))
    if (sort === 'price-desc') l = [...l].sort((a, b) => finalPriceCents(b) - finalPriceCents(a))
    return l
  }, [products, size, sort])

  return (
    <div>
      <div className="flex gap-3 mb-6 flex-wrap">
        {sizes.length > 0 && (
          <select value={size} onChange={(e) => setSize(e.target.value)} className="p-2 border rounded text-sm">
            <option value="">Todos os tamanhos</option>
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="p-2 border rounded text-sm">
          <option value="recent">Mais recentes</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>
      {list.length === 0 ? (
        <p className="text-neutral-500">Nenhuma peça encontrada.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
