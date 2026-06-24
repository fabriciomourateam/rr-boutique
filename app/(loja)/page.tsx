import Link from 'next/link'
import { getFeaturedProducts, getVisibleProducts, getCategories } from '@/lib/data'
import { ProductCard } from '@/components/product-card'

export default async function Home() {
  const [featured, all, categories] = await Promise.all([
    getFeaturedProducts(), getVisibleProducts(), getCategories(),
  ])
  const destaques = featured.length ? featured : all.slice(0, 8)
  return (
    <div>
      <section className="bg-[#0A0A0A] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-4xl text-[#E89BB0]">Nova Coleção</h1>
          <p className="mt-2 text-neutral-300">Estilo • Elegância • Confiança</p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-3 flex-wrap">
            {categories.filter((c) => !c.parentId).map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`}
                className="px-4 py-2 rounded-full border border-[#E89BB0] text-sm hover:bg-[#F3C6D3]">{c.name}</Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-serif text-2xl mb-6">Destaques</h2>
        {destaques.length === 0 ? (
          <p className="text-neutral-500">Em breve, novidades! 💕</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destaques.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}
